import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(req: Record<string, unknown>): Promise<string> {
    const ip = (req.ip as string) ?? 'unknown';
    const headers = (req.headers as Record<string, string | string[] | undefined>) ?? {};
    const getHeader = (key: string): string => {
      const value = headers[key];
      return Array.isArray(value) ? value[0] : (value ?? 'none');
    };

    const ua = getHeader('user-agent');
    const lang = getHeader('accept-language');
    const platform = getHeader('sec-ch-ua-platform');
    const mobile = getHeader('sec-ch-ua-mobile');

    const tracker = `${ip}-${ua}-${lang}-${platform}-${mobile}`;

    return Promise.resolve(tracker);
  }
}
