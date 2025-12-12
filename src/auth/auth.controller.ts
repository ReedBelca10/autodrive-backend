import { Body, Controller, Post, BadRequestException, Res, Req, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { supabase } from '../utils/supabase.client';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

class RegisterDto {
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}

class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private jwtService: JwtService, private usersService: UsersService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    try {
      const result = await this.authService.register(dto);
      // authService.register returns { user, access_token, refresh_token }
      const access = (result as any).access_token;
      const refresh = (result as any).refresh_token;
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
      return (result as any).user || result;
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Registration failed');
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new BadRequestException('Invalid credentials');
    const tokenObj = await this.authService.login(user);
    const access = tokenObj.access_token;
    const refresh = tokenObj.refresh_token;
    // Set HttpOnly cookies for access and refresh
    res.cookie('autodrive_token', access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
      path: '/',
    });
    res.cookie('autodrive_refresh', refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async profile(@Req() req: Request) {
    // req.user is populated by JwtStrategy validate
    const user: any = (req as any).user;
    const id = user?.userId || user?.sub || user?.id;
    if (!id) throw new BadRequestException('User not found');
    // attempt to fetch full user from DB; if DB is down, return a minimal profile based on JWT
    try {
      const dbUser = await this.usersService.findById(id as string);
      if (!dbUser) throw new NotFoundException('User not found in DB');

      // if avatarPath exists and we don't have avatarUrl, attempt to generate a signed url
      if (dbUser.avatarPath && !dbUser.avatarUrl && process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
        try {
          console.log(`[auth.controller] Generating signed URL for user=${id}, avatarPath=${dbUser.avatarPath}`);
          const { data: signedData, error: signedError } = await supabase.storage.from(process.env.SUPABASE_BUCKET as string).createSignedUrl(dbUser.avatarPath, 60 * 60) as any;
          if (signedError) {
            console.warn('[auth.controller] createSignedUrl returned error:', signedError);
          } else {
            dbUser.avatarUrl = signedData?.signedUrl || dbUser.avatarUrl;
            console.log('[auth.controller] Signed URL generated for profile:', dbUser.avatarUrl);
          }
        } catch (e) {
          console.warn('[auth.controller] Error creating signed URL for profile:', e?.message || e);
        }
      }

      return { user: dbUser };
    } catch (dbErr) {
      // If the DB is unreachable (e.g. Atlas IP whitelist or DNS), return a minimal profile from JWT
      console.warn('[auth.controller] DB fetch failed for profile, returning minimal profile from JWT:', dbErr?.message || dbErr);
      const minimal = {
        _id: id,
        email: user?.email || null,
        fullName: user?.email ? (user.email.split('@')[0] || user.email) : undefined,
        avatarUrl: undefined,
      };
      return { user: minimal };
    }

    // if avatarPath present, generate signed URL for private buckets
    const bucket = process.env.SUPABASE_BUCKET || 'avatars';
    if (rest.avatarPath) {
      try {
        // try public url first
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(rest.avatarPath) as any;
        if (urlData && (urlData as any).publicUrl) {
          rest.avatarUrl = (urlData as any).publicUrl;
        } else {
          const expiresIn = 60 * 60; // 1 hour
          const { data: signedData, error: signedError } = await supabase.storage.from(bucket).createSignedUrl(rest.avatarPath, expiresIn) as any;
          if (!signedError && signedData?.signedUrl) rest.avatarUrl = signedData.signedUrl;
        }
      } catch (e) {
        // ignore and fall back to any stored avatarUrl
      }
    }

    return rest;
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // clear cookies and remove refresh token from db if possible
    const refresh = (req as any).cookies?.autodrive_refresh;
    if (refresh) {
      try {
        const payload: any = this.jwtService.verify(refresh, { secret: process.env.JWT_SECRET || 'change_me' });
        const userId = payload.sub;
        await this.usersService.removeRefreshToken(userId);
      } catch (e) {
        // ignore verification errors
      }
    }
    res.clearCookie('autodrive_token', { path: '/' });
    res.clearCookie('autodrive_refresh', { path: '/' });
    return { message: 'logged out' };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refresh = (req as any).cookies?.autodrive_refresh;
    if (!refresh) throw new BadRequestException('Refresh token missing');
    // Use authService to validate refresh and generate new tokens
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
}
