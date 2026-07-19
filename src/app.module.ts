import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { MongooseModule } from '@nestjs/mongoose';
import {JwtModule} from '@nestjs/jwt'
import { PostsModule } from './posts/posts.module';
import { VotesModule } from './votes/votes.module';
import { CommentsModule } from './comments/comments.module';

import * as dns from 'dns';

dns.setServers(["1.1.1.1", "8.8.8.8"]);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config], // loads from config.ts
    }),

    MongooseModule.forRootAsync({
      imports:[ConfigModule],
      useFactory : (config)=>({
        uri: config.get('database.uri'),
      }),
      inject : [ConfigService],
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    PostsModule,
    VotesModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
