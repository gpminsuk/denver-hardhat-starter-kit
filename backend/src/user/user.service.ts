import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AddEventDto, AddUserDto, InviteUserDto } from "./user.dto";
import { User, UserDocument } from "./user.schema";
import _ from "lodash";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>
  ) {}

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
