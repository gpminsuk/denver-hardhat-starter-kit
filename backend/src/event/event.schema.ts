import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop()
  id: string;

  @Prop()
  organizer: string;

  @Prop()
  address: string;

  @Prop()
  url: string;

  @Prop()
  awardedBadges: string[];

  @Prop()
  acceptedBadges: string[];

  @Prop()
  rejectedBadges: string[];
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({ id: 1 }, { unique: true });
EventSchema.index({ organizer: 1 });
EventSchema.index({ awardedBadges: 1 });
