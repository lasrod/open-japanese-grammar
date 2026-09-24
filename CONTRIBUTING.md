# Contributing

Thank you for helping. The work is turning stubs into entries a learner can
trust, and making existing entries more accurate and clearer.

## Where to make changes

Edit [content/](content/) only:

- [content/grammar/](content/grammar/) for entries. An entry lives in the file
  for its `levels.commonly`.
- [content/references.yaml](content/references.yaml) to add a source. A new
  source needs its licence quoted from the source's own page, with the URL.
- [content/ojg.yaml](content/ojg.yaml) for metadata, and for retiring ids.

Then run `npm run validate && npm run build` and commit the regenerated
`dist/` and `generated/` with your change. CI fails if they are stale.

## Entry fields

A **stub** needs `id`, `pattern`, `levels`, `references` and `review`
(`status: stub`). Any other status needs every section:

| Field | Section | What it holds |
|---|---|---|
| `title` | — | An English name, as a learner would say what the point does. |
| `meaning` | Meaning | The point in one line, under 140 characters. Tools quote it verbatim. |
| `when` | When to use it | What the point does in a sentence, and the situations it is for. |
| `why` | Why it works this way | The reasoning a learner could rebuild the rule from. |
| `formation` | How it is formed | One or more `form`s, each with an optional `note`. |
| `examples` | Examples | At least two, each with `japanese`, a full kana `reading`, and `english`. |
| `mistake` | A common mistake | `wrong`, `problem`, `right`: a sentence learners really produce, what is wrong with it, and the fix. |

Optional: `distinguish_from` (neighbouring points and the difference) and
`register` (plain, polite, humble, honorific, written, spoken, casual).

[OJG-0018 〜ている](content/grammar/N5.yaml) and
[OJG-0082 〜てある](content/grammar/N4.yaml) are complete entries to copy from.

## Writing an entry

- **Explain why, not only what.** "Use が here" is a rule to memorise. "が
  introduces something the listener did not know about yet, so it goes on the
  new thing" is a reason, and a learner can apply it to sentences the entry
  never shows. The `why` field is the heart of an entry.
- **Name what a learner can recognise.** A form, a particle, a kind of verb.
  "Only verbs that take を" can be checked; "only suitable verbs" cannot.
- **Keep examples plain.** Everyday situations and common words, at or below
  the point's level where possible. Every example gets a full kana reading.
- **The mistake must be real.** Choose the error learners actually make, not
  a strawman.
- **Say less rather than overstate.** A nuance you are unsure of goes in
  `review.note` as a question, not into the entry as a fact.

## Source policy

Write everything in your own words. Do not copy or closely paraphrase a
textbook, a grammar dictionary, or a site whose terms forbid reuse (for
example JLPT Sensei or Bunpro), even for a point they also cover. Open sources
are credited in `references.yaml`.

## Ids

Ids are permanent. Never renumber, reuse or delete one. To merge two points,
keep one and add the other to `retired` in `ojg.yaml`, naming the id that
replaced it. `npm run import:tanos` assigns the next free number to new stubs.

## Review status

`stub` → `draft` → `ai-reviewed` → `native-reviewed`. A status is earned by
reviews, never typed in:

- Record who wrote an entry in `review.drafted_by` (`provider`: `human`,
  `anthropic`, `openai`, `google`; and `model` for a model).
- Every review carries the `content_sha256` of the entry it judged. Editing an
  entry makes its earlier reviews stale, and `npm run validate` rejects a
  status the current text has not earned. Set it back to `draft`, and review
  again.
- **ai-reviewed** needs agreement on the current text from two AI providers.
  A drafting model counts as one, so a model-drafted entry needs one reviewer
  from another provider, and a human-drafted entry needs two.
  `scripts/review.mjs` does this:

  ```bash
  node --env-file=.env scripts/review.mjs --provider openai --model <model> --level N5
  ```

  It sends only written `draft` entries, never to the provider that drafted
  them, and records each ruling. When the reviewer disagrees, its note says
  what to change: revise the entry, then review again. A reviewer rules once
  on a given text, and any objection to the current text blocks the status:
  asking again until it agrees would wash the objection out.
- **When an objection is wrong**, do not change correct text to get past it.
  Add a rebuttal to `review.rebuttals` saying why, with the entry's current
  `content_sha256`, and run `scripts/review.mjs --reconsider`. The reviewer
  sees its objection and the rebuttal and rules again, and both stay in the
  record for anyone to check.
- **native-reviewed** needs a named native speaker's agreement
  (`kind: native`) on the current text, given in their own pull request.
  Nobody marks an entry `native-reviewed` on someone else's behalf.
