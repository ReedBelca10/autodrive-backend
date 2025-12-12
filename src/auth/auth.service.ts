import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

const ACCESS_TOKEN_EXP = '1h';
const REFRESH_TOKEN_EXP = '7d';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

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
    // store hashed refresh token
    await this.usersService.setRefreshToken(user._id, tokens.refreshToken);
    return { access_token: tokens.accessToken, refresh_token: tokens.refreshToken };
  }

  async register(createUserDto: { fullName: string; email: string; password: string }) {
    const user = await this.usersService.create(createUserDto);
    // generate tokens and store refresh token
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
      if (!user || !user.refreshToken) throw new ForbiddenException('Refresh token not found');
      const matches = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!matches) throw new ForbiddenException('Refresh token does not match');
      const tokens = await this.getTokens(user);
      await this.usersService.setRefreshToken(userId, tokens.refreshToken);
      return { access_token: tokens.accessToken, refresh_token: tokens.refreshToken };
    } catch (err) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  async logoutRefreshToken(refreshToken: string) {
    try {
      const payload: any = this.jwtService.verify(refreshToken, { secret: process.env.JWT_SECRET || 'change_me' });
      const userId = payload.sub;
      await this.usersService.removeRefreshToken(userId);
    } catch (err) {
      // ignore invalid token
    }
  }
}
