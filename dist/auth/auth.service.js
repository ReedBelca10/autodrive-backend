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
const email_service_1 = require("../common/services/email.service");
const bcrypt = require("bcryptjs");
const jwt_1 = require("@nestjs/jwt");
const crypto = require("crypto");
const ACCESS_TOKEN_EXP = '1h';
const REFRESH_TOKEN_EXP = '7d';
let AuthService = class AuthService {
    constructor(usersService, jwtService, emailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.emailService = emailService;
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
                throw new common_1.ForbiddenException('Jeton de rafraîchissement non trouvé');
            const matches = await bcrypt.compare(refreshToken, user.refreshToken);
            if (!matches)
                throw new common_1.ForbiddenException('Le jeton de rafraîchissement ne correspond pas');
            const tokens = await this.getTokens(user);
            await this.usersService.setRefreshToken(userId, tokens.refreshToken);
            return { access_token: tokens.accessToken, refresh_token: tokens.refreshToken };
        }
        catch (err) {
            throw new common_1.ForbiddenException('Jeton de rafraîchissement invalide');
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
    async requestPasswordReset(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.BadRequestException('Aucun compte trouvé avec cet email');
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        await this.usersService.setPasswordResetToken(user._id, hashedToken, 3600);
        await this.emailService.sendPasswordResetEmail(user.email, user.fullName, resetToken);
        return { message: 'Email de réinitialisation envoyé' };
    }
    async resetPassword(resetToken, newPassword) {
        if (!resetToken || !newPassword) {
            throw new common_1.BadRequestException('Token et mot de passe sont requis');
        }
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const user = (await this.usersService.findByResetToken(hashedToken));
        if (!user) {
            throw new common_1.BadRequestException('Lien de réinitialisation invalide ou expiré');
        }
        if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new common_1.BadRequestException('Lien de réinitialisation expiré');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.updatePassword(user._id, hashedPassword);
        await this.emailService.sendPasswordChangeConfirmation(user.email, user.fullName);
        return { message: 'Mot de passe réinitialisé avec succès' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
