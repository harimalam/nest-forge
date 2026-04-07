export const CACHE_CLIENT = 'CACHE_CLIENT';

export const CacheTTL = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 60 * 5,
  ONE_HOUR: 60 * 60,
  ONE_DAY: 60 * 60 * 24,
  ONE_WEEK: 60 * 60 * 24 * 7,
} as const;
