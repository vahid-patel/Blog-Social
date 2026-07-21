import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Vote,
  VoteDocument,
  VoteTargetType,
  VoteType,
} from './VotesSchema/vote.schema';

import {
  Post,
  PostDocument,
} from '../posts/PostSchema/post.schema';

import {
  Comment,
  CommentDocument,
} from '../comments/CommentSchema/comment.schema';

import { JwtPayload } from '../users/users.controller';

@Injectable()
export class VotesService {
  constructor(
    @InjectModel(Vote.name)
    private readonly voteModel: Model<VoteDocument>,

    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,

    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}

  // =========================================================
  // POST VOTING
  // =========================================================

  async votePost(
    postId: string,
    type: VoteType,
    user: JwtPayload,
  ) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingVote = await this.voteModel.findOne({
      user: user.userId,
      targetId: postId,
      targetType: VoteTargetType.POST,
    });

    // CASE 1: User has not voted before
    if (!existingVote) {
      await this.voteModel.create({
        user: user.userId,
        targetId: postId,
        targetType: VoteTargetType.POST,
        type,
      });

      if (type === VoteType.UPVOTE) {
        post.upvotesCount += 1;
        post.score += 1;
      } else {
        post.downvotesCount += 1;
        post.score -= 1;
      }

      await post.save();

      return {
        message: 'Vote added successfully',
        vote: type,
        upvotesCount: post.upvotesCount,
        downvotesCount: post.downvotesCount,
        score: post.score,
      };
    }

    // CASE 2: User sends the same vote again
    if (existingVote.type === type) {
      return {
        message: 'You have already voted this way',
        vote: existingVote.type,
        upvotesCount: post.upvotesCount,
        downvotesCount: post.downvotesCount,
        score: post.score,
      };
    }

    // CASE 3: UPVOTE -> DOWNVOTE
    if (
      existingVote.type === VoteType.UPVOTE &&
      type === VoteType.DOWNVOTE
    ) {
      post.upvotesCount -= 1;
      post.downvotesCount += 1;

      // Score changes from +1 to -1
      post.score -= 2;
    }

    // CASE 4: DOWNVOTE -> UPVOTE
    if (
      existingVote.type === VoteType.DOWNVOTE &&
      type === VoteType.UPVOTE
    ) {
      post.downvotesCount -= 1;
      post.upvotesCount += 1;

      // Score changes from -1 to +1
      post.score += 2;
    }

    existingVote.type = type;

    await existingVote.save();
    await post.save();

    return {
      message: 'Vote changed successfully',
      vote: type,
      upvotesCount: post.upvotesCount,
      downvotesCount: post.downvotesCount,
      score: post.score,
    };
  }

  async removePostVote(
    postId: string,
    user: JwtPayload,
  ) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingVote = await this.voteModel.findOne({
      user: user.userId,
      targetId: postId,
      targetType: VoteTargetType.POST,
    });

    if (!existingVote) {
      return {
        message: 'No vote found',
      };
    }

    if (existingVote.type === VoteType.UPVOTE) {
      post.upvotesCount -= 1;
      post.score -= 1;
    } else {
      post.downvotesCount -= 1;
      post.score += 1;
    }

    await existingVote.deleteOne();
    await post.save();

    return {
      message: 'Vote removed successfully',
      vote: null,
      upvotesCount: post.upvotesCount,
      downvotesCount: post.downvotesCount,
      score: post.score,
    };
  }

  async getMyPostVote(
    postId: string,
    user: JwtPayload,
  ) {
    const vote = await this.voteModel.findOne({
      user: user.userId,
      targetId: postId,
      targetType: VoteTargetType.POST,
    });

    return {
      vote: vote?.type ?? null,
    };
  }

  // =========================================================
  // COMMENT VOTING
  // =========================================================

  async voteComment(
    commentId: string,
    type: VoteType,
    user: JwtPayload,
  ) {
    const comment =
      await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingVote = await this.voteModel.findOne({
      user: user.userId,
      targetId: commentId,
      targetType: VoteTargetType.COMMENT,
    });

    // CASE 1: No existing vote
    if (!existingVote) {
      await this.voteModel.create({
        user: user.userId,
        targetId: commentId,
        targetType: VoteTargetType.COMMENT,
        type,
      });

      if (type === VoteType.UPVOTE) {
        comment.upvotesCount += 1;
        comment.score += 1;
      } else {
        comment.downvotesCount += 1;
        comment.score -= 1;
      }

      await comment.save();

      return {
        message: 'Vote added successfully',
        vote: type,
        upvotesCount: comment.upvotesCount,
        downvotesCount: comment.downvotesCount,
        score: comment.score,
      };
    }

    // CASE 2: Same vote
    if (existingVote.type === type) {
      return {
        message: 'You have already voted this way',
        vote: existingVote.type,
        upvotesCount: comment.upvotesCount,
        downvotesCount: comment.downvotesCount,
        score: comment.score,
      };
    }

    // CASE 3: UPVOTE -> DOWNVOTE
    if (
      existingVote.type === VoteType.UPVOTE &&
      type === VoteType.DOWNVOTE
    ) {
      comment.upvotesCount -= 1;
      comment.downvotesCount += 1;

      comment.score -= 2;
    }

    // CASE 4: DOWNVOTE -> UPVOTE
    if (
      existingVote.type === VoteType.DOWNVOTE &&
      type === VoteType.UPVOTE
    ) {
      comment.downvotesCount -= 1;
      comment.upvotesCount += 1;

      comment.score += 2;
    }

    existingVote.type = type;

    await existingVote.save();
    await comment.save();

    return {
      message: 'Vote changed successfully',
      vote: type,
      upvotesCount: comment.upvotesCount,
      downvotesCount: comment.downvotesCount,
      score: comment.score,
    };
  }

  async removeCommentVote(
    commentId: string,
    user: JwtPayload,
  ) {
    const comment =
      await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingVote = await this.voteModel.findOne({
      user: user.userId,
      targetId: commentId,
      targetType: VoteTargetType.COMMENT,
    });

    if (!existingVote) {
      return {
        message: 'No vote found',
      };
    }

    if (existingVote.type === VoteType.UPVOTE) {
      comment.upvotesCount -= 1;
      comment.score -= 1;
    } else {
      comment.downvotesCount -= 1;
      comment.score += 1;
    }

    await existingVote.deleteOne();
    await comment.save();

    return {
      message: 'Vote removed successfully',
      vote: null,
      upvotesCount: comment.upvotesCount,
      downvotesCount: comment.downvotesCount,
      score: comment.score,
    };
  }

  async getMyCommentVote(
    commentId: string,
    user: JwtPayload,
  ) {
    const vote = await this.voteModel.findOne({
      user: user.userId,
      targetId: commentId,
      targetType: VoteTargetType.COMMENT,
    });

    return {
      vote: vote?.type ?? null,
    };
  }
}