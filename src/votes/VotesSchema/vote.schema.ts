import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VoteDocument = HydratedDocument<Vote>;

export enum VoteType {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE',
}

export enum VoteTargetType {
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
    index: true,
  })
  user!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  targetId!: Types.ObjectId;

  @Prop({
    enum: VoteTargetType,
    required: true,
  })
  targetType!: VoteTargetType;

  @Prop({
    enum: VoteType,
    required: true,
  })
  type!: VoteType;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);

// One user can have only one vote per target
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
