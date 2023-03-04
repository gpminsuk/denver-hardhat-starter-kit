import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Event, EventDocument } from "./event.schema";
import Web3 from "web3";
import fs from "fs";
import _ from "lodash";
import { nanoid } from "nanoid";
import bluebird from "bluebird";
import { AddBadgeDto, AddEventDto } from "./event.dto";
import { UserService } from "src/user/user.service";
import { Magic } from "@magic-sdk/admin";

@Injectable()
export class EventService {
  magic: Magic;
  web3: Web3;
  magicWeb3: Web3;
  VOREvent: any;

  constructor(
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>,
    private userService: UserService
  ) {
    this.magic = new Magic(process.env.MAGIC_SECRET_KEY);
    this.VOREvent = JSON.parse(
      fs
        .readFileSync("../build/artifacts/contracts/VOREvent.sol/VOREvent.json")
        .toString()
    );
    this.web3 = new Web3(
      "https://eth-goerli.g.alchemy.com/v2/XPkPPwpNYWgoobCevUlXSq-sz6av9RNm"
    );
    // @ts-ignore
    this.magicWeb3 = new Web3(this.magic.rpcProvider);
  }

  async getEventFromAddress(address: string, tokenIds: number[]) {
    const contract = new this.web3.eth.Contract(
      this.VOREvent.abi as any,
      address
    );
    const description = await contract.methods.description().call();
    const issuer = await contract.methods.issuer().call();
    const badges = await contract.methods.getBadges(tokenIds).call();

    return {
      address,
      name: "Event",
      description,
      issuer,
      badges,
    };
  }

  async getEvents(organizer: string) {
    const events = await this.eventModel.find({ organizer }).lean();
    return await bluebird.map(events, async (event) => ({
      ...event,
      ...(await this.getEventFromAddress(event.address, event.badges)),
    }));
  }

  async getEvent(id: string) {
    const event = await this.eventModel.findOne({ id }).lean();
    return {
      ...event,
      ...(await this.getEventFromAddress(event.address, event.badges)),
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

  async addBadge(id: string, organizer: string, body: AddBadgeDto) {
    const event = await this.eventModel.findOne({ id, organizer });
    const user = await this.userService.getUserById(organizer);
    console.log(id, organizer, event, user, { id, organizer });
    const tokenId = event.badges.length + 1;
    const contract = new this.web3.eth.Contract(
      this.VOREvent.abi as any,
      event.address
    );
    const txObject = {
      from: user.publicAddress,
      to: event.address,
      value: contract.methods
        .addBadges([body.title], [body.description], [tokenId])
        .encodeABI(),
    };
    console.log(1);
    const signedTx = await this.web3.eth.signTransaction(txObject);
    const receipt = await this.web3.eth.sendSignedTransaction(signedTx.raw);
    console.log(signedTx, receipt);
    /*
    this.magic.rpcProvider.
    const params = [user.publicAddress, signTypedDataV4Payload];
    const method = "eth_signTypedData_v3";
    const signature = await m.rpcProvider.request({
      jsonrpc: "2.0",
      method,
      params,
    });
    console.log("signature", signature);
    await contract.methods
      .addBadges([body.title], [body.description], [tokenId])
      .send({ from: user.publicAddress });
    return await this.eventModel.findOneAndUpdate(
      { id, organizer },
      { $push: { badges: tokenId } },
      { new: true }
    );*/
  }

  async removeBadge(address: string, tokenId: string) {
    return await this.eventModel.findOneAndUpdate(
      { address: address },
      { $pull: { badges: tokenId } },
      { new: true }
    );
  }
}
