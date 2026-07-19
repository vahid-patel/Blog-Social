import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Category, PostStatus } from '../PostSchema/post.schema';
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title!: string;

  // Tiptap JSON
  @IsObject()
  content!: Record<string, any>;

  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}