import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BlogPostDocument = BlogPost & Document;

@Schema({ timestamps: true })
export class BlogPost {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  excerpt: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  author: string;

  @Prop({ default: '' })
  imageUrl: string;

  @Prop({
    type: [String],
    default: []
  })
  tags: string[];

  @Prop({
    type: String,
    enum: ['conseils', 'actualités', 'guides', 'tutoriels', 'news', 'autres'],
    default: 'actualités'
  })
  category: string;

  @Prop({ default: true })
  published: boolean;

  @Prop({
    type: [
      {
        url: { type: String },
        type: { type: String },
        name: { type: String },
      },
    ],
    default: [],
  })
  media: { url: string; type: string; name: string }[];

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: Date })
  publishedAt: Date;
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);
