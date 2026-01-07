import { IsString, IsOptional, IsArray, IsBoolean, IsEnum } from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  title: string;

  @IsString()
  excerpt: string;

  @IsString()
  content: string;

  @IsString()
  author: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(['conseils', 'actualités', 'guides', 'tutoriels'])
  category?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
