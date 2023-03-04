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
  badges: number[];
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({ id: 1 }, { unique: true });
EventSchema.index({ organizer: 1 });
