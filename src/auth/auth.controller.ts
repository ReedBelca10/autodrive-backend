import { Body, Controller, Post, BadRequestException, Res, Req, Get, UseGuards, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { supabase } from '../utils/supabase.client';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
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

  // In-memory PKCE storage for Twitter flow (state -> code_verifier)
  private static twitterPkce = new Map<string, string>();

  // Start OAuth flow for supported providers
  @Get('oauth/:provider')
  async oauthStart(@Req() req: Request, @Res() res: Response) {
    const provider = (req.params as any).provider as string;
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
      // PKCE setup
      const state = crypto.randomBytes(16).toString('hex');
      const codeVerifier = crypto.randomBytes(64).toString('hex');
      const hash = crypto.createHash('sha256').update(codeVerifier).digest();
      const codeChallenge = hash.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      // store verifier by state for callback
      (AuthController as any).twitterPkce.set(state, codeVerifier);

      const clientId = process.env.TWITTER_CLIENT_ID;
      const redirect = `${baseUrl}/auth/oauth/twitter/callback`;
      const scope = encodeURIComponent('tweet.read users.read offline.access');
      const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&scope=${scope}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
      return res.redirect(url);
    }

    return res.status(400).send({ error: 'Unsupported provider' });
  }

  @Get('oauth/google/callback')
  async googleCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const code = req.query.code as string;
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
      // redirect back to frontend
      return res.redirect(frontend + '/');
    } catch (e) {
      console.warn('Google OAuth callback error', e);
      return res.redirect((process.env.FRONTEND_ORIGIN || 'http://localhost:3000') + '/login?error=oauth');
    }
  }

  @Get('oauth/facebook/callback')
  async facebookCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const code = req.query.code as string;
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
      const avatarUrl = profile.picture?.data?.url;
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
    } catch (e) {
      console.warn('Facebook OAuth callback error', e);
      return res.redirect((process.env.FRONTEND_ORIGIN || 'http://localhost:3000') + '/login?error=oauth');
    }
  }

  @Get('oauth/twitter/callback')
  async twitterCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const code = req.query.code as string;
    const state = req.query.state as string;
    const frontend = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
    const baseUrl = process.env.BACKEND_ORIGIN || `http://localhost:${process.env.PORT || 3001}`;
    try {
      const codeVerifier = (AuthController as any).twitterPkce.get(state);
      // remove stored verifier
      (AuthController as any).twitterPkce.delete(state);
      if (!codeVerifier) throw new Error('PKCE code_verifier not found');

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
      // fetch user info
      const profileRes = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profileJson = await profileRes.json();
      const userData = profileJson.data || {};
      // Twitter may not provide email via this endpoint; use username as fallback
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
    } catch (e) {
      console.warn('Twitter OAuth callback error', e);
      return res.redirect((process.env.FRONTEND_ORIGIN || 'http://localhost:3000') + '/login?error=oauth');
    }
  }

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

      // Add cache-buster to avatarUrl to ensure fresh image
      if (dbUser.avatarUrl) {
        const sep = (dbUser.avatarUrl as string).includes('?') ? '&' : '?';
        const timestamp = Date.now();
        // Remove old cache-buster if exists
        let url = (dbUser.avatarUrl as string).replace(/[&?]v=\d+/, '');
        dbUser.avatarUrl = `${url}${sep}v=${timestamp}`;
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
