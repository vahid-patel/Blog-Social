import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({
  timestamps: true,
})
export class Comment {
  @Prop({
    type: Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true,
  })
  post!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  author!: Types.ObjectId;

  // null = top-level comment
  // ObjectId = reply to another comment
  @Prop({
    type: Types.ObjectId,
    ref: 'Comment',
    default: null,
  })
  parentComment!: Types.ObjectId | null;

  @Prop({
    required: true,
    trim: true,
    maxlength: 5000,
  })
  content!: string;

  @Prop({
    default: 0,
  })
  upvotesCount!: number;

  @Prop({
    default: 0,
  })
  downvotesCount!: number;

  @Prop({
    default: 0,
  })
  repliesCount!: number;

  @Prop({
    default: false,
  })
  isDeleted!: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.index({
  post: 1,
  createdAt: -1,
});

CommentSchema.index({
  parentComment: 1,
});