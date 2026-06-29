import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VoteDocument = HydratedDocument<Vote>;

export enum VoteType {
  UPVOTE = 1,
  DOWNVOTE = -1,
}

export enum VoteTarget {
  POST = 'POST',
  COMMENT = 'COMMENT',
}

@Schema({
  timestamps: true,
})
export class Vote {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  targetId!: Types.ObjectId;

  @Prop({
    enum: VoteTarget,
    required: true,
  })
  targetType!: VoteTarget;

  @Prop({
    enum: VoteType,
    required: true,
  })
  voteType!: VoteType;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);

// A user can vote only once per post/comment
VoteSchema.index(
  {
    user: 1,
    targetId: 1,
    targetType: 1,
  },
  {
    unique: true,
  },
);