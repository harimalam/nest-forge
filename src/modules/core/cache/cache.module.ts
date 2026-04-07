import { Logger, Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { CACHE_CLIENT } from './cache.constants';
import { ConfigService } from '@core/config/config.service';
import { CacheService } from './cache.service';

@Module({
  providers: [
    {
      provide: CACHE_CLIENT,
      useFactory: (config: ConfigService) => {
        const logger = new Logger('RedisModule');

        const client = new Redis({
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD') || undefined,
          db: config.get('REDIS_DB') ?? 0,
          retryStrategy: (times) => {
            if (times > 10) return null;
            return Math.min(times * 50, 2000);
          },
          lazyConnect: false,
          enableReadyCheck: true,
        });

        client.on('connect', () => logger.log('Redis connected'));
        client.on('ready', () => logger.log('Redis ready'));
        client.on('error', (err) => logger.error('Redis error', err));
        client.on('reconnecting', () => logger.warn('Redis reconnecting...'));
        client.on('close', () => logger.warn('Redis connection closed'));

        return client;
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: [CACHE_CLIENT, CacheService],
})
export class CacheModule {}
