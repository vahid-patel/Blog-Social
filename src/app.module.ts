import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { MongooseModule } from '@nestjs/mongoose';

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

    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
