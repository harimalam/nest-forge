import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from '@core/core.module';
import { ApiModule } from '@api/api.module';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from '@common/guards/custom-throttler.guard';

@Module({
  imports: [CoreModule, ApiModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
