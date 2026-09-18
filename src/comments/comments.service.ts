import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Comment, CommentDocument } from './CommentSchema/comment.schema';

import { Post, PostDocument } from '../posts/PostSchema/post.schema';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

import { JwtPayload } from '../users/users.controller';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,

    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  // =========================================================
  // CREATE COMMENT / REPLY
  // =========================================================

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
    user: JwtPayload,
  ) {
    // Check if post exists
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const { content, parentComment } = createCommentDto;

    // If parentComment exists, then this is a reply
    if (parentComment) {
      const parent = await this.commentModel.findById(parentComment);

      if (!parent) {
        throw new NotFoundException('Parent comment not found');
      }

      // Make sure parent belongs to same post
      if (parent.post.toString() !== postId) {
        throw new BadRequestException(
          'Parent comment does not belong to this post',
        );
      }
    }

    const comment = await this.commentModel.create({
      post: postId,
      author: user.userId,
      content,
      parentComment: parentComment ?? null,
    });

    // If this is a reply, increment parent's repliesCount
    if (parentComment) {
      await this.commentModel.findByIdAndUpdate(parentComment, {
        $inc: { repliesCount: 1 },
      });
    }

    // Increment total comments/replies count
    post.commentsCount += 1;

    await post.save();

    return comment.populate('author', 'name email');
  }

  // =========================================================
  // GET TOP LEVEL COMMENTS
  // =========================================================

  async getPostComments(postId: string, page: number, limit: number) {
    const postExists = await this.postModel.exists({
      _id: postId,
    });

    if (!postExists) {
      throw new NotFoundException('Post not found');
    }

    const skip = (page - 1) * limit;

    // Only top-level comments
    const filter = {
      post: postId,
      parentComment: null,
    };

    const comments = await this.commentModel
      .find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalComments = await this.commentModel.countDocuments(filter);

    return {
      totalComments,
      page,
      limit,
      totalPages: Math.ceil(totalComments / limit),
      comments,
    };
  }

  // =========================================================
  // GET REPLIES
  // =========================================================

  async getReplies(commentId: string, page: number, limit: number) {
    // Make sure parent comment exists
    const parentComment = await this.commentModel.findById(commentId);

    if (!parentComment) {
      throw new NotFoundException('Comment not found');
    }

    const skip = (page - 1) * limit;

    const filter = {
      parentComment: commentId,
    };

    const replies = await this.commentModel
      .find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const totalReplies = await this.commentModel.countDocuments(filter);

    return {
      totalReplies,
      page,
      limit,
      totalPages: Math.ceil(totalReplies / limit),
      replies,
    };
  }

  // =========================================================
  // UPDATE COMMENT
  // =========================================================

  async update(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    user: JwtPayload,
  ) {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Only owner can update
    if (comment.author.toString() !== user.userId) {
      throw new ForbiddenException(
        'You are not allowed to update this comment',
      );
    }

    comment.content = updateCommentDto.content;

    await comment.save();

    return comment.populate('author', 'name email');
  }

  // =========================================================
  // DELETE COMMENT
  // =========================================================

  async remove(commentId: string, user: JwtPayload) {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isOwner = comment.author.toString() === user.userId;

    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }

    // If this comment is a reply, decrement parent's repliesCount
    if (comment.parentComment) {
      await this.commentModel.findByIdAndUpdate(comment.parentComment, {
        $inc: { repliesCount: -1 },
      });
    }

    // Delete direct child replies recursively if any
    const childReplies = await this.commentModel.find({
      parentComment: commentId,
    });
    let deletedCount = 1;

    if (childReplies.length > 0) {
      const childResult = await this.commentModel.deleteMany({
        parentComment: commentId,
      });
      deletedCount += childResult.deletedCount || 0;
    }

    await comment.deleteOne();

    // Decrement post commentsCount
    await this.postModel.findByIdAndUpdate(comment.post, {
      $inc: {
        commentsCount: -deletedCount,
      },
    });

    return {
      message: 'Comment deleted successfully',
    };
  }
}
