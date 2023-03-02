import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AddEventDto, AddUserDto, InviteUserDto } from "./user.dto";
import Web3 from "web3";
import { User, UserDocument } from "./user.schema";
import _ from "lodash";
import fs from "fs";

@Injectable()
export class UserService {
  web3: Web3;
  VOREvent: any;

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>
  ) {
    this.VOREvent = JSON.parse(
      fs
        .readFileSync("../build/artifacts/contracts/VOREvent.sol/VOREvent.json")
        .toString()
    );
    this.web3 = new Web3(
      "https://polygon-mumbai.g.alchemy.com/v2/-CuvhStLwPmHVIZ4SlJrmJ2ZLploxpJd"
    );
  }

  async addUser(addUserDto: AddUserDto) {
    return await this.userModel.findOneAndUpdate(
      { email: addUserDto.email },
      {
        $set: {
          did: addUserDto.did,
          magicIdToken: addUserDto.magicIdToken,
          publicAddress: addUserDto.publicAddress,
        },
      },
      { upsert: true, new: true }
    );
  }

  async addEvent(email: string, addEventDto: AddEventDto) {
    return await this.userModel.findOneAndUpdate(
      { email },
      { $push: { eventAddresses: addEventDto.contractAddress } },
      { new: true }
    );
  }

  async getEventFromAddress(address: string) {
    const contract = new this.web3.eth.Contract(
      this.VOREvent.abi as any,
      "0x52DFc252Ce40ae2959174DE03060064d13CFC2f0"
    );
    const state = await contract.methods.state().call();
    const startedTime = await contract.methods.startedTime().call();
    const endedTime = await contract.methods.endedTime().call();
    const description = await contract.methods.description().call();
    const issuer = await contract.methods.issuer().call();

    return {
      name: "Event",
      state,
      startedTime,
      endedTime,
      description,
      issuer,
    };
  }

  async getEvents(email: string) {
    const user = await this.userModel.findOne({ email });
    const res = { ongoing: [], future: [], past: [] };
    for (const address of user.ongoingEvents) {
      const event = await this.getEventFromAddress(address);
      if (
        event.issuer &&
        _.toLower(event.issuer) !== _.toLower(user.publicAddress)
      ) {
        console.error(
          "You are not the issuer of this event",
          _.toLower(event.issuer),
          _.toLower(user.publicAddress)
        );
      }
      res.ongoing.push(event);
      break;
    }
    for (const address of user.futureEvents) {
      const event = await this.getEventFromAddress(address);
      if (
        event.issuer &&
        _.toLower(event.issuer) !== _.toLower(user.publicAddress)
      ) {
        console.error(
          "You are not the issuer of this event",
          _.toLower(event.issuer),
          _.toLower(user.publicAddress)
        );
      }
      res.future.push(event);
      break;
    }
    for (const address of user.pastEvents) {
      const event = await this.getEventFromAddress(address);
      if (
        event.issuer &&
        _.toLower(event.issuer) !== _.toLower(user.publicAddress)
      ) {
        console.error(
          "You are not the issuer of this event",
          _.toLower(event.issuer),
          _.toLower(user.publicAddress)
        );
      }
      res.past.push(event);
      break;
    }
    return res;
  }

  async inviteUser(email: string, inviteUserDto: InviteUserDto) {
    return await this.userModel.findOneAndUpdate(
      { email },
      { $push: { invitedAddresses: inviteUserDto.contractAddress } },
      { new: true }
    );
  }

  async getUser(email: string) {
    return await this.userModel.findOne({ email });
  }

  async getAwardCount() {}
}
