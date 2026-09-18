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
    index: true,
  })
  author!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  content!: string;

  // For nested replies
  @Prop({
    type: Types.ObjectId,
    ref: 'Comment',
    default: null,
  })
  parentComment?: Types.ObjectId | null;

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
  score!: number;

  @Prop({
    default: 0,
  })
  repliesCount!: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.index({
  post: 1,
  createdAt: -1,
});

CommentSchema.index({
  parentComment: 1,
  createdAt: 1,
});

CommentSchema.index({
  score: -1,
});
