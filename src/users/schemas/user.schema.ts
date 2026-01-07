import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  phone?: string;

  @Prop({ default: '' })
  address?: string;

  @Prop()
  role?: string;

  @Prop()
  refreshToken?: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  avatarPath?: string;

  @Prop({ default: true })
  isActive?: boolean;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Vehicle' }], default: [] })
  favoriteVehicles: MongooseSchema.Types.ObjectId[];

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
