#!/usr/bin/env node
// Adds a stub for every point on the archived tanos lists that no entry cites
// yet. It never changes an existing entry: once a point is in content/, people
// own it, not this script.
import { readFileSync } from 'node:fs';
import { at, loadContent, entriesOf, writeLevelFile } from './lib.mjs';

const content = loadContent();
const entries = entriesOf(content);
const cited = new Set(
  entries.flatMap(({ entry }) =>
    (entry.levels?.listed ?? [])
      .filter((l) => l.source_id === 'tanos')
      .map((l) => String(l.ref)),
  ),
);
const retired = content.meta.retired ?? [];
const used = [...entries.map(({ entry }) => entry.id), ...retired.map((r) => r.id)];
let next = Math.max(0, ...used.map((id) => Number(id.slice(4)))) + 1;

let added = 0;
for (const n of [5, 4, 3, 2, 1]) {
  const level = `N${n}`;
  const html = readFileSync(at('sources/tanos', `grammar-n${n}.html`), 'utf8');
  const file = content.files.find((f) => f.level === level);
  const seen = new Set();
  for (const [, ref, raw] of html.matchAll(/grammarid=(\d+)">([^<]*)<\/a>/g)) {
    if (seen.has(ref) || cited.has(ref)) continue;
    seen.add(ref);
    const item = raw.trim();
    file.data.entries.push({
      id: `OJG-${String(next++).padStart(4, '0')}`,
      pattern: item,
      levels: { commonly: level, listed: [{ source_id: 'tanos', level, item, ref: Number(ref) }] },
      references: [{ source_id: 'tanos', ref: Number(ref) }],
      review: { status: 'stub' },
    });
    added++;
  }
}

for (const file of content.files) {
  if (file.data.entries.length === 0) continue;
  const where = file.level === 'none' ? 'no JLPT level' : file.level;
  writeLevelFile(file, ` Open Japanese Grammar: points commonly listed at ${where}.\n See CONTRIBUTING.md before editing.`);
}
console.log(`import-tanos: ${added} stub(s) added`);
