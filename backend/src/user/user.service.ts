import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AddUserDto, QueueAwardDto } from "./user.dto";
import Web3 from "web3";
import { User, UserDocument } from "./user.schema";
import _ from "lodash";
import fs from "fs";
import { EventService } from "src/event/event.service";
import { Magic } from "@magic-sdk/admin";

@Injectable()
export class UserService {
  magic: Magic;
  web3: Web3;
  VOREvent: any;

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private eventService: EventService
  ) {
    this.magic = new Magic(process.env.MAGIC_SECRET_KEY);
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

  async getUserByDid(did: string) {
    const user = await this.userModel.findOne({ did }).lean();
    if (user) {
      const awardedEvents = await this.eventService.getAwardedEvents(
        user.email
      );
      const acceptedEvents = await this.eventService.getAcceptedEvents(
        user.email
      );
      return { ...user, awardedEvents, acceptedEvents };
    }
    return user;
  }

  async getUserById(id: string) {
    const user = await this.userModel.findOne({ id }).lean();
    if (user) {
      const awardedEvents = await this.eventService.getAwardedEvents(
        user.email
      );
      const acceptedEvents = await this.eventService.getAcceptedEvents(
        user.email
      );
      return { ...user, awardedEvents, acceptedEvents };
    }
    return user;
  }

  async getUsers(emails: string[]) {
    return await this.userModel
      .find({ email: { $in: emails }, publicAddress: { $exists: true } })
      .lean();
  }

  async queueAward(body: QueueAwardDto) {
    for (const assignment of body.assignments) {
      await this.userModel.findOneAndUpdate(
        { email: assignment.email },
        { $push: { pendingBadages: assignment.tokenId } }
      );
    }
  }

  async getAwardCount() {}
}
