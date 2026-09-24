// The rules a review status is earned by (CONTRIBUTING.md, "Review status").
import test from 'node:test';
import assert from 'node:assert/strict';
import { contentHash, earnedStatus } from './lib.mjs';

const gpt = { kind: 'ai', provider: 'openai', model: 'gpt-6-astra' };
const gem = { kind: 'ai', provider: 'google', model: 'gemini-x' };

function entry(reviews = [], rebuttals) {
  const e = {
    id: 'OJG-9999',
    pattern: 'テスト',
    levels: { commonly: 'N5', listed: [] },
    references: [{ source_id: 'tanos' }],
    review: { status: 'draft', drafted_by: { provider: 'anthropic', model: 'claude' } },
  };
  const hash = contentHash(e);
  e.review.reviews = reviews.map((r) => ({ by: r.model ?? r.by, date: '2026-09-24', content_sha256: hash, ...r }));
  if (rebuttals) e.review.rebuttals = rebuttals.map((b) => ({ content_sha256: hash, note: 'Not so.', ...b }));
  return e;
}

test('a model-drafted entry and one agreeing reviewer from another provider earn ai-reviewed', () => {
  assert.equal(earnedStatus(entry([{ ...gpt, verdict: 'agree' }])), 'ai-reviewed');
});

test('an edit makes every review stale', () => {
  const e = entry([{ ...gpt, verdict: 'agree' }]);
  e.pattern = 'テスト２';
  assert.equal(earnedStatus(e), null);
});

test('asking again cannot wash out an objection', () => {
  assert.equal(earnedStatus(entry([{ ...gpt, verdict: 'disagree' }, { ...gpt, verdict: 'agree' }])), null);
});

test('a reconsidered ruling replaces an objection only after a rebuttal to that reviewer', () => {
  const rulings = [{ ...gpt, verdict: 'disagree' }, { ...gpt, verdict: 'agree', reconsidered: true }];
  assert.equal(earnedStatus(entry(rulings)), null, 'no rebuttal');
  assert.equal(earnedStatus(entry(rulings, [{ against: gem }])), null, 'rebuttal to someone else');
  assert.equal(earnedStatus(entry(rulings, [{ against: gpt }])), 'ai-reviewed');
});

test('an objection from any reviewer blocks, whoever else agrees', () => {
  assert.equal(earnedStatus(entry([{ ...gpt, verdict: 'agree' }, { ...gem, verdict: 'disagree' }])), null);
});

test('a native agreement outranks AI objections, not a native objection', () => {
  const native = (by, verdict) => ({ kind: 'native', by, verdict });
  assert.equal(earnedStatus(entry([{ ...gpt, verdict: 'disagree' }, native('Aiko', 'agree')])), 'native-reviewed');
  assert.equal(earnedStatus(entry([native('Aiko', 'agree'), native('Ken', 'disagree')])), null);
});
