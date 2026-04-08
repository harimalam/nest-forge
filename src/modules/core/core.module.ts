import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from './config';
import { DatabaseModule } from './database';
import { MailModule } from './mail';
import { CACHE_CLIENT, CacheModule } from './cache';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    MailModule,
    CacheModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, CacheModule],
      inject: [ConfigService, CACHE_CLIENT],
      useFactory: (config: ConfigService, redis: Redis): ThrottlerModuleOptions => ({
        storage: new ThrottlerStorageRedisService(redis),
        throttlers: [
          {
            name: 'default',
            ttl: 60000, // 1 minute
            limit: config.get('RATE_LIMIT_DEFAULT'),
          },
        ],
      }),
    }),
  ],
  exports: [ConfigModule, DatabaseModule, MailModule, CacheModule],
})
export class CoreModule {}
