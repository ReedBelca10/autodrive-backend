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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const stream_1 = require("stream");
const users_service_1 = require("./users.service");
const passport_1 = require("@nestjs/passport");
const admin_guard_1 = require("../common/guards/admin.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer = require("multer");
const supabase_client_1 = require("../utils/supabase.client");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async proxyAvatar(req, res) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            return res.status(400).send('Utilisateur non trouvé');
        let dbUser;
        try {
            dbUser = await this.usersService.findById(userId);
        }
        catch (e) {
            return res.status(404).send('Utilisateur non trouvé');
        }
        const avatarPath = dbUser === null || dbUser === void 0 ? void 0 : dbUser.avatarPath;
        if (!avatarPath)
            return res.status(404).send('Avatar non défini');
        const bucket = process.env.SUPABASE_BUCKET || 'avatars';
        try {
            const expiresIn = 60;
            const { data: signedData, error: signedError } = await supabase_client_1.supabase.storage.from(bucket).createSignedUrl(avatarPath, expiresIn);
            if (signedError || !(signedData === null || signedData === void 0 ? void 0 : signedData.signedUrl)) {
                console.warn('[users.controller] createSignedUrl a échoué, retour à l\'URL publique ou au téléchargement', signedError);
                try {
                    const { data: pub } = supabase_client_1.supabase.storage.from(bucket).getPublicUrl(avatarPath);
                    if (pub && pub.publicUrl) {
                        const fetchRes = await fetch(pub.publicUrl);
                        if (!fetchRes.ok)
                            return res.status(502).send('Impossible de récupérer l\'avatar');
                        res.setHeader('Content-Type', fetchRes.headers.get('content-type') || 'application/octet-stream');
                        try {
                            const body = fetchRes.body;
                            if (body && typeof body.pipe === 'function') {
                                return body.pipe(res);
                            }
                            if (body && typeof stream_1.Readable.fromWeb === 'function' && typeof body.getReader === 'function') {
                                const nodeStream = stream_1.Readable.fromWeb(body);
                                return nodeStream.pipe(res);
                            }
                            const buf = Buffer.from(await fetchRes.arrayBuffer());
                            return res.send(buf);
                        }
                        catch (e) {
                            const buf = Buffer.from(await fetchRes.arrayBuffer());
                            return res.send(buf);
                        }
                    }
                }
                catch (e) {
                    console.warn('[users.controller] le secours getPublicUrl a échoué', (e === null || e === void 0 ? void 0 : e.message) || e);
                }
                return res.status(502).send('Impossible de générer l\'URL de l\'avatar');
            }
            const proxied = await fetch(signedData.signedUrl);
            if (!proxied.ok)
                return res.status(502).send('Impossible de récupérer l\'avatar');
            res.setHeader('Content-Type', proxied.headers.get('content-type') || 'application/octet-stream');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            try {
                const body = proxied.body;
                if (body && typeof body.pipe === 'function') {
                    return body.pipe(res);
                }
                if (body && typeof stream_1.Readable.fromWeb === 'function' && typeof body.getReader === 'function') {
                    const nodeStream = stream_1.Readable.fromWeb(body);
                    return nodeStream.pipe(res);
                }
                const buf = Buffer.from(await proxied.arrayBuffer());
                return res.send(buf);
            }
            catch (e) {
                const buf = Buffer.from(await proxied.arrayBuffer());
                return res.send(buf);
            }
        }
        catch (e) {
            console.error('[users.controller] erreur proxyAvatar', (e === null || e === void 0 ? void 0 : e.message) || e);
            return res.status(500).send('Erreur serveur');
        }
    }
    async getFavorites(req) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        return await this.usersService.getFavorites(userId);
    }
    async addFavorite(req, vehicleId) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        return await this.usersService.addFavorite(userId, vehicleId);
    }
    async removeFavorite(req, vehicleId) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        return await this.usersService.removeFavorite(userId, vehicleId);
    }
    async isFavorite(req, vehicleId) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        const isFav = await this.usersService.isFavorite(userId, vehicleId);
        return { isFavorite: isFav };
    }
    async getUser(id) {
        const user = await this.usersService.findById(id);
        const { password, ...rest } = user.toObject();
        return rest;
    }
    async getAllUsers() {
        return this.usersService.findAll();
    }
    async createUser(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    async updateUser(id, updateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
    async toggleUserStatus(id) {
        return this.usersService.toggleStatus(id);
    }
    async deleteUser(id) {
        return this.usersService.delete(id);
    }
    async uploadAvatar(req, file) {
        if (!file) {
            console.warn('[users.controller] uploadAvatar appelé sans fichier');
            throw new common_1.BadRequestException('Aucun fichier téléchargé');
        }
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé dans la requête');
        console.log(`[users.controller] uploadAvatar start pour user=${userId}, filename=${file.originalname}, size=${file.size}`);
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.mimetype)) {
            console.warn(`[users.controller] Type de fichier invalide: ${file.mimetype}`);
            throw new common_1.BadRequestException('Type de fichier invalide. Seuls JPEG, PNG, WebP et GIF sont autorisés.');
        }
        if (!supabase_client_1.supabase)
            throw new common_1.BadRequestException('Client Supabase non configuré');
        const bucket = process.env.SUPABASE_BUCKET || 'avatars';
        const timestamp = Date.now();
        const sanitizedName = file.originalname
            .replace(/[^a-zA-Z0-9.\-_]/g, '_')
            .replace(/_{2,}/g, '_')
            .toLowerCase();
        const filename = `${userId}/${timestamp}-${sanitizedName}`;
        const { data, error } = await supabase_client_1.supabase.storage.from(bucket).upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (error) {
            console.error('[users.controller] Erreur de téléchargement Supabase:', error);
            throw new common_1.BadRequestException('Échec du téléchargement vers le stockage: ' + error.message);
        }
        console.log('[users.controller] Succès du téléchargement Supabase:', { bucket, filename, data });
        let previousAvatarPath = undefined;
        try {
            const dbUser = await this.usersService.findById(userId);
            previousAvatarPath = dbUser === null || dbUser === void 0 ? void 0 : dbUser.avatarPath;
        }
        catch (e) {
            console.warn('[users.controller] Impossible de récupérer l\'utilisateur avant de stocker avatarPath:', (e === null || e === void 0 ? void 0 : e.message) || e);
        }
        await this.usersService.setAvatarPath(userId, filename);
        console.log(`[users.controller] avatarPath stocké=${filename} pour user=${userId}`);
        let resultUrl = undefined;
        try {
            const { data: urlData } = supabase_client_1.supabase.storage.from(bucket).getPublicUrl(filename);
            if (urlData && urlData.publicUrl) {
                resultUrl = urlData.publicUrl;
                console.log('[users.controller] URL publique disponible pour l\'avatar:', resultUrl);
            }
        }
        catch (e) {
            console.warn('[users.controller] erreur getPublicUrl ou non disponible:', (e === null || e === void 0 ? void 0 : e.message) || e);
        }
        if (!resultUrl) {
            const expiresIn = 60 * 60;
            const { data: signedData, error: signedError } = await supabase_client_1.supabase.storage.from(bucket).createSignedUrl(filename, expiresIn);
            if (signedError) {
                console.error('[users.controller] erreur createSignedUrl:', signedError);
                resultUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
            }
            else {
                resultUrl = (signedData === null || signedData === void 0 ? void 0 : signedData.signedUrl) || `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
                console.log('[users.controller] URL signée créée pour l\'avatar:', resultUrl);
            }
        }
        await this.usersService.setAvatarUrl(userId, resultUrl || '');
        await this.usersService.setAvatarPath(userId, filename);
        console.log(`[users.controller] uploadAvatar terminé pour user=${userId}, avatarUrl=${resultUrl}`);
        if (previousAvatarPath && previousAvatarPath !== filename) {
            try {
                const { error: removeError } = await supabase_client_1.supabase.storage.from(bucket).remove([previousAvatarPath]);
                if (removeError) {
                    console.warn('[users.controller] Impossible de supprimer l\'ancien avatar du stockage:', removeError);
                }
                else {
                    console.log('[users.controller] Ancien avatar supprimé du stockage:', previousAvatarPath);
                }
            }
            catch (e) {
                console.warn('[users.controller] Exception lors de la suppression de l\'ancien avatar:', (e === null || e === void 0 ? void 0 : e.message) || e);
            }
        }
        const responseBody = { avatarUrl: resultUrl, avatarPath: filename };
        if (previousAvatarPath && previousAvatarPath !== filename)
            responseBody.removedPath = previousAvatarPath;
        return responseBody;
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('avatar'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "proxyAvatar", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('favorites'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFavorites", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('favorites/:vehicleId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addFavorite", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Delete)('favorites/:vehicleId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeFavorite", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('favorites/:vehicleId/check'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "isFavorite", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUser", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "toggleUserStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 5 * 1024 * 1024,
        }
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
