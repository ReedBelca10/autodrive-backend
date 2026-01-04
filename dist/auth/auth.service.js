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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcryptjs");
const jwt_1 = require("@nestjs/jwt");
const ACCESS_TOKEN_EXP = '1h';
const REFRESH_TOKEN_EXP = '7d';
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findByEmail(email);
        if (!user)
            return null;
        const match = await bcrypt.compare(pass, user.password);
        if (match) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }
    async getTokens(user) {
        const payload = { sub: user._id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXP });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: REFRESH_TOKEN_EXP });
        return { accessToken, refreshToken };
    }
    async login(user) {
        const tokens = await this.getTokens(user);
        await this.usersService.setRefreshToken(user._id, tokens.refreshToken);
        return { access_token: tokens.accessToken, refresh_token: tokens.refreshToken };
    }
    async register(createUserDto) {
        const user = await this.usersService.create(createUserDto);
        const tokens = await this.getTokens(user);
        await this.usersService.setRefreshToken(user._id, tokens.refreshToken);
        const { password, ...rest } = user.toObject();
        return { user: rest, access_token: tokens.accessToken, refresh_token: tokens.refreshToken };
    }
    async refreshTokensUsing(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_SECRET || 'change_me' });
            const userId = payload.sub;
            const user = await this.usersService.findById(userId);
            if (!user || !user.refreshToken)
                throw new common_1.ForbiddenException('Refresh token not found');
            const matches = await bcrypt.compare(refreshToken, user.refreshToken);
            if (!matches)
                throw new common_1.ForbiddenException('Refresh token does not match');
            const tokens = await this.getTokens(user);
            await this.usersService.setRefreshToken(userId, tokens.refreshToken);
            return { access_token: tokens.accessToken, refresh_token: tokens.refreshToken };
        }
        catch (err) {
            throw new common_1.ForbiddenException('Invalid refresh token');
        }
    }
    async logoutRefreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_SECRET || 'change_me' });
            const userId = payload.sub;
            await this.usersService.removeRefreshToken(userId);
        }
        catch (err) {
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService, jwt_1.JwtService])
], AuthService);
