/**
 * Per-key admission check for a fixed-window request budget.
 */
export type RateLimiter = {
  allow: (key: string) => boolean
}

/**
 * Request limit, window duration, and optional clock override.
 */
export type RateLimiterOptions = {
  limit: number
  windowMs: number
  now?: () => number
}

type Bucket = {
  count: number
  resetAt: number
}

/**
 * Create a per-key fixed-window request limiter.
 * @returns An admission check sharing the configured request budget.
 */
export const createRateLimiter = ({
  limit,
  windowMs,
  now,
}: RateLimiterOptions): RateLimiter => {
  const clock = now ?? (() => Date.now())
  const buckets = new Map<string, Bucket>()

  const allow = (key: string) => {
    const current = clock()
    const bucket = buckets.get(key)

    if (!bucket || current >= bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: current + windowMs })
      return true
    }

    if (bucket.count >= limit) {
      return false
    }

    bucket.count += 1
    return true
  }

  return { allow }
}
