"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const user_schema_1 = require("./schemas/user.schema");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(createUserDto) {
        const existing = await this.userModel.findOne({ email: createUserDto.email }).exec();
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        const hashed = await bcrypt.hash(createUserDto.password, 10);
        const created = new this.userModel({ ...createUserDto, password: hashed });
        return created.save();
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async findById(id) {
        const user = await this.userModel.findById(id).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
