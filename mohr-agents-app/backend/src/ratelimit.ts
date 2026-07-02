// Fixed-window per-user rate limiter for the chat endpoints. Keeps token
// spend bounded per subscriber (see docs/APP_STORE_CHECKLIST.md unit
// economics). In-memory is fine here: a restart only resets the window.

const WINDOW_MS = Number(process.env.RATE_WINDOW_MS ?? 5 * 60_000);
const MAX_PER_WINDOW = Number(process.env.RATE_MAX_PER_WINDOW ?? 20);

interface Window {
  startedAt: number;
  count: number;
}

const windows = new Map<string, Window>();

// Returns null when allowed, or seconds to wait when rate-limited.
export function checkRateLimit(userId: string): number | null {
  const now = Date.now();
  const window = windows.get(userId);
  if (!window || now - window.startedAt >= WINDOW_MS) {
    windows.set(userId, { startedAt: now, count: 1 });
    return null;
  }
  if (window.count < MAX_PER_WINDOW) {
    window.count += 1;
    return null;
  }
  return Math.ceil((window.startedAt + WINDOW_MS - now) / 1000);
}

// Periodic sweep so entries for users who never return don't accumulate for
// the process lifetime. unref() keeps the timer from holding the event loop open.
const sweep = setInterval(() => {
  const now = Date.now();
  for (const [userId, window] of windows) {
    if (now - window.startedAt >= WINDOW_MS) windows.delete(userId);
  }
}, WINDOW_MS);
sweep.unref?.();
