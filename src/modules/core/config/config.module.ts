import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { z } from 'zod';
import { ConfigService } from './config.service';
import { envSchema } from './env.schema';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const result = envSchema.safeParse(config);
        const logger = new Logger('ConfigModule');

        if (!result.success) {
          const formattedError = z.treeifyError(result.error);

          logger.error('Invalid environment variables:', formattedError);
          throw new Error('Environment validation failed');
        }

        return result.data;
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
