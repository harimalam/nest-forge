import { Global, Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { DatabaseModule } from './database';
import { MailModule } from './mail';
import { CacheModule } from './cache';

@Global()
@Module({
  imports: [ConfigModule, DatabaseModule, MailModule, CacheModule],
  exports: [ConfigModule, DatabaseModule, MailModule, CacheModule],
})
export class CoreModule {}
