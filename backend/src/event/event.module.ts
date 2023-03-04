import { Module } from "@nestjs/common";
import { EventController } from "./event.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Event, EventSchema } from "./event.schema";
import { EventService } from "./event.service";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    UserModule,
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
