// ─── Logger Utility ───────────────────────────────────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const PREFIX = '[Novel2Visual]';

function log(level: LogLevel, context: string, ...args: unknown[]): void {
  const tag = `${PREFIX} [${context}]`;
  switch (level) {
    case 'debug':
      console.debug(tag, ...args);
      break;
    case 'info':
      console.info(tag, ...args);
      break;
    case 'warn':
      console.warn(tag, ...args);
      break;
    case 'error':
      console.error(tag, ...args);
      break;
  }
}

export function createLogger(context: string) {
  return {
    debug: (...args: unknown[]) => log('debug', context, ...args),
    info: (...args: unknown[]) => log('info', context, ...args),
    warn: (...args: unknown[]) => log('warn', context, ...args),
    error: (...args: unknown[]) => log('error', context, ...args),
  };
}
