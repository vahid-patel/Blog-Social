import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserRole } from './UserSchema/User.schema';
import { Model } from 'mongoose';
import { UpdateUserDto } from './userDto/update.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async updateUser(updateUserData: UpdateUserDto, req: any) {
    const { name, prevPassword, newPassword } = updateUserData;
    const { userId } = req.user;

    const user = await this.userModel.findById(userId);

    if (!user) throw new BadRequestException('User does not exist');

    if (name) {
      user.name = name;
    }

    if (newPassword) {
      if (!prevPassword) {
        throw new BadRequestException('Previous password is required');
      }

      const isPassMatch = await bcrypt.compare(prevPassword, user.password);

      if (!isPassMatch) {
        throw new UnauthorizedException('Wrong Credentials');
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return {
      message: 'User Updated Succesfully',
      updatedUser: {
        name: user.name,
        email: user.email,
      },
    };
  }

  async findAll() {
    return await this.userModel.find().select('-password');
  }

  async removeUser(id: string, user: any) {
    const targetUser = await this.userModel.findById(id);

    if (!targetUser) throw new NotFoundException('User not found');

    if (user.role !== UserRole.ADMIN && user.userId !== id)
      throw new ForbiddenException('You can only delete your own account');

    await targetUser.deleteOne();

    return {
      message: 'User Deleted Successfully',
    };
  }
}
