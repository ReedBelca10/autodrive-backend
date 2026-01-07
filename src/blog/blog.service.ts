import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogPost, BlogPostDocument } from './schemas/blog-post.schema';
import { CreateBlogPostDto } from './dtos/create-blog-post.dto';
import { UpdateBlogPostDto } from './dtos/update-blog-post.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(BlogPost.name)
    private blogPostModel: Model<BlogPostDocument>,
  ) {}

  async create(createBlogPostDto: CreateBlogPostDto): Promise<BlogPost> {
    const slug = this.generateSlug(createBlogPostDto.title);
    
    const existingPost = await this.blogPostModel.findOne({ slug });
    if (existingPost) {
      throw new BadRequestException('Un article avec ce slug existe déjà');
    }

    const blogPost = new this.blogPostModel({
      ...createBlogPostDto,
      slug,
      publishedAt: new Date(),
    });

    return blogPost.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    category?: string,
  ): Promise<{ data: BlogPost[]; total: number; pages: number }> {
    const query: any = { published: true };
    
    if (category) {
      query.category = category;
    }

    const total = await this.blogPostModel.countDocuments(query);
    const skip = (page - 1) * limit;

    const data = await this.blogPostModel
      .find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findBySlug(slug: string): Promise<BlogPost> {
    const blogPost = await this.blogPostModel.findOne({ slug, published: true });
    
    if (!blogPost) {
      throw new NotFoundException('Article non trouvé');
    }

    // Incrémenter le nombre de vues
    await this.blogPostModel.updateOne(
      { _id: blogPost._id },
      { $inc: { views: 1 } },
    );

    return blogPost;
  }

  async getLatest(limit: number = 3): Promise<BlogPost[]> {
    return this.blogPostModel
      .find({ published: true })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .exec();
  }

  async findById(id: string): Promise<BlogPost> {
    const blogPost = await this.blogPostModel.findById(id);

    if (!blogPost) {
      throw new NotFoundException('Article non trouvé');
    }

    return blogPost;
  }

  async update(
    id: string,
    updateBlogPostDto: UpdateBlogPostDto,
  ): Promise<BlogPost> {
    const blogPost = await this.blogPostModel.findByIdAndUpdate(
      id,
      updateBlogPostDto,
      { new: true },
    );

    if (!blogPost) {
      throw new NotFoundException('Article non trouvé');
    }

    return blogPost;
  }

  async remove(id: string): Promise<void> {
    const result = await this.blogPostModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Article non trouvé');
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async searchByTag(tag: string): Promise<BlogPost[]> {
    return this.blogPostModel
      .find({ tags: tag, published: true })
      .sort({ publishedAt: -1 })
      .exec();
  }
}
