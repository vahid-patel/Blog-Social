import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: async (configService: ConfigService) => {
    console.log({
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
      password: !!configService.get('REDIS_PASS'),
    });

    const client = new Redis({
      host: configService.get<string>('REDIS_HOST'),
      port: Number(configService.get('REDIS_PORT')),
      password: configService.get<string>('REDIS_PASS'),

      family: 4,
      connectTimeout: 10000,
    });

    client.on('connect', () => {
      console.log('✅ Redis connected');
    });

    client.on('ready', () => {
      console.log('🚀 Redis ready');
    });

    client.on('error', (err) => {
      console.error(err);
    });

    return client;
  },
  inject: [ConfigService],
};
