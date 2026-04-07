import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Env } from './env.schema';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService<Env, true>) {}

  get<T extends keyof Env>(key: T): Env[T] {
    return this.configService.get(key, { infer: true });
  }

  get apiHost(): string {
    const apiHost = this.get('API_HOST');
    const port = this.get('PORT');

    if (apiHost) {
      return apiHost.startsWith('http') ? apiHost : `https://${apiHost}`;
    }

    return `http://localhost:${port}`;
  }
}
