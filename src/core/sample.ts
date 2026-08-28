import type { BookmarkRecord } from './types';

export const sampleBookmarks: BookmarkRecord[] = [
  { id: 'sample-1', title: 'Field Notes on Durable Web Archives', url: 'https://archive.example.org/field-notes', folder: 'Research methods', addedAt: 1514764800000, note: 'Citation method for the methods chapter.', decision: 'keep', state: 'alive', statusCode: 200, checkedAt: 1787875200000 },
  { id: 'sample-2', title: 'Old lab wiki', url: 'https://lab.example.org/wiki', folder: 'Research methods', addedAt: 1451606400000, note: '', decision: 'review', state: 'dead', statusCode: 404, checkedAt: 1787875200000 },
  { id: 'sample-3', title: 'Journal article', url: 'https://journal.example.com/article/42', folder: 'Sources', addedAt: 1577836800000, note: 'Open in the work profile. Library login required.', decision: 'review', state: 'restricted', statusCode: 403, checkedAt: 1787875200000 },
  { id: 'sample-4', title: 'Data handbook mirror', url: 'https://mirror.example.net/handbook?utm_source=old-mail', folder: 'Sources', addedAt: 1546300800000, note: '', decision: 'review', state: 'redirected', statusCode: 200, finalUrl: 'https://data.example.net/handbook', canonicalUrl: 'https://data.example.net/handbook', checkedAt: 1787875200000 },
  { id: 'sample-5', title: 'Data handbook', url: 'https://data.example.net/handbook', folder: 'Sources', addedAt: 1609459200000, note: 'Canonical copy.', decision: 'keep', state: 'alive', statusCode: 200, duplicateOf: 'sample-4', checkedAt: 1787875200000 },
  { id: 'sample-6', title: 'Conference reading list', url: 'https://reading.example.edu/2020', folder: 'Reading lists', addedAt: 1593561600000, note: '', decision: 'review', state: 'failed', error: 'The site did not answer.', checkedAt: 1787875200000 }
];
