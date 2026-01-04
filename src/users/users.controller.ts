import { Controller, Get, Param, Post, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException, Res, NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { supabase } from '../utils/supabase.client';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('avatar')
  async proxyAvatar(@Req() req: Request, @Res() res: any) {
    const user: any = (req as any).user;
    const userId = user?.userId || user?.sub || user?.id;
    if (!userId) return res.status(400).send('User not found');

    // fetch user from DB to get avatarPath
    let dbUser: any;
    try {
      dbUser = await this.usersService.findById(userId as string);
    } catch (e) {
      return res.status(404).send('User not found');
    }

    const avatarPath = dbUser?.avatarPath;
    if (!avatarPath) return res.status(404).send('Avatar not set');

    const bucket = process.env.SUPABASE_BUCKET || 'avatars';

    // create a short-lived signed URL and proxy the request to avoid CORS and expiry issues on client
    try {
      const expiresIn = 60; // seconds
      const { data: signedData, error: signedError } = await supabase.storage.from(bucket).createSignedUrl(avatarPath, expiresIn) as any;
      if (signedError || !signedData?.signedUrl) {
        console.warn('[users.controller] createSignedUrl failed, falling back to public URL or download', signedError);
        // try public url
        try {
          const { data: pub } = supabase.storage.from(bucket).getPublicUrl(avatarPath) as any;
          if (pub && pub.publicUrl) {
            const fetchRes = await fetch(pub.publicUrl);
                if (!fetchRes.ok) return res.status(502).send('Failed to fetch avatar');
                res.setHeader('Content-Type', fetchRes.headers.get('content-type') || 'application/octet-stream');
                // convert web ReadableStream to Node stream if needed
                try {
                  const body: any = fetchRes.body;
                  if (body && typeof body.pipe === 'function') {
                    return body.pipe(res);
                  }
                  if (body && typeof Readable.fromWeb === 'function' && typeof body.getReader === 'function') {
                    const nodeStream = Readable.fromWeb(body);
                    return nodeStream.pipe(res);
                  }
                  // fallback to arrayBuffer
                  const buf = Buffer.from(await fetchRes.arrayBuffer());
                  return res.send(buf);
                } catch (e) {
                  const buf = Buffer.from(await fetchRes.arrayBuffer());
                  return res.send(buf);
                }
          }
        } catch (e) {
          console.warn('[users.controller] getPublicUrl fallback failed', e?.message || e);
        }
        return res.status(502).send('Could not generate avatar URL');
      }

      const proxied = await fetch(signedData.signedUrl);
      if (!proxied.ok) return res.status(502).send('Failed to fetch avatar');
      res.setHeader('Content-Type', proxied.headers.get('content-type') || 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      try {
        const body: any = proxied.body;
        if (body && typeof body.pipe === 'function') {
          return body.pipe(res);
        }
        if (body && typeof Readable.fromWeb === 'function' && typeof body.getReader === 'function') {
          const nodeStream = Readable.fromWeb(body);
          return nodeStream.pipe(res);
        }
        const buf = Buffer.from(await proxied.arrayBuffer());
        return res.send(buf);
      } catch (e) {
        const buf = Buffer.from(await proxied.arrayBuffer());
        return res.send(buf);
      }
    } catch (e) {
      console.error('[users.controller] proxyAvatar error', e?.message || e);
      return res.status(500).send('Internal error');
    }
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    // Do not return password
    const { password, ...rest } = user.toObject();
    return rest;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', { 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async uploadAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    // ensure file present
    if (!file) {
      console.warn('[users.controller] uploadAvatar called without file');
      throw new BadRequestException('No file uploaded');
    }

    const user: any = (req as any).user;
    const userId = user?.userId || user?.sub || user?.id;
    if (!userId) throw new BadRequestException('User not found in request');

    console.log(`[users.controller] uploadAvatar start for user=${userId}, filename=${file.originalname}, size=${file.size}`);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.mimetype)) {
      console.warn(`[users.controller] Invalid file type: ${file.mimetype}`);
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    // ensure supabase configured
    if (!supabase) throw new BadRequestException('Supabase client not configured');

    const bucket = process.env.SUPABASE_BUCKET || 'avatars';
    const timestamp = Date.now();
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
    const filename = `${userId}/${timestamp}-${sanitizedName}`;

    // upload buffer
    const { data, error } = await supabase.storage.from(bucket).upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    } as any);

    if (error) {
      console.error('[users.controller] Supabase upload error:', error);
      throw new BadRequestException('Upload to storage failed: ' + error.message);
    }

    console.log('[users.controller] Supabase upload success:', { bucket, filename, data });

    // store object path in DB
    // fetch previous avatarPath to remove old file after successful upload
    let previousAvatarPath: string | undefined = undefined;
    try {
      const dbUser = await this.usersService.findById(userId);
      previousAvatarPath = (dbUser as any)?.avatarPath;
    } catch (e) {
      console.warn('[users.controller] Could not fetch user before storing avatarPath:', e?.message || e);
    }

    await this.usersService.setAvatarPath(userId, filename);
    console.log(`[users.controller] Stored avatarPath=${filename} for user=${userId}`);

    // If bucket is public we can return a public URL, otherwise create a signed URL
    let resultUrl: string | undefined = undefined;

    try {
      // Try public url first
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename) as any;
      if (urlData && (urlData as any).publicUrl) {
        resultUrl = (urlData as any).publicUrl;
        console.log('[users.controller] Public URL available for avatar:', resultUrl);
      }
    } catch (e) {
      console.warn('[users.controller] getPublicUrl error or not available:', e?.message || e);
    }

    if (!resultUrl) {
      // create signed url valid for 1 hour
      const expiresIn = 60 * 60; // seconds
      const { data: signedData, error: signedError } = await supabase.storage.from(bucket).createSignedUrl(filename, expiresIn) as any;
      if (signedError) {
        console.error('[users.controller] createSignedUrl error:', signedError);
        // fallback to constructed public path
        resultUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
      } else {
        resultUrl = signedData?.signedUrl || `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
        console.log('[users.controller] Signed URL created for avatar:', resultUrl);
      }
    }

    // Store avatarUrl and avatarPath in DB
    // Note: Cache-busting will be handled by the frontend
    await this.usersService.setAvatarUrl(userId, resultUrl || '');
    await this.usersService.setAvatarPath(userId, filename);
    console.log(`[users.controller] Finished uploadAvatar for user=${userId}, avatarUrl=${resultUrl}`);

    // attempt to remove previous avatar file to save space (if different)
    if (previousAvatarPath && previousAvatarPath !== filename) {
      try {
        const { error: removeError } = await supabase.storage.from(bucket).remove([previousAvatarPath] as any) as any;
        if (removeError) {
          console.warn('[users.controller] Failed to remove previous avatar from storage:', removeError);
        } else {
          console.log('[users.controller] Removed previous avatar from storage:', previousAvatarPath);
        }
      } catch (e) {
        console.warn('[users.controller] Exception while removing previous avatar:', e?.message || e);
      }
    }

    const responseBody: any = { avatarUrl: resultUrl, avatarPath: filename };
    if (previousAvatarPath && previousAvatarPath !== filename) responseBody.removedPath = previousAvatarPath;
    return responseBody;
  }
}
