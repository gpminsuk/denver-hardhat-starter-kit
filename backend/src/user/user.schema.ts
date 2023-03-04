import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop()
  did: string;

  @Prop()
  magicIdToken: string;

  @Prop()
  email: string;

  @Prop()
  publicAddress: string;

  @Prop()
  pendingBadages: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ did: 1 }, { unique: true });
