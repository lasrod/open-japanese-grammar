# Hanabira grammar lists (archived titles)

[Hanabira](https://hanabira.org)'s Japanese grammar content, from
[tristcoil/hanabira.org-japanese-content](https://github.com/tristcoil/hanabira.org-japanese-content)
at commit `1462bb37f0eb229fea58a18eb4855428bdbffa25` (2026-09-24). It is
licensed CC BY 4.0 ([LICENSE](LICENSE), copied from that commit) and credited in
[content/references.yaml](../../content/references.yaml).

## What is used, and what is not

- **Used:** the list of points and the level each is listed at. It is a second
  list beside tanos, and it is much finer at N5 and N4 (136 and 124 titles,
  against 40 and 50).
- **Not used:** Hanabira's explanations and example sentences. The licence
  was clarified on 2026-09-24 (its issue #3, PR #4), but where the content
  came from has not been confirmed: [issue #6](https://github.com/tristcoil/hanabira.org-japanese-content/issues/6),
  which asks whether it is adapted from textbooks, has no answer yet. They are
  not archived here. Every entry is written for this work, as the source
  policy requires.

## Files

| File | Holds |
|---|---|
| `grammar-n5.titles.json`, `grammar-n4.titles.json` | The titles of `grammar_json/grammar_ja_N5…` and `…N4_full_alphabetical_0001.json`, in the source's order, and nothing else |
| `mapping.yaml` | Where each title belongs: a point OJG already has, a new point, or not a grammar point (a word) |
| `LICENSE` | Hanabira's licence at the pinned commit |

`npm run import:hanabira` checks that every title is mapped exactly once, then
adds a stub for each new point no entry cites yet. It never changes an existing
entry. Adding Hanabira to an entry's `levels.listed` would change the text its
reviews were given on, so the mapping records the agreement instead.

## How the mapping was decided

- **Merged:** variants of one point, e.g. ～ないです／～ません, くらい／ぐらい,
  けど／けれど, and the three ～ところ uses.
- **Mapped to an existing point:** at whichever level OJG files it. Hanabira
  lists some tanos N5 points at N4 (～てもいい, ～でしょう) and some tanos N3
  points at N4 (～ために, ～ようになる).
- **Skipped as words:** a question word or adverb used without a pattern of
  its own (だれ, いつも, よく). It is taught as vocabulary. A word that forms
  a pattern is kept: あまり～ない, 疑問詞＋も＋negative.
- **Candidates to merge later:** OJG-0085 (～のようてほしい, garbled in the
  archived tanos page) is probably ～てほしい. OJG-0065 and OJG-0139 are both
  ～ても.
