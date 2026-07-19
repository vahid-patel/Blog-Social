import { PartialType } from '@nestjs/mapped-types';
import { VoteDto } from './create-vote.dto';

export class UpdateVoteDto extends PartialType(VoteDto) {}
