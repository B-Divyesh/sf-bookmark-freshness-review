import type { LinkState } from './types';

export const MIN_HOST_INTERVAL_MS = 1_500;

export function classifyHttpStatus(status: number): Exclude<LinkState, 'unchecked' | 'redirected'> {
  if (status === 404 || status === 410) return 'dead';
  if ([401, 402, 403, 407, 429, 451].includes(status)) return 'restricted';
  if (status >= 200 && status < 400) return 'alive';
  return 'failed';
}

export function linkRequestInit(): RequestInit {
  return {
    method: 'GET', redirect: 'follow', credentials: 'omit', cache: 'no-store',
    headers: { Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1' }
  };
}

export function retryDelay(value: string | null, now = Date.now()): number {
  if (!value) return 5_000;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(seconds * 1000, MIN_HOST_INTERVAL_MS);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(date - now, MIN_HOST_INTERVAL_MS) : 5_000;
}
