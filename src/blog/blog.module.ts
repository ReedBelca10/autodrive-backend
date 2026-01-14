import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { BlogPost, BlogPostSchema } from './schemas/blog-post.schema';
import { BlogUploadService } from './blog-upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogPost.name, schema: BlogPostSchema },
    ]),
  ],
  controllers: [BlogController],
  providers: [BlogService, BlogUploadService],
  exports: [BlogService],
})
export class BlogModule { }
