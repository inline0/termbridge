export type RateLimiter = {
  allow: (key: string) => boolean;
};

export type RateLimiterOptions = {
  limit: number;
  windowMs: number;
  now?: () => number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

export const createRateLimiter = ({ limit, windowMs, now }: RateLimiterOptions): RateLimiter => {
  const clock = now ?? (() => Date.now());
  const buckets = new Map<string, Bucket>();

  const allow = (key: string) => {
    const current = clock();
    const bucket = buckets.get(key);

    if (!bucket || current >= bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: current + windowMs });
      return true;
    }

    if (bucket.count >= limit) {
      return false;
    }

    bucket.count += 1;
    return true;
  };

  return { allow };
};
