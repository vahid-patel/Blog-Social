import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import type { AuthRequest } from '../users/users.controller';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('posts/:postId/comments')
  create(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: AuthRequest,
  ) {
    return this.commentsService.create(postId, dto, req.user);
  }

  @Get('posts/:postId/comments')
  getPostComments(
    @Param('postId') postId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.commentsService.getPostComments(
      postId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('comments/:commentId/replies')
  getReplies(
    @Param('commentId') commentId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.commentsService.getReplies(
      commentId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('comments/:commentId')
  update(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: AuthRequest,
  ) {
    return this.commentsService.update(commentId, dto, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('comments/:commentId')
  remove(@Param('commentId') commentId: string, @Req() req: AuthRequest) {
    return this.commentsService.remove(commentId, req.user);
  }
}
