/**
 * Simple client-side token-bucket / sliding window Rate Limiter for sensitive actions (e.g. PIN verification, login)
 */

interface RateLimitTracker {
  attempts: number;
  firstAttemptTime: number;
  lockedUntil?: number;
}

const trackers: Record<string, RateLimitTracker> = {};

export const checkRateLimit = (
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60 * 1000,
  lockoutMs: number = 5 * 60 * 1000
): { allowed: boolean; remaining: number; lockedUntilMs?: number; message?: string } => {
  const now = Date.now();
  const tracker = trackers[key] || { attempts: 0, firstAttemptTime: now };

  // Check if locked
  if (tracker.lockedUntil && now < tracker.lockedUntil) {
    const remainingSeconds = Math.ceil((tracker.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      lockedUntilMs: tracker.lockedUntil,
      message: `Too many failed attempts. Please try again in ${remainingSeconds} seconds.`
    };
  }

  // Reset window if window duration passed
  if (now - tracker.firstAttemptTime > windowMs) {
    tracker.attempts = 0;
    tracker.firstAttemptTime = now;
    delete tracker.lockedUntil;
  }

  return {
    allowed: tracker.attempts < maxAttempts,
    remaining: Math.max(0, maxAttempts - tracker.attempts)
  };
};

export const recordAttempt = (
  key: string,
  success: boolean,
  maxAttempts: number = 5,
  windowMs: number = 60 * 1000,
  lockoutMs: number = 5 * 60 * 1000
) => {
  const now = Date.now();
  if (!trackers[key]) {
    trackers[key] = { attempts: 0, firstAttemptTime: now };
  }

  if (success) {
    delete trackers[key];
    return;
  }

  const tracker = trackers[key];
  tracker.attempts += 1;

  if (tracker.attempts >= maxAttempts) {
    tracker.lockedUntil = now + lockoutMs;
  }
};
