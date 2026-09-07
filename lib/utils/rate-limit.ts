interface RateLimitRecord {
  lastRequestTime: number;
  requestCountInWindow: number;
  windowStartTime: number;
}

const clientMap = new Map<string, RateLimitRecord>();

// Clean up stale entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  for (const [ip, record] of clientMap.entries()) {
    if (now - record.windowStartTime > oneHour) {
      clientMap.delete(ip);
    }
  }
}, 15 * 60 * 1000).unref?.();

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfterSeconds?: number;
}

export function checkRateLimit(clientIp: string): RateLimitResult {
  const now = Date.now();
  const minDelayMs = 1500; // 1.5 seconds between consecutive requests
  const windowMs = 60 * 60 * 1000; // 1 hour window
  const maxRequestsPerWindow = 30; // generous quota for testing and demoing

  const record = clientMap.get(clientIp);

  if (!record) {
    clientMap.set(clientIp, {
      lastRequestTime: now,
      requestCountInWindow: 1,
      windowStartTime: now,
    });
    return { allowed: true };
  }

  // 1. Throttling: Check minimum delay between requests
  const timeSinceLast = now - record.lastRequestTime;
  if (timeSinceLast < minDelayMs) {
    const waitSeconds = Math.ceil((minDelayMs - timeSinceLast) / 1000);
    return {
      allowed: false,
      reason: 'Please wait a moment between consecutive analysis requests.',
      retryAfterSeconds: waitSeconds,
    };
  }

  // 2. Hourly window reset
  if (now - record.windowStartTime > windowMs) {
    record.windowStartTime = now;
    record.requestCountInWindow = 1;
    record.lastRequestTime = now;
    return { allowed: true };
  }

  // 3. Check quota ceiling
  if (record.requestCountInWindow >= maxRequestsPerWindow) {
    const resetTimeLeft = Math.ceil((windowMs - (now - record.windowStartTime)) / 1000);
    return {
      allowed: false,
      reason: `Hourly rate limit exceeded (${maxRequestsPerWindow} requests/hour). Please try again later.`,
      retryAfterSeconds: resetTimeLeft,
    };
  }

  record.requestCountInWindow += 1;
  record.lastRequestTime = now;
  return { allowed: true };
}
