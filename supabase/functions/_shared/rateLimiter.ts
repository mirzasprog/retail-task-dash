export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is within rate limit
   */
  check(key: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this key
    let keyRequests = this.requests.get(key) || [];

    // Filter out requests outside the window
    keyRequests = keyRequests.filter(timestamp => timestamp > windowStart);

    // Check if within limit
    if (keyRequests.length >= this.config.maxRequests) {
      const oldestRequest = Math.min(...keyRequests);
      const retryAfter = Math.ceil((oldestRequest + this.config.windowMs - now) / 1000);
      
      return { allowed: false, retryAfter };
    }

    // Add current request
    keyRequests.push(now);
    this.requests.set(key, keyRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      this.cleanup();
    }

    return { allowed: true };
  }

  /**
   * Clean up old entries
   */
  private cleanup() {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [key, timestamps] of this.requests.entries()) {
      const filtered = timestamps.filter(t => t > windowStart);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string) {
    this.requests.delete(key);
  }
}
