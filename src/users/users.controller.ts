import { Controller, Get, Param, Post, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { supabase } from '../utils/supabase.client';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    // Do not return password
    const { password, ...rest } = user.toObject();
    return rest;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
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

    // ensure supabase configured
    if (!supabase) throw new BadRequestException('Supabase client not configured');

    const bucket = process.env.SUPABASE_BUCKET || 'avatars';
    const filename = `${userId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

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

    // also update avatarUrl for convenience (could store path only)
    await this.usersService.setAvatarUrl(userId, resultUrl || '');
    console.log(`[users.controller] Finished uploadAvatar for user=${userId}, avatarUrl=${resultUrl}`);

    return { avatarUrl: resultUrl };
  }
}
