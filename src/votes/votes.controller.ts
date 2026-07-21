import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import type { AuthRequest } from '../users/users.controller';

@Controller('votes')
@UseGuards(AuthGuard('jwt'))
export class VotesController {
  constructor(
    private readonly votesService: VotesService,
  ) {}

  // =====================
  // POST VOTES
  // =====================

  @Post('posts/:postId')
  votePost(
    @Param('postId') postId: string,
    @Body() dto: CreateVoteDto,
    @Req() req: AuthRequest,
  ) {
    return this.votesService.votePost(
      postId,
      dto.type,
      req.user,
    );
  }

  @Delete('posts/:postId')
  removePostVote(
    @Param('postId') postId: string,
    @Req() req: AuthRequest,
  ) {
    return this.votesService.removePostVote(
      postId,
      req.user,
    );
  }

  @Get('posts/:postId/me')
  getMyPostVote(
    @Param('postId') postId: string,
    @Req() req: AuthRequest,
  ) {
    return this.votesService.getMyPostVote(
      postId,
      req.user,
    );
  }

  // =====================
  // COMMENT VOTES
  // =====================

  @Post('comments/:commentId')
  voteComment(
    @Param('commentId') commentId: string,
    @Body() dto: CreateVoteDto,
    @Req() req: AuthRequest,
  ) {
    return this.votesService.voteComment(
      commentId,
      dto.type,
      req.user,
    );
  }

  @Delete('comments/:commentId')
  removeCommentVote(
    @Param('commentId') commentId: string,
    @Req() req: AuthRequest,
  ) {
    return this.votesService.removeCommentVote(
      commentId,
      req.user,
    );
  }

  @Get('comments/:commentId/me')
  getMyCommentVote(
    @Param('commentId') commentId: string,
    @Req() req: AuthRequest,
  ) {
    return this.votesService.getMyCommentVote(
      commentId,
      req.user,
    );
  }
}