import { IsEnum } from 'class-validator';
import { VoteType } from '../VotesSchema/vote.schema';

export class CreateVoteDto {
  @IsEnum(VoteType)
  type!: VoteType;
}