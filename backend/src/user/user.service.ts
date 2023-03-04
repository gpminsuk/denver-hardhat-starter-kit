import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AddUserDto, InviteUserDto } from "./user.dto";
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

  async inviteUser(email: string, inviteUserDto: InviteUserDto) {
    return await this.userModel.findOneAndUpdate(
      { email },
      { $push: { invitedAddresses: inviteUserDto.contractAddress } },
      { new: true }
    );
  }

  async getUserByDid(did: string) {
    return await this.userModel.findOne({ did });
  }

  async getUserById(id: string) {
    return await this.userModel.findOne({ id });
  }

  async getAwardCount() {}
}
