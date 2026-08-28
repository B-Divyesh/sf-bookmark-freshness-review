export type LinkState = 'unchecked' | 'alive' | 'redirected' | 'restricted' | 'dead' | 'failed';
export type Decision = 'review' | 'keep' | 'archive';

export interface BookmarkRecord {
  id: string;
  title: string;
  url: string;
  folder: string;
  addedAt?: number;
  note: string;
  decision: Decision;
  state: LinkState;
  statusCode?: number;
  checkedAt?: number;
  finalUrl?: string;
  canonicalUrl?: string;
  error?: string;
  duplicateOf?: string;
}

export interface CheckResult {
  state: Exclude<LinkState, 'unchecked'>;
  statusCode?: number;
  finalUrl?: string;
  canonicalUrl?: string;
  error?: string;
}
