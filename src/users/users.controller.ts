import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { UpdateUserDto } from './userDto/update.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './UserSchema/User.schema';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export interface AuthRequest extends Request {
  user: JwtPayload;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getUser(@Req() req: AuthRequest) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      return req.user;
    }
    return user;
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch('update')
  updateUser(@Body() updateUserData: UpdateUserDto, @Req() req: Request) {
    return this.usersService.updateUser(updateUserData, req);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('all')
  getAllUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/myaccount')
  deleteMyAccount(@Req() req: AuthRequest) {
    return this.usersService.removeUser(req.user.userId, req.user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('delete/:id')
  removeUser(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.usersService.removeUser(id, req.user);
  }
}
