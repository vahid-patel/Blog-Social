import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import type { Request } from 'express';
import type { AuthRequest } from '../users/users.controller';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/UserSchema/User.schema';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  create(@Body() createPostDto: CreatePostDto, @Req() req: AuthRequest) {
    return this.postsService.create(createPostDto, req.user);
  }

  @Get()
  getAllPosts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('sortBy') sortBy: string = 'newest',
    @Query('author') author?: string,
    @Query('status') status?: string,
  ) {
    const Page = parseInt(page);
    const Limit = parseInt(limit);
    return this.postsService.getAllPosts(Page, Limit, sortBy, author, status);
  }

  @Get('search')
  searchPosts(
    @Query('keyword') keyword: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const Page = parseInt(page);
    const Limit = parseInt(limit);
    return this.postsService.searchPosts(keyword, Page, Limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: AuthRequest,
  ) {
    return this.postsService.update(id, updatePostDto, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.postsService.remove(id, req.user);
  }
}
