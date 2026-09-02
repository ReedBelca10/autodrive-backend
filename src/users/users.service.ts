import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async findAll() {
    // Return all users except those with isActive explicitly set to false
    return this.userModel.find({ isActive: { $ne: false } }).select('-password').lean();
  }

  async create(createUserDto: { fullName: string; email: string; password: string; phone?: string; address?: string; role?: string }) {
    const existing = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existing) throw new ConflictException('Email déjà utilisé');

    const created = new this.userModel({
      ...createUserDto,
      password: createUserDto.password,
      role: createUserDto.role || 'client'
    });
    return (await created.save()).toObject();
  }

  async update(id: string, updateUserDto: any) {
    // Filter out undefined/null values and ensure all fields are saved
    const updateData: any = {};

    Object.keys(updateUserDto).forEach(key => {
      // Always set the value, even if empty string, to ensure fields are added for existing users
      updateData[key] = updateUserDto[key] !== undefined ? updateUserDto[key] : '';
    });

    const user = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password').lean();
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  async delete(id: string) {
    // Hard delete - remove completely from database
    const result = await this.userModel.findByIdAndDelete(id).lean();
    if (!result) throw new NotFoundException('Utilisateur non trouvé');
    return { message: 'Utilisateur supprimé avec succès' };
  }

  async toggleStatus(id: string) {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const newStatus = !user.isActive;
    const updated = await this.userModel.findByIdAndUpdate(id, { isActive: newStatus }, { new: true }).select('-password').lean();
    return updated;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
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

  async findOrCreateFromSocial(profile: { email?: string; fullName?: string; avatarUrl?: string }) {
    if (!profile || !profile.email) throw new Error('Social profile missing email');
    let user = await this.userModel.findOne({ email: profile.email }).exec();
    if (user) {
      // update avatar/fullName if missing
      const update: any = {};
      if (profile.fullName && (!user.fullName || user.fullName !== profile.fullName)) update.fullName = profile.fullName;
      if (profile.avatarUrl && (!user.avatarUrl || user.avatarUrl !== profile.avatarUrl)) update.avatarUrl = profile.avatarUrl;
      if (Object.keys(update).length) await this.userModel.findByIdAndUpdate(user._id, update).exec();
      return this.userModel.findById(user._id).exec();
    }

    // create a user without password (social-only)
    const created = new this.userModel({
      email: profile.email,
      fullName: profile.fullName || profile.email.split('@')[0],
      avatarUrl: profile.avatarUrl,
      // mark as social account
      role: 'user',
    });
    return created.save();
  }

  // ========== FAVORIS ==========
  async getFavorites(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('favoriteVehicles')
      .select('favoriteVehicles')
      .exec() as UserDocument;
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return (user as any).favoriteVehicles || [];
  }

  async addFavorite(userId: string, vehicleId: string) {
    const user = (await this.userModel.findById(userId).exec()) as UserDocument;
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    // Vérifier si le véhicule est déjà en favoris
    if (!(user as any).favoriteVehicles) {
      (user as any).favoriteVehicles = [];
    }

    const favs = (user as any).favoriteVehicles as any[];
    const isAlreadyFavorite = favs.some(id => id.toString() === vehicleId);
    if (isAlreadyFavorite) {
      return { message: 'Véhicule déjà en favoris', favoriteCount: favs.length };
    }

    favs.push(vehicleId);
    await user.save();

    return {
      message: 'Véhicule ajouté aux favoris',
      favoriteCount: favs.length,
      vehicleId
    };
  }

  async removeFavorite(userId: string, vehicleId: string) {
    const user = (await this.userModel.findById(userId).exec()) as UserDocument;
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    let favs = (user as any).favoriteVehicles as any[];
    if (!favs) {
      favs = [];
    }

    (user as any).favoriteVehicles = favs.filter(id => id.toString() !== vehicleId);
    await user.save();

    return {
      message: 'Véhicule supprimé des favoris',
      favoriteCount: (user as any).favoriteVehicles.length,
      vehicleId
    };
  }

  async isFavorite(userId: string, vehicleId: string): Promise<boolean> {
    const user = (await this.userModel.findById(userId).exec()) as UserDocument;
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const favs = (user as any).favoriteVehicles as any[];
    if (!favs) {
      return false;
    }

    return favs.some(id => id.toString() === vehicleId);
  }

  async setPasswordResetToken(userId: string, token: string, expiresInSeconds: number) {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    await this.userModel.findByIdAndUpdate(
      userId,
      {
        resetPasswordToken: token,
        resetPasswordExpires: expiresAt
      }
    ).exec();
  }

  async findByResetToken(token: string) {
    return this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    }).exec();
  }

  async updatePassword(userId: string, hashedPassword: string) {
    await this.userModel.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined
      }
    ).exec();
  }
}
