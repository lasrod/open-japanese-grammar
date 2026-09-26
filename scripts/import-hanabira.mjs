#!/usr/bin/env node
// Adds a stub for every `new` group in sources/hanabira/mapping.yaml that no
// entry cites yet. Like import-tanos, it never changes an existing entry.
//
// First it checks the mapping: every archived Hanabira title appears exactly
// once, and every `ojg` id exists. A title Hanabira adds later fails here
// until someone decides where it belongs.
import { readFileSync } from 'node:fs';
import { at, loadContent, entriesOf, readYaml, writeLevelFile } from './lib.mjs';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

function checkMapping(groups, titles, ids) {
  const problems = [];
  const seen = new Map();
  for (const [i, group] of groups.entries()) {
    const kinds = ['ojg', 'new', 'skip'].filter((k) => k in group);
    if (kinds.length !== 1) problems.push(`group ${i}: needs exactly one of ojg, new, skip`);
    if (group.ojg && !ids.has(group.ojg)) problems.push(`group ${i}: unknown ${group.ojg}`);
    if (!group.items?.length) problems.push(`group ${i}: no items`);
    for (const { level, item } of group.items ?? []) {
      const key = `${level}|${item}`;
      if (!titles[level]?.includes(item)) problems.push(`group ${i}: ${level} has no title "${item}"`);
      if (seen.has(key)) problems.push(`"${item}" (${level}) is in groups ${seen.get(key)} and ${i}`);
      seen.set(key, i);
    }
  }
  for (const [level, list] of Object.entries(titles)) {
    for (const item of list) {
      if (!seen.has(`${level}|${item}`)) problems.push(`${level} "${item}" is not mapped`);
    }
  }
  return problems;
}

const content = loadContent();
const entries = entriesOf(content);
const retired = content.meta.retired ?? [];
const ids = new Set([...entries.map(({ entry }) => entry.id), ...retired.map((r) => r.id)]);

const titles = {};
for (const level of ['N5', 'N4']) {
  const path = at('sources/hanabira', `grammar-${level.toLowerCase()}.titles.json`);
  titles[level] = JSON.parse(readFileSync(path, 'utf8')).titles;
}
const groups = readYaml(at('sources/hanabira/mapping.yaml'));
const problems = checkMapping(groups, titles, ids);
if (problems.length) {
  for (const p of problems) console.error(`import-hanabira: ${p}`);
  process.exit(1);
}

const cited = new Set(
  entries.flatMap(({ entry }) =>
    (entry.references ?? []).filter((r) => r.source_id === 'hanabira').map((r) => r.ref),
  ),
);
let next = Math.max(0, ...[...ids].map((id) => Number(id.slice(4)))) + 1;
let added = 0;
for (const group of groups) {
  if (!group.new || cited.has(group.new)) continue;
  // Filed at the easiest level Hanabira lists it at.
  const level = LEVELS.find((l) => group.items.some((i) => i.level === l));
  const file = content.files.find((f) => f.level === level);
  file.data.entries.push({
    id: `OJG-${String(next++).padStart(4, '0')}`,
    pattern: group.new,
    levels: {
      commonly: level,
      listed: group.items.map(({ level, item }) => ({ source_id: 'hanabira', level, item })),
    },
    references: [{ source_id: 'hanabira', ref: group.new }],
    review: { status: 'stub' },
  });
  added++;
}

for (const file of content.files) {
  if (file.data.entries.length === 0) continue;
  const where = file.level === 'none' ? 'no JLPT level' : file.level;
  writeLevelFile(file, ` Open Japanese Grammar: points commonly listed at ${where}.\n See CONTRIBUTING.md before editing.`);
}
console.log(`import-hanabira: ${added} stub(s) added`);
