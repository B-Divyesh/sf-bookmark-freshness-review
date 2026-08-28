import { readFileSync } from 'node:fs';

const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8'));
const tests = [
  readFileSync('tests/e2e/extension.spec.ts', 'utf8'),
  readFileSync('tests/e2e/site.spec.ts', 'utf8'),
  readFileSync('tests/unit/bookmarks.test.ts', 'utf8'),
  readFileSync('tests/unit/static-config.test.ts', 'utf8')
].join('\n');
const ids = claims.map(claim => claim.id);

if (new Set(ids).size !== ids.length) throw new Error('Claim IDs must be unique.');
for (const claim of claims) {
  const tag = `@claim:${claim.id}`;
  const occurrences = tests.split(tag).length - 1;
  if (occurrences !== 1) throw new Error(`${tag} must occur in exactly one test; found ${occurrences}.`);
  if (!claim.test.includes(tag)) throw new Error(`${tag} must appear in its documented command.`);
  if (!/demo/i.test(claim.sandbox)) throw new Error(`${tag} must document its demo entry point.`);
}

const taggedIds = [...tests.matchAll(/@claim:([a-z0-9-]+)/g)].map(match => match[1]);
for (const id of taggedIds) if (!ids.includes(id)) throw new Error(`@claim:${id} is not listed in .factory/claims.json.`);

console.log(`Verified ${claims.length} claims: unique IDs, one tagged test each, and documented demo sandboxes.`);
