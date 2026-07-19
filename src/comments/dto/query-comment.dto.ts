import {
  IsNumberString,
  IsOptional,
} from 'class-validator';

export class QueryCommentDto {
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @IsOptional()
  @IsNumberString()
  limit?: string = '20';
}