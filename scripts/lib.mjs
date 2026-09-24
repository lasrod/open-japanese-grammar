import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const at = (...parts) => join(root, ...parts);
export const readYaml = (path) => YAML.parse(readFileSync(path, 'utf8'));

/** The document, its references, and every level file with its entries. */
export function loadContent() {
  const meta = readYaml(at('content/ojg.yaml'));
  const references = readYaml(at('content/references.yaml'));
  const files = meta.level_files.map(({ file, level }) => {
    const path = at('content/grammar', file);
    const data = existsSync(path)
      ? readYaml(path)
      : { schema_version: meta.schema_version, level, entries: [] };
    return { file, level, path, data };
  });
  return { meta, references, files };
}

/** Every entry, with the file it lives in. */
export const entriesOf = ({ files }) =>
  files.flatMap((f) => (f.data.entries ?? []).map((entry) => ({ entry, file: f })));

/** The order an entry reads in: what it is, the explanation, then its sources. */
export const FIELD_ORDER = [
  'id', 'pattern', 'title', 'meaning', 'when', 'why', 'formation', 'examples',
  'mistake', 'distinguish_from', 'register', 'levels', 'references', 'review',
];

const ordered = (entry) => Object.fromEntries(
  [...FIELD_ORDER.filter((k) => k in entry), ...Object.keys(entry).filter((k) => !FIELD_ORDER.includes(k))]
    .map((k) => [k, entry[k]]),
);

/** The entry a review judges: everything but the review itself, in reading order. */
export function contentHash(entry) {
  const { review, ...content } = ordered(entry);
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

/**
 * The status an entry's reviews earn. ai-reviewed needs two AI providers in
 * agreement on the current text: the drafting model counts as one, and a
 * review of an earlier version counts for nothing. native-reviewed needs a
 * named native speaker's agreement on the current text.
 */
export function earnedStatus(entry) {
  const hash = contentHash(entry);
  const current = (entry.review?.reviews ?? []).filter(
    (r) => r.verdict === 'agree' && r.content_sha256 === hash,
  );
  if (current.some((r) => r.kind === 'native')) return 'native-reviewed';
  const providers = new Set(current.filter((r) => r.kind === 'ai' && r.provider).map((r) => r.provider));
  const drafter = entry.review?.drafted_by?.provider;
  if (drafter && drafter !== 'human') providers.add(drafter);
  return providers.size >= 2 ? 'ai-reviewed' : null;
}

export function writeLevelFile(file, header) {
  const doc = new YAML.Document({ ...file.data, entries: file.data.entries.map(ordered) });
  doc.commentBefore = header;
  writeFileSync(file.path, doc.toString({ lineWidth: 0 }));
}
