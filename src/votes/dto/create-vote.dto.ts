import { IsEnum, IsMongoId } from 'class-validator';
import { VoteTarget, VoteType } from '../VotesSchema/vote.schema';

export class VoteDto {
  @IsMongoId()
  targetId!: string;

  @IsEnum(VoteTarget)
  targetType!: VoteTarget;

  @IsEnum(VoteType)
  voteType!: VoteType;
}