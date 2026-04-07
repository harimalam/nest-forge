import { LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as os from 'os';

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

const safeToString = (val: unknown): string => {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return '';
  if (val instanceof Error) return val.stack ?? val.message;

  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return '[Unserializable Object]';
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return String(val);
};

export class CustomWinstonLogger implements LoggerService {
  private readonly logger: winston.Logger;
  private readonly hostname = os.hostname();

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';

    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'MM/DD/YYYY, h:mm:ss A' }),
      winston.format.printf((info) => {
        const timestamp = typeof info.timestamp === 'string' ? info.timestamp : '';
        const level = typeof info.level === 'string' ? info.level : 'info';
        const message = typeof info.message === 'string' ? info.message : '';
        const context = typeof info.context === 'string' ? info.context : '';
        const stack = typeof info.stack === 'string' ? info.stack : '';
        const data = (info.data as Record<string, unknown> | undefined) ?? {};

        const color = this.getLevelColor(level);
        const pid = process.pid.toString();

        const l = level.toUpperCase().padStart(7, ' ');
        const m = message === '[Object Data]' ? '' : message;

        const contextStr = context ? `${colors.yellow}[${context}]${colors.reset} ` : '';
        const stackStr = stack ? `\n${colors.red}${stack}${colors.reset}` : '';

        const dataStr =
          Object.keys(data).length > 0 ? `\n${colors.cyan}${JSON.stringify(data, null, 2)}${colors.reset}` : '';

        // Concatenate parts cleanly to avoid any implicit object-to-string conversion
        return `${color}[Nest] ${pid}  - ${colors.reset}${timestamp} ${color}${l}${colors.reset} ${contextStr}${color}${m}${colors.reset}${stackStr}${dataStr}`;
      }),
    );

    const fileFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );

    this.logger = winston.createLogger({
      level: isProduction ? 'info' : 'debug',
      defaultMeta: { pid: process.pid, hostname: this.hostname },
      transports: [
        new winston.transports.Console({ format: consoleFormat }),
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: fileFormat,
        }),
      ],
    });
  }

  private getLevelColor(level: string): string {
    const l = level.toLowerCase();
    if (l.includes('error')) return colors.red;
    if (l.includes('warn')) return colors.yellow;
    if (l.includes('debug')) return colors.magenta;
    if (l.includes('verbose')) return colors.cyan;
    return colors.green;
  }

  private parseParams(message: unknown, params: unknown[]) {
    let context = '';
    let finalMessage = safeToString(message);
    const data: Record<string, unknown> = {};

    // Logic to prevent Error objects from being merged into metadata incorrectly
    if (typeof message === 'object' && message !== null && !(message instanceof Error)) {
      Object.assign(data, message);
      finalMessage = '[Object Data]';
    }

    if (params.length > 0) {
      if (typeof params[params.length - 1] === 'string') {
        context = params.pop() as string;
      }
      params.forEach((p, i) => {
        if (typeof p === 'object' && p !== null) {
          Object.assign(data, p);
        } else {
          data[`arg${i}`] = p;
        }
      });
    }

    return { message: finalMessage, context, data };
  }

  log(message: unknown, ...params: unknown[]) {
    const { message: msg, context, data } = this.parseParams(message, params);
    this.logger.info(msg, { context, data });
  }

  error(message: unknown, ...params: unknown[]) {
    const { message: msg, context, data } = this.parseParams(message, params);
    let stack = typeof data.stack === 'string' ? data.stack : undefined;
    if (stack) delete data.stack;
    if (!stack && params.length > 0 && typeof params[0] === 'string') stack = params[0];

    this.logger.error(msg, { context, stack, data });
  }

  warn(message: unknown, ...params: unknown[]) {
    const { message: msg, context, data } = this.parseParams(message, params);
    this.logger.warn(msg, { context, data });
  }

  debug(message: unknown, ...params: unknown[]) {
    const { message: msg, context, data } = this.parseParams(message, params);
    this.logger.debug(msg, { context, data });
  }

  verbose(message: unknown, ...params: unknown[]) {
    const { message: msg, context, data } = this.parseParams(message, params);
    this.logger.verbose(msg, { context, data });
  }
}

export const winstonLogger = new CustomWinstonLogger();
