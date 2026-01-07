import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EmailService } from '../common/services/email.service';
import { UserDocument } from '../users/schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

const ACCESS_TOKEN_EXP = '1h';
const REFRESH_TOKEN_EXP = '7d';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password);
    if (match) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async getTokens(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXP });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: REFRESH_TOKEN_EXP });
    return { accessToken, refreshToken };
  }

  async login(user: any) {
    const tokens = await this.getTokens(user);
    // stocker le jeton de rafraîchissement haché
    await this.usersService.setRefreshToken(user._id, tokens.refreshToken);
    return { access_token: tokens.accessToken, refresh_token: tokens.refreshToken };
  }

  async register(createUserDto: { fullName: string; email: string; password: string }) {
    const user = await this.usersService.create(createUserDto);
    // générer les jetons et stocker le jeton de rafraîchissement
    const tokens = await this.getTokens(user);
    await this.usersService.setRefreshToken(user._id, tokens.refreshToken);
    const { password, ...rest } = user.toObject();
    return { user: rest, access_token: tokens.accessToken, refresh_token: tokens.refreshToken };
  }

  async refreshTokensUsing(refreshToken: string) {
    try {
      const payload: any = this.jwtService.verify(refreshToken, { secret: process.env.JWT_SECRET || 'change_me' });
      const userId = payload.sub;
      const user = await this.usersService.findById(userId);
      if (!user || !user.refreshToken) throw new ForbiddenException('Jeton de rafraîchissement non trouvé');
      const matches = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!matches) throw new ForbiddenException('Le jeton de rafraîchissement ne correspond pas');
      const tokens = await this.getTokens(user);
      await this.usersService.setRefreshToken(userId, tokens.refreshToken);
      return { access_token: tokens.accessToken, refresh_token: tokens.refreshToken };
    } catch (err) {
      throw new ForbiddenException('Jeton de rafraîchissement invalide');
    }
  }

  async logoutRefreshToken(refreshToken: string) {
    try {
      const payload: any = this.jwtService.verify(refreshToken, { secret: process.env.JWT_SECRET || 'change_me' });
      const userId = payload.sub;
      await this.usersService.removeRefreshToken(userId);
    } catch (err) {
      // ignorer le jeton invalide
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Aucun compte trouvé avec cet email');
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Sauvegarder le token haché et l'expiration (1 heure)
    await this.usersService.setPasswordResetToken(user._id, hashedToken, 3600);

    // Envoyer l'email
    await this.emailService.sendPasswordResetEmail(user.email, user.fullName, resetToken);

    return { message: 'Email de réinitialisation envoyé' };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    if (!resetToken || !newPassword) {
      throw new BadRequestException('Token et mot de passe sont requis');
    }

    // Hasher le token reçu pour le comparer
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Trouver l'utilisateur avec ce token et vérifier l'expiration
    const user = (await this.usersService.findByResetToken(hashedToken)) as UserDocument;
    if (!user) {
      throw new BadRequestException('Lien de réinitialisation invalide ou expiré');
    }

    // Vérifier l'expiration
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Lien de réinitialisation expiré');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe et supprimer le token
    await this.usersService.updatePassword(user._id, hashedPassword);

    // Envoyer un email de confirmation
    await this.emailService.sendPasswordChangeConfirmation(user.email, user.fullName);

    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
