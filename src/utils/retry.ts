// ─── Retry Utility ────────────────────────────────────────────────────────────

interface RetryOptions {
  attempts: number;
  delayMs?: number;
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Retries an async operation up to `attempts` times with optional delay.
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { attempts, delayMs = 1000, onRetry } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < attempts) {
        onRetry?.(attempt, err);
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }
  }

  throw lastError;
}
