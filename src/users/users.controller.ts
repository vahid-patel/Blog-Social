import { Body, Controller, Delete, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { UpdateUserDto } from './userDto/update.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './UserSchema/User.schema';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getUser(@Req() req: Request) {
    return req.user;
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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @Delete('delete/:id')
  deleteUser(@Param('id') id: string, @Req() req:Request) {
    return this.usersService.removeUser(id,req.user);
  }
}
