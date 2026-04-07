import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { DatabaseModule } from '@core/database';
import { CacheModule } from '@core/cache';

@Module({
  imports: [TerminusModule, DatabaseModule, CacheModule],
  controllers: [HealthController],
})
export class HealthModule {}
