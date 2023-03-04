import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop()
  id: string;

  @Prop()
  organizer: string;

  @Prop()
  address: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  awardedBadges: Record<string, string>;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  acceptedBadges: Record<string, string>;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  rejectedBadges: Record<string, string>;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({ id: 1 }, { unique: true });
EventSchema.index({ organizer: 1 });
EventSchema.index({ awardedUsers: 1 });
