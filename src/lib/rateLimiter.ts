// Rate limiting utilities for API calls and scraping
import { RATE_LIMITS as ConfigRateLimits } from './config';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  check(config: RateLimitConfig): RateLimitResult {
    const { maxRequests, windowMs, identifier } = config;
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // New window or expired window
      const resetTime = now + windowMs;
      this.requests.set(identifier, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime,
      };
    }

    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      };
    }

    record.count++;
    this.requests.set(identifier, record);
    
    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  reset(identifier: string) {
    this.requests.delete(identifier);
  }

  getStatus(identifier: string): { count: number; resetTime: number } | null {
    return this.requests.get(identifier) || null;
  }
}

export const rateLimiter = new RateLimiter();

// Export rate limits from config
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: ConfigRateLimits.API_REQUESTS_PER_MINUTE,
  SCRAPING_PER_HOUR: ConfigRateLimits.SCRAPING_PER_HOUR,
  LEAD_SCRAPING: {
    maxRequests: 100, // Changed from 20 to 100
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  GOOGLE_MAPS: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
  },
};

// Helper function to get user identifier for rate limiting
export const getUserIdentifier = (userId?: string): string => {
  if (userId) return `user:${userId}`;
  
  // Fallback to IP-based identification (in a real app, you'd get this from the server)
  const sessionId = sessionStorage.getItem('session_id') || 
                   Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('session_id', sessionId);
  return `session:${sessionId}`;
};