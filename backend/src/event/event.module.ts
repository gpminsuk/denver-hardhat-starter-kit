import { Module } from "@nestjs/common";
import { EventController } from "./event.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Event, EventSchema } from "./event.schema";
import { EventService } from "./event.service";
import { User, UserSchema } from "src/user/user.schema";
import { AzureStorageModule } from "@nestjs/azure-storage";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AzureStorageModule.withConfig({
      sasKey: process.env.AZURE_STORAGE_SAS_KEY,
      accountName: process.env.AZURE_STORAGE_ACCOUNT,
      containerName: "vor",
    }),
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
