import {
  IsEnum,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Category } from '../PostSchema/post.schema';

export class QueryPostDto {
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @IsOptional()
  @IsNumberString()
  limit?: string = '10';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsIn(['latest', 'oldest', 'mostViewed'])
  sort?: string = 'latest';
}