import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ 
    type: String,
    enum: ['admin', 'manager', 'client'],
    default: 'client'
  })
  role: string;

  @Prop({ default: '' })
  avatarPath: string;

  @Prop({ default: '' })
  avatarUrl: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ select: false })
  refreshToken?: string;

  @Prop({ 
    type: [MongooseSchema.Types.ObjectId], 
    ref: 'Vehicle',
    default: []
  })
  favoriteVehicles: MongooseSchema.Types.ObjectId[];

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hache le mot de passe avant la sauvegarde
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});