import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Event, EventDocument } from "./event.schema";
import Web3 from "web3";
import fs from "fs";
import axios from "axios";
import _ from "lodash";
import FormData from "form-data";
import { nanoid } from "nanoid";
import bluebird from "bluebird";
import { AddEventDto } from "./event.dto";
import { Magic } from "@magic-sdk/admin";
import { User, UserDocument } from "src/user/user.schema";

@Injectable()
export class EventService {
  magic: Magic;
  web3: Web3;
  VOREvent: any;

  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>
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

  async getEventFromAddress(address: string) {
    const contract = new this.web3.eth.Contract(
      this.VOREvent.abi as any,
      address
    );
    const name = await contract.methods.name().call();
    const description = await contract.methods.description().call();
    const issuer = await contract.methods.issuer().call();
    const badges = await contract.methods.getBadges().call();

    const users = await this.userModel.find({
      publicAddress: { $in: badges.map((badge) => badge.recipient) },
    });
    const usersMap = _.keyBy(users, (e) => e.publicAddress);
    return {
      address,
      name,
      description,
      issuer,
      badges: _.values(
        _.groupBy(
          await bluebird.map(
            badges,
            async ([state, recipient, name, description, group], tokenId) => {
              const tokenURI = await contract.methods
                .tokenURI(tokenId + 1)
                .call();
              return {
                tokenId: tokenId + 1,
                state,
                email: usersMap[recipient]?.email,
                recipient,
                name,
                description,
                group,
                tokenURI,
              };
            }
          ),
          (badge) => badge.group
        )
      ),
    };
  }

  async getEvents(organizer: string) {
    const events = await this.eventModel.find({ organizer }).lean();
    console.log(events, organizer);
    return await bluebird.map(events, async (event) => ({
      ...event,
      ...(await this.getEventFromAddress(event.address)),
    }));
  }

  async getEvent(id: string) {
    const event = await this.eventModel.findOne({ id }).lean();
    return {
      ...event,
      ...(await this.getEventFromAddress(event.address)),
    };
  }

  async addEvent(organizer: string, addEventDto: AddEventDto) {
    return await this.eventModel.findOneAndUpdate(
      { address: addEventDto.address },
      {
        $setOnInsert: { id: nanoid() },
        $set: { organizer, badges: addEventDto.badges },
      },
      { upsert: true, new: true }
    );
  }

  async removeBadge(address: string, tokenId: string) {
    return await this.eventModel.findOneAndUpdate(
      { address: address },
      { $pull: { badges: tokenId } },
      { new: true }
    );
  }

  async getAwardedEvents(email: string) {
    return await bluebird.map(
      await this.eventModel.find({
        awardedBadges: new RegExp(`${email}$`),
      }),
      async (event) => {
        event = await this.getEvent(event.id);
        event.awardedBadges = _.flatten(_.values(event.badges)).filter(
          (badge) => badge.email === email && badge.state === "2"
        );
        return event;
      }
    );
  }

  async getAcceptedEvents(email: string) {
    return await bluebird.map(
      await this.eventModel.find({
        acceptedBadges: new RegExp(`${email}$`),
      }),
      async (event) => {
        event = await this.getEvent(event.id);
        event.acceptedBadges = _.flatten(_.values(event.badges)).filter(
          (badge) => badge.email === email && badge.state === "3"
        );
        return event;
      }
    );
  }

  async awardBadge(
    organizer: string,
    id: string,
    tokenId: string,
    email: string
  ) {
    await this.eventModel.findOneAndUpdate(
      { id, organizer },
      { $addToSet: { awardedBadges: `${tokenId}:${email}` } },
      { new: true }
    );
    return await this.userModel.findOne({ email });
  }

  async acceptBadge(id: string, tokenId: string, email: string) {
    return await this.eventModel.findOneAndUpdate(
      { id, awardedBadges: `${tokenId}:${email}` },
      {
        $pull: { awardedBadges: `${tokenId}:${email}` },
        $addToSet: { acceptedBadges: `${tokenId}:${email}` },
      },
      { new: true }
    );
  }

  async rejectBadge(id: string, tokenId: string, email: string) {
    return await this.eventModel.findOneAndUpdate(
      { id, awardedBadges: `${tokenId}:${email}` },
      {
        $pull: { awardedBadges: `${tokenId}:${email}` },
        $addToSet: { rejectedBadges: `${tokenId}:${email}` },
      },
      { new: true }
    );
  }

  async getAwardedBadges(userId: string) {
    return await this.eventModel.find({ awardedUsers: { $in: userId } });
  }

  async uploadBadgeAttachment(file: Express.Multer.File) {
    const form = new FormData();
    form.append("path", file.buffer);
    const {
      data: { Name },
    } = await axios.post(`https://ipfs.infura.io:5001/api/v0/add`, form, {
      headers: {
        Authorization: `Basic ${process.env.INFURA_IPFS_KEY}`,
      },
    });
    return Name;
  }
}
