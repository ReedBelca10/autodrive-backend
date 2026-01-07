import { IsString, IsOptional, IsArray, IsBoolean, IsEnum } from 'class-validator';

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  author?: string;

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
