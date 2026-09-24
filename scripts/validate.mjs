#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { at, loadContent, entriesOf, earnedStatus } from './lib.mjs';

const content = loadContent();
const ajv = new Ajv2020({ allErrors: true, allowUnionTypes: true });
const schema = JSON.parse(readFileSync(at('schemas/grammar_level.schema.json'), 'utf8'));
const validateLevel = ajv.compile(schema);
const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

for (const file of content.files) {
  if (!validateLevel(file.data)) {
    for (const e of validateLevel.errors) fail(file.file, `${e.instancePath} ${e.message}`);
  }
  if (file.data.level !== file.level) {
    fail(file.file, `level is ${file.data.level}, expected ${file.level}`);
  }
}

const entries = entriesOf(content);
const ids = new Map();
const sources = new Set(content.references.reference_sources.map((s) => s.id));
const retired = new Set((content.meta.retired ?? []).map((r) => r.id));
for (const { entry, file } of entries) {
  const where = `${file.file} ${entry.id}`;
  if (ids.has(entry.id)) fail(where, `duplicate id, also in ${ids.get(entry.id)}`);
  ids.set(entry.id, file.file);
  if (retired.has(entry.id)) fail(where, 'id is retired and may not be reused');
  if (entry.levels?.commonly !== file.level) {
    fail(where, `filed under ${file.level} but levels.commonly is ${entry.levels?.commonly}`);
  }
  for (const r of [...(entry.references ?? []), ...(entry.levels?.listed ?? [])]) {
    if (!sources.has(r.source_id)) fail(where, `unknown source_id ${r.source_id}`);
  }
}
// A status is earned by reviews of the text as it stands, never claimed.
const RANK = { stub: 0, draft: 1, 'ai-reviewed': 2, 'native-reviewed': 3 };
for (const { entry, file } of entries) {
  const claimed = entry.review?.status;
  if (RANK[claimed] >= 2) {
    const earned = earnedStatus(entry);
    if (!earned || RANK[earned] < RANK[claimed]) {
      fail(`${file.file} ${entry.id}`, `status ${claimed} is not earned by reviews of the current text; set it back to draft and review again`);
    }
  }
}

for (const { entry, file } of entries) {
  for (const d of entry.distinguish_from ?? []) {
    const where = `${file.file} ${entry.id}`;
    if (!ids.has(d.id)) fail(where, `distinguish_from ${d.id} does not exist`);
    if (d.id === entry.id) fail(where, 'distinguishes itself from itself');
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`validate: ${errors.length} problem(s)`);
  process.exit(1);
}
console.log(`validate: ok (${entries.length} entries)`);
