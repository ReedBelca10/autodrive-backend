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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dtos/create-blog-post.dto';
import { UpdateBlogPostDto } from './dtos/update-blog-post.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createBlogPostDto: CreateBlogPostDto, @Req() req: any) {
    // Vérifier que l'utilisateur est admin ou manager
    const userRole = (req.user as any)?.role;
    if (userRole !== 'admin' && userRole !== 'manager') {
      throw new UnauthorizedException('Accès restreint aux admin et managers');
    }
    return this.blogService.create(createBlogPostDto);
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
    return this.blogService.update(id, updateBlogPostDto);
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
