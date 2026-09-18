import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

export enum Category {
  FOOD = 'FOOD',
  TRAVEL = 'TRAVEL',
  HEALTH_AND_FITNESS = 'HEALTH_AND_FITNESS',
  LIFESTYLE = 'LIFESTYLE',
  FASHION = 'FASHION',
  BEAUTY = 'BEAUTY',
  PERSONAL_FINANCE = 'PERSONAL_FINANCE',
  TECHNOLOGY = 'TECHNOLOGY',
  DIY_AND_CRAFT = 'DIY_AND_CRAFT',
  PARENTING = 'PARENTING',
  MUSIC = 'MUSIC',
  ENTERTAINMENT = 'ENTERTAINMENT',
  GAMING = 'GAMING',
  SCIENCE = 'SCIENCE',
  POLITICS = 'POLITICS',
  CULTURE_AND_ARTS = 'CULTURE_AND_ARTS',
  CAREER = 'CAREER',
  DESIGN = 'DESIGN',
  NEWS = 'NEWS',
  ENVIRONMENT = 'ENVIRONMENT',
  ARTIFICIAL_INTELLIGENCE = 'ARTIFICIAL_INTELLIGENCE',
  FINANCE = 'FINANCE',
  GEOPOLITICS = 'GEOPOLITICS',
  SPORTS = 'SPORTS',
  CASE_STUDIES = 'CASE_STUDIES',
  BUSINESS = 'BUSINESS',
  EDUCATION = 'EDUCATION',
  GENERAL = 'GENERAL',
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

@Schema({
  timestamps: true,
})
export class Post {
  @Prop({
    required: true,
    trim: true,
    maxlength: 300,
  })
  title!: string;

  @Prop({
    required: true,
    type: Object,
  })
  content!: Record<string, any>;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  author!: Types.ObjectId;

  @Prop({
    enum: Category,
    default: Category.GENERAL,
  })
  category!: Category;

  @Prop({
    type: [String],
    default: [],
  })
  tags!: string[];

  @Prop()
  summary?: string;

  @Prop()
  coverImage?: string;

  // Cached counters
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
  commentsCount!: number;

  @Prop({
    default: 0,
  })
  views!: number;

  @Prop({
    enum: PostStatus,
    default: PostStatus.PUBLISHED,
  })
  status!: PostStatus;

  
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Search
PostSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
});

// Feed
PostSchema.index({
  createdAt: -1,
});

// Trending
PostSchema.index({
  score: -1,
});

// Category page
PostSchema.index({
  category: 1,
  createdAt: -1,
});

// User profile
PostSchema.index({
  author: 1,
  createdAt: -1,
});
