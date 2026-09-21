import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostStatus } from './PostSchema/post.schema';
import { Model } from 'mongoose';
import { JwtPayload } from '../users/users.controller';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}
  async create(createPostDto: CreatePostDto, user: JwtPayload) {
    const { userId } = user;

    return await this.postModel.create({
      ...createPostDto,
      author: userId,
    });
  }

  async getAllPosts(
    page: number,
    limit: number,
    sortBy: string = 'newest',
    author?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sortBy === 'most_liked' || sortBy === 'popular') {
      sortOption = { score: -1, upvotesCount: -1, createdAt: -1 };
    } else if (sortBy === 'trending') {
      sortOption = { score: -1, views: -1, commentsCount: -1, createdAt: -1 };
    } else {
      // Default: newest
      sortOption = { createdAt: -1 };
    }

    const filter: Record<string, any> = {};
    if (status && Object.values(PostStatus).includes(status as PostStatus)) {
      filter.status = status;
    } else if (!status) {
      filter.status = PostStatus.PUBLISHED;
    }

    if (author) {
      filter.author = author;
    }

    const posts = await this.postModel
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email');

    const totalPosts = await this.postModel.countDocuments(filter);

    return {
      totalPosts,
      page,
      limit,
      totalPages: Math.ceil(totalPosts / limit),
      posts,
    };
  }

  async searchPosts(keyword: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    if (!keyword || keyword.trim() == '') {
      return { message: 'No results' };
    }

    const filter = {
      status: PostStatus.PUBLISHED,
      $text: { $search: keyword },
    };

    const posts = await this.postModel
      .find(filter, { textScore: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .sort({ textScore: { $meta: 'textScore' } });

    const totalPosts = await this.postModel.countDocuments(filter);

    return {
      totalPosts,
      page,
      limit,
      totalPages: Math.ceil(totalPosts / limit),
      posts,
    };
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findOne({ _id: id, status: PostStatus.PUBLISHED })
      .populate('author', 'name email');

    if (!post) throw new NotFoundException('Post not found');
    
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: JwtPayload) {
    const post = await this.postModel.findById(id);

    if (!post) throw new NotFoundException('Post not found');

    if (post.author.toString() !== user.userId) {
      throw new ForbiddenException('You are not allowed to update this post');
    }

    Object.assign(post, updatePostDto);

    await post.save();

    return post.populate('author', 'name email');
  }

  async remove(id: string, user: JwtPayload) {
    const post = await this.postModel.findById(id);

    if (!post) throw new NotFoundException('Post not found');

    const isOwner = post.author.toString() === user.userId;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin)
      throw new ForbiddenException('You are not allowed to delete this post');

    await post.deleteOne();

    return { message: 'Post Deleted Successfully' };
  }
}
