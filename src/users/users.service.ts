import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: { fullName: string; email: string; password: string }) {
    const existing = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(createUserDto.password, 10);
    const created = new this.userModel({ ...createUserDto, password: hashed });
    return created.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async setRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashed }).exec();
  }
  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user || !user.refreshToken) return null;
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    return isMatch ? user : null;
  }

  async removeRefreshToken(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } }).exec();
  }

  async setAvatarUrl(userId: string, url: string) {
    await this.userModel.findByIdAndUpdate(userId, { avatarUrl: url }).exec();
  }

  async setAvatarPath(userId: string, path: string) {
    await this.userModel.findByIdAndUpdate(userId, { avatarPath: path }).exec();
  }
}
