import { Module } from "@nestjs/common";
import { EventController } from "./event.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Event, EventSchema } from "./event.schema";
import { EventService } from "./event.service";
import { User, UserSchema } from "src/user/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
