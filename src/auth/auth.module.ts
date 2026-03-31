import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { MailerService } from '../common/mailer/mail.service';
import { JwtStrategy } from './jwt.strategy';
import { RedisModule } from '../redis/redis.module';
import { RedisProvider } from '../redis/redis.provider';

@Module({
  imports: [ConfigModule, UsersModule],
  providers: [
    AuthService,
    MailerService,
    JwtStrategy,
    RedisModule,
    RedisProvider,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
