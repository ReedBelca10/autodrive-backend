import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UnauthorizedException,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { BlogService } from './blog.service';
import { BlogUploadService } from './blog-upload.service';
import { CreateBlogPostDto } from './dtos/create-blog-post.dto';
import { UpdateBlogPostDto } from './dtos/update-blog-post.dto';

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly uploadService: BlogUploadService,
  ) { }

  @Post('upload/media')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    try {
      // Vérifier que l'utilisateur est admin ou manager
      const userRole = (req.user as any)?.role;
      if (userRole !== 'admin' && userRole !== 'manager') {
        throw new UnauthorizedException('Seuls les administrateurs et managers peuvent uploader des médias');
      }

      if (!file) {
        throw new BadRequestException('Aucun fichier fourni');
      }

      // Validation de la taille (10 MB max)
      const maxTaille = 10 * 1024 * 1024; // 10 MB
      if (file.size > maxTaille) {
        throw new BadRequestException('Fichier trop volumineux (max 10 MB)');
      }

      // Générer un nom unique
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const originalNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
      const ext = file.originalname.split('.').pop();
      const fileName = `${timestamp}_${random}_${originalNameWithoutExt}.${ext}`;

      const publicUrl = await this.uploadService.uploadMediaFile(file, fileName);

      return {
        success: true,
        publicUrl,
        fileName,
        type: file.mimetype,
      };
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new BadRequestException(
        err.message || 'Erreur lors du téléchargement du fichier',
      );
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createBlogPostDto: CreateBlogPostDto, @Req() req: any) {
    // Vérifier que l'utilisateur est authentifié
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    // Temporairement permis à tous les utilisateurs authentifiés (à adapter selon vos besoins)
    console.log('[BlogController] create called with:', JSON.stringify(createBlogPostDto, null, 2));

    try {
      const result = await this.blogService.create(createBlogPostDto);
      console.log('[BlogController] create success:', (result as any)._id);
      return result;
    } catch (err) {
      console.error('[BlogController] create error:', err);
      throw err;
    }
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('category') category?: string,
  ) {
    return this.blogService.findAll(page, limit, category);
  }

  @Get('latest')
  getLatest(@Query('limit') limit: number = 3) {
    return this.blogService.getLatest(limit);
  }

  @Get('tag/:tag')
  searchByTag(@Param('tag') tag: string) {
    return this.blogService.searchByTag(tag);
  }

  @Get('id/:id')
  async findById(@Param('id') id: string) {
    return this.blogService.findById(id);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() updateBlogPostDto: UpdateBlogPostDto,
    @Req() req: any,
  ) {
    // Vérifier que l'utilisateur est admin ou manager
    const userRole = (req.user as any)?.role;
    if (userRole !== 'admin' && userRole !== 'manager') {
      throw new UnauthorizedException('Accès restreint aux admin et managers');
    }
    console.log('[BlogController] update called for id:', id, 'data:', JSON.stringify(updateBlogPostDto, null, 2));

    try {
      const result = await this.blogService.update(id, updateBlogPostDto);
      console.log('[BlogController] update success:', (result as any)._id);
      return result;
    } catch (err) {
      console.error('[BlogController] update error:', err);
      throw err;
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string, @Req() req: any) {
    // Vérifier que l'utilisateur est admin ou manager
    const userRole = (req.user as any)?.role;
    if (userRole !== 'admin' && userRole !== 'manager') {
      throw new UnauthorizedException('Accès restreint aux admin et managers');
    }
    return this.blogService.remove(id);
  }
}
