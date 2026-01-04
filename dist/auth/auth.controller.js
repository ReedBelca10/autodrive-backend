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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const class_validator_1 = require("class-validator");
const passport_1 = require("@nestjs/passport");
const supabase_client_1 = require("../utils/supabase.client");
const jwt_1 = require("@nestjs/jwt");
const crypto = require("crypto");
const users_service_1 = require("../users/users.service");
class RegisterDto {
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
class LoginDto {
}
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
let AuthController = AuthController_1 = class AuthController {
    constructor(authService, jwtService, usersService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.usersService = usersService;
    }
    async oauthStart(req, res) {
        const provider = req.params.provider;
        const frontend = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
        const baseUrl = process.env.BACKEND_ORIGIN || `http://localhost:${process.env.PORT || 3001}`;
        if (provider === 'google') {
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const redirect = `${baseUrl}/auth/oauth/google/callback`;
            const scope = encodeURIComponent('openid email profile');
            const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
            return res.redirect(url);
        }
        if (provider === 'facebook') {
            const clientId = process.env.FACEBOOK_CLIENT_ID;
            const redirect = `${baseUrl}/auth/oauth/facebook/callback`;
            const url = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&scope=email,public_profile`;
            return res.redirect(url);
        }
        if (provider === 'twitter') {
            const state = crypto.randomBytes(16).toString('hex');
            const codeVerifier = crypto.randomBytes(64).toString('hex');
            const hash = crypto.createHash('sha256').update(codeVerifier).digest();
            const codeChallenge = hash.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            AuthController_1.twitterPkce.set(state, codeVerifier);
            const clientId = process.env.TWITTER_CLIENT_ID;
            const redirect = `${baseUrl}/auth/oauth/twitter/callback`;
            const scope = encodeURIComponent('tweet.read users.read offline.access');
            const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&scope=${scope}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
            return res.redirect(url);
        }
        return res.status(400).send({ error: 'Unsupported provider' });
    }
    async googleCallback(req, res) {
        const code = req.query.code;
        const frontend = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
        const baseUrl = process.env.BACKEND_ORIGIN || `http://localhost:${process.env.PORT || 3001}`;
        try {
            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id: process.env.GOOGLE_CLIENT_ID || '',
                    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                    redirect_uri: `${baseUrl}/auth/oauth/google/callback`,
                    grant_type: 'authorization_code',
                }),
            });
            const tokenJson = await tokenRes.json();
            const accessToken = tokenJson.access_token;
            const profileRes = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
            const profile = await profileRes.json();
            const email = profile.email;
            const fullName = profile.name;
            const avatarUrl = profile.picture;
            const user = await this.usersService.findOrCreateFromSocial({ email, fullName, avatarUrl });
            const tokens = await this.authService.login(user);
            res.cookie('autodrive_token', tokens.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60,
                path: '/',
            });
            res.cookie('autodrive_refresh', tokens.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7,
                path: '/',
            });
            return res.redirect(frontend + '/');
        }
        catch (e) {
            console.warn('Google OAuth callback error', e);
            return res.redirect((process.env.FRONTEND_ORIGIN || 'http://localhost:3000') + '/login?error=oauth');
        }
    }
    async facebookCallback(req, res) {
        var _a, _b;
        const code = req.query.code;
        const frontend = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
        const baseUrl = process.env.BACKEND_ORIGIN || `http://localhost:${process.env.PORT || 3001}`;
        try {
            const tokenUrl = `https://graph.facebook.com/v16.0/oauth/access_token?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(baseUrl + '/auth/oauth/facebook/callback')}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&code=${encodeURIComponent(code)}`;
            const tokenRes = await fetch(tokenUrl);
            const tokenJson = await tokenRes.json();
            const accessToken = tokenJson.access_token;
            const profileRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.width(400).height(400)&access_token=${accessToken}`);
            const profile = await profileRes.json();
            const email = profile.email;
            const fullName = profile.name;
            const avatarUrl = (_b = (_a = profile.picture) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.url;
            const user = await this.usersService.findOrCreateFromSocial({ email, fullName, avatarUrl });
            const tokens = await this.authService.login(user);
            res.cookie('autodrive_token', tokens.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60,
                path: '/',
            });
            res.cookie('autodrive_refresh', tokens.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7,
                path: '/',
            });
            return res.redirect(frontend + '/');
        }
        catch (e) {
            console.warn('Facebook OAuth callback error', e);
            return res.redirect((process.env.FRONTEND_ORIGIN || 'http://localhost:3000') + '/login?error=oauth');
        }
    }
    async twitterCallback(req, res) {
        const code = req.query.code;
        const state = req.query.state;
        const frontend = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
        const baseUrl = process.env.BACKEND_ORIGIN || `http://localhost:${process.env.PORT || 3001}`;
        try {
            const codeVerifier = AuthController_1.twitterPkce.get(state);
            AuthController_1.twitterPkce.delete(state);
            if (!codeVerifier)
                throw new Error('PKCE code_verifier not found');
            const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    grant_type: 'authorization_code',
                    client_id: process.env.TWITTER_CLIENT_ID || '',
                    redirect_uri: `${baseUrl}/auth/oauth/twitter/callback`,
                    code_verifier: codeVerifier,
                }),
            });
            const tokenJson = await tokenRes.json();
            const accessToken = tokenJson.access_token;
            const profileRes = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const profileJson = await profileRes.json();
            const userData = profileJson.data || {};
            const email = (userData.username ? `${userData.username}@twitter.local` : undefined);
            const fullName = userData.name || userData.username;
            const avatarUrl = userData.profile_image_url;
            const user = await this.usersService.findOrCreateFromSocial({ email, fullName, avatarUrl });
            const tokens = await this.authService.login(user);
            res.cookie('autodrive_token', tokens.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60,
                path: '/',
            });
            res.cookie('autodrive_refresh', tokens.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7,
                path: '/',
            });
            return res.redirect(frontend + '/');
        }
        catch (e) {
            console.warn('Twitter OAuth callback error', e);
            return res.redirect((process.env.FRONTEND_ORIGIN || 'http://localhost:3000') + '/login?error=oauth');
        }
    }
    async register(dto, res) {
        try {
            const result = await this.authService.register(dto);
            const access = result.access_token;
            const refresh = result.refresh_token;
            if (access && refresh) {
                res.cookie('autodrive_token', access, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 1000 * 60 * 60,
                    path: '/',
                });
                res.cookie('autodrive_refresh', refresh, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 1000 * 60 * 60 * 24 * 7,
                    path: '/',
                });
            }
            return result.user || result;
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message || 'Registration failed');
        }
    }
    async login(dto, res) {
        const user = await this.authService.validateUser(dto.email, dto.password);
        if (!user)
            throw new common_1.BadRequestException('Invalid credentials');
        const tokenObj = await this.authService.login(user);
        const access = tokenObj.access_token;
        const refresh = tokenObj.refresh_token;
        res.cookie('autodrive_token', access, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60,
            path: '/',
        });
        res.cookie('autodrive_refresh', refresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: '/',
        });
        return { message: 'ok' };
    }
    async profile(req) {
        const user = req.user;
        const id = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!id)
            throw new common_1.BadRequestException('User not found');
        try {
            const dbUser = await this.usersService.findById(id);
            if (!dbUser)
                throw new common_1.NotFoundException('User not found in DB');
            if (dbUser.avatarPath && !dbUser.avatarUrl && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
                try {
                    console.log(`[auth.controller] Generating signed URL for user=${id}, avatarPath=${dbUser.avatarPath}`);
                    const { data: signedData, error: signedError } = await supabase_client_1.supabase.storage.from(process.env.SUPABASE_BUCKET).createSignedUrl(dbUser.avatarPath, 60 * 60);
                    if (signedError) {
                        console.warn('[auth.controller] createSignedUrl returned error:', signedError);
                    }
                    else {
                        dbUser.avatarUrl = (signedData === null || signedData === void 0 ? void 0 : signedData.signedUrl) || dbUser.avatarUrl;
                        console.log('[auth.controller] Signed URL generated for profile:', dbUser.avatarUrl);
                    }
                }
                catch (e) {
                    console.warn('[auth.controller] Error creating signed URL for profile:', (e === null || e === void 0 ? void 0 : e.message) || e);
                }
            }
            if (dbUser.avatarUrl) {
                const sep = dbUser.avatarUrl.includes('?') ? '&' : '?';
                const timestamp = Date.now();
                let url = dbUser.avatarUrl.replace(/[&?]v=\d+/, '');
                dbUser.avatarUrl = `${url}${sep}v=${timestamp}`;
            }
            return { user: dbUser };
        }
        catch (dbErr) {
            console.warn('[auth.controller] DB fetch failed for profile, returning minimal profile from JWT:', (dbErr === null || dbErr === void 0 ? void 0 : dbErr.message) || dbErr);
            const minimal = {
                _id: id,
                email: (user === null || user === void 0 ? void 0 : user.email) || null,
                fullName: (user === null || user === void 0 ? void 0 : user.email) ? (user.email.split('@')[0] || user.email) : undefined,
                avatarUrl: undefined,
            };
            return { user: minimal };
        }
    }
    async logout(req, res) {
        var _a;
        const refresh = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.autodrive_refresh;
        if (refresh) {
            try {
                const payload = this.jwtService.verify(refresh, { secret: process.env.JWT_SECRET || 'change_me' });
                const userId = payload.sub;
                await this.usersService.removeRefreshToken(userId);
            }
            catch (e) {
            }
        }
        res.clearCookie('autodrive_token', { path: '/' });
        res.clearCookie('autodrive_refresh', { path: '/' });
        return { message: 'logged out' };
    }
    async refresh(req, res) {
        var _a;
        const refresh = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.autodrive_refresh;
        if (!refresh)
            throw new common_1.BadRequestException('Refresh token missing');
        const tokens = await this.authService.refreshTokensUsing(refresh);
        res.cookie('autodrive_token', tokens.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60,
            path: '/',
        });
        res.cookie('autodrive_refresh', tokens.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: '/',
        });
        return { message: 'ok' };
    }
};
exports.AuthController = AuthController;
AuthController.twitterPkce = new Map();
__decorate([
    (0, common_1.Get)('oauth/:provider'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "oauthStart", null);
__decorate([
    (0, common_1.Get)('oauth/google/callback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleCallback", null);
__decorate([
    (0, common_1.Get)('oauth/facebook/callback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "facebookCallback", null);
__decorate([
    (0, common_1.Get)('oauth/twitter/callback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "twitterCallback", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "profile", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService, jwt_1.JwtService, users_service_1.UsersService])
], AuthController);
