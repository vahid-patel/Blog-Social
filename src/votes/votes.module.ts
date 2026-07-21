import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';

import {
  Vote,
  VoteSchema,
} from './VotesSchema/vote.schema';

import {
  Post,
  PostSchema,
} from '../posts/PostSchema/post.schema';

import {
  Comment,
  CommentSchema,
} from '../comments/CommentSchema/comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Vote.name,
        schema: VoteSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
    ]),
  ],
  controllers: [VotesController],
  providers: [VotesService],
  exports: [VotesService],
})
export class VotesModule {}