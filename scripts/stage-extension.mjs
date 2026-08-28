import { mkdir, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const output = '.output';
const files = await readdir(output);
const zip = files.find(file => file.endsWith('.zip'));
if (!zip) throw new Error('WXT did not produce an extension zip.');
const target = 'site/public/downloads';
await mkdir(target, { recursive: true });
await copyFile(path.join(output, zip), path.join(target, 'bookmark-freshness-review.zip'));
