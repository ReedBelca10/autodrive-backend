"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./user.schema");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findAll() {
        return this.userModel.find({ isActive: { $ne: false } }).select('-password').lean();
    }
    async create(createUserDto) {
        const existing = await this.userModel.findOne({ email: createUserDto.email }).exec();
        if (existing)
            throw new common_1.ConflictException('Email déjà utilisé');
        const created = new this.userModel({
            ...createUserDto,
            password: createUserDto.password,
            role: createUserDto.role || 'client'
        });
        return (await created.save()).toObject();
    }
    async update(id, updateUserDto) {
        const updateData = {};
        Object.keys(updateUserDto).forEach(key => {
            updateData[key] = updateUserDto[key] !== undefined ? updateUserDto[key] : '';
        });
        const user = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password').lean();
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        return user;
    }
    async delete(id) {
        const result = await this.userModel.findByIdAndDelete(id).lean();
        if (!result)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        return { message: 'Utilisateur supprimé avec succès' };
    }
    async toggleStatus(id) {
        const user = await this.userModel.findById(id).lean();
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        const newStatus = !user.isActive;
        const updated = await this.userModel.findByIdAndUpdate(id, { isActive: newStatus }, { new: true }).select('-password').lean();
        return updated;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async findById(id) {
        const user = await this.userModel.findById(id).exec();
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        return user;
    }
    async setRefreshToken(userId, refreshToken) {
        const hashed = await bcrypt.hash(refreshToken, 10);
        await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashed }).exec();
    }
    async getUserIfRefreshTokenMatches(refreshToken, userId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user || !user.refreshToken)
            return null;
        const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
        return isMatch ? user : null;
    }
    async removeRefreshToken(userId) {
        await this.userModel.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } }).exec();
    }
    async setAvatarUrl(userId, url) {
        await this.userModel.findByIdAndUpdate(userId, { avatarUrl: url }).exec();
    }
    async setAvatarPath(userId, path) {
        await this.userModel.findByIdAndUpdate(userId, { avatarPath: path }).exec();
    }
    async findOrCreateFromSocial(profile) {
        if (!profile || !profile.email)
            throw new Error('Social profile missing email');
        let user = await this.userModel.findOne({ email: profile.email }).exec();
        if (user) {
            const update = {};
            if (profile.fullName && (!user.fullName || user.fullName !== profile.fullName))
                update.fullName = profile.fullName;
            if (profile.avatarUrl && (!user.avatarUrl || user.avatarUrl !== profile.avatarUrl))
                update.avatarUrl = profile.avatarUrl;
            if (Object.keys(update).length)
                await this.userModel.findByIdAndUpdate(user._id, update).exec();
            return this.userModel.findById(user._id).exec();
        }
        const created = new this.userModel({
            email: profile.email,
            fullName: profile.fullName || profile.email.split('@')[0],
            avatarUrl: profile.avatarUrl,
            role: 'user',
        });
        return created.save();
    }
    async getFavorites(userId) {
        const user = await this.userModel
            .findById(userId)
            .populate('favoriteVehicles')
            .select('favoriteVehicles')
            .exec();
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        return user.favoriteVehicles || [];
    }
    async addFavorite(userId, vehicleId) {
        const user = (await this.userModel.findById(userId).exec());
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        if (!user.favoriteVehicles) {
            user.favoriteVehicles = [];
        }
        const favs = user.favoriteVehicles;
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
    async removeFavorite(userId, vehicleId) {
        const user = (await this.userModel.findById(userId).exec());
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        let favs = user.favoriteVehicles;
        if (!favs) {
            favs = [];
        }
        user.favoriteVehicles = favs.filter(id => id.toString() !== vehicleId);
        await user.save();
        return {
            message: 'Véhicule supprimé des favoris',
            favoriteCount: user.favoriteVehicles.length,
            vehicleId
        };
    }
    async isFavorite(userId, vehicleId) {
        const user = (await this.userModel.findById(userId).exec());
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        const favs = user.favoriteVehicles;
        if (!favs) {
            return false;
        }
        return favs.some(id => id.toString() === vehicleId);
    }
    async setPasswordResetToken(userId, token, expiresInSeconds) {
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
        await this.userModel.findByIdAndUpdate(userId, {
            resetPasswordToken: token,
            resetPasswordExpires: expiresAt
        }).exec();
    }
    async findByResetToken(token) {
        return this.userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        }).exec();
    }
    async updatePassword(userId, hashedPassword) {
        await this.userModel.findByIdAndUpdate(userId, {
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined
        }).exec();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
