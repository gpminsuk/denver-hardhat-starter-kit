import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

export enum Kind {
  Organization,
  User,
}

@Schema({ timestamps: true })
export class User {
  @Prop()
  did: string;

  @Prop()
  magicIdToken: string;

  @Prop()
  kind: Kind;

  @Prop()
  email: string;

  @Prop()
  publicAddress: string;

  @Prop()
  ongoingEvents: string[];

  @Prop()
  futureEvents: string[];

  @Prop()
  pastEvents: string[];

  @Prop()
  invitedAddresses: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ did: 1 }, { unique: true });
