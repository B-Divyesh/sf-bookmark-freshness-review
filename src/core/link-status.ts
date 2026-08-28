import type { LinkState } from './types';

export function classifyHttpStatus(status: number): Exclude<LinkState, 'unchecked' | 'redirected'> {
  if (status === 404 || status === 410) return 'dead';
  if ([401, 402, 403, 407, 429, 451].includes(status)) return 'restricted';
  if (status >= 200 && status < 400) return 'alive';
  return 'failed';
}
