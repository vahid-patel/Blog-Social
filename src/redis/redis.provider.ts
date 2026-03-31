import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: async (configService: ConfigService) => {
    const client = new Redis({
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
      password: configService.get<string>('REDIS_PASS'),
    });

    client.on('connect', () => {
      console.log('✅ Redis connected');
    });

    client.on('error', (err) => {
      console.error('❌ Redis error', err);
    });

    return client;
  },
  inject: [ConfigService], 
};
