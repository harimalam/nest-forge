import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@generated/prisma';
import { ConfigService } from '@core/config/config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    const pool = new Pool({
      connectionString: config.get('DATABASE_URL'),
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: config.get('NODE_ENV') === 'development' ? ['query', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected via Driver Adapter (pg)');
    } catch (error) {
      this.logger.error('Database connection failed', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
