import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    const secret = configService.get<string>('jwt.secret');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret || 'defaultSecret',
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User Not Found');
    }

    return {
      name: user.name,
      email: user.email,
      role: user.role,
      userId: payload.userId,
    };
  }
}
