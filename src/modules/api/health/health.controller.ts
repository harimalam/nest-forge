import { Controller, Get, HttpCode, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { HealthCheckService, HealthCheck, HealthCheckResult, MemoryHealthIndicator } from '@nestjs/terminus';
import * as os from 'os';
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from './dto/health-response.dto';
import { PrismaService } from '@core/database';
import { CacheService } from '@core/cache';

@ApiTags('System')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  @ApiOperation({ summary: 'Check application health' })
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: HealthResponseDto })
  @ApiServiceUnavailableResponse({ type: HealthResponseDto })
  async checkLiveness(): Promise<HealthResponseDto> {
    const timestamp = new Date().toISOString();

    try {
      const result = await this.check();

      return {
        status: result.status === 'ok' ? 'ok' : 'error',
        timestamp,
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        timestamp,
      });
    }
  }

  @ApiOperation({ summary: 'Check application health details' })
  @Get('details')
  @HealthCheck()
  @HttpCode(HttpStatus.OK)
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Database Check (Prisma)
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return { database: { status: 'up', type: 'postgres' } };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown database error';
          return { database: { status: 'down', message } };
        }
      },

      // 2. Cache Check (Redis)
      async () => {
        try {
          const status = await this.cache.ping();
          return { cache: { status: 'up', response: status, type: 'cache' } };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown cache error';
          return { cache: { status: 'down', message } };
        }
      },

      // Memory: Hard Fail at 90% (Critical for OOM prevention)
      async () => {
        const total = os.totalmem();
        const threshold = total * 0.9;
        const rss = process.memoryUsage().rss;

        try {
          await this.memory.checkRSS('memory_rss', threshold);
          return {
            memory: {
              status: 'up',
              current: `${(rss / 1024 / 1024).toFixed(2)} MB`,
              limit: `${(threshold / 1024 / 1024).toFixed(2)} MB`,
            },
          };
        } catch {
          return {
            memory: {
              status: 'down',
              current: `${(rss / 1024 / 1024).toFixed(2)} MB`,
              message: 'Memory usage exceeds 90% threshold',
            },
          };
        }
      },

      // CPU: Informative (Diagnostics only)
      () => {
        const load = os.loadavg()[0];
        const cores = os.cpus().length;
        const loadFactor = load / cores;

        return {
          cpu: {
            status: 'up',
            load: load.toFixed(2),
            cores: cores,
            pressure: `${(loadFactor * 100).toFixed(0)}%`,
            level: loadFactor > 1 ? 'high' : 'normal',
          },
        };
      },

      // Process Metadata
      () => ({
        process: {
          status: 'up',
          uptime: `${Math.floor(process.uptime())}s`,
          node: process.version,
          platform: process.platform,
        },
      }),
    ]);
  }
}
