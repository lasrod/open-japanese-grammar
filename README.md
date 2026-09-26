# Open Japanese Grammar

Every Japanese grammar point a learner meets, from the first です to N1 and
beyond the JLPT. Each one is described and reasoned: what it means, when to use
it, **why it works the way it does**, how it is formed, examples with readings,
a mistake learners make, and the neighbouring points it is confused with.

It is openly licensed (CC BY 4.0), so apps, teachers and other projects can
build on it. It is written to be checked and improved in the open.

## Status

The list of points comes from Jonathan Waller's JLPT lists (tanos.co.uk,
CC BY): 287 points from N5 to N1. Hanabira's finer N5 and N4 lists (CC BY 4.0)
added 62 more: its list and levels only, never its text
([sources/hanabira/](sources/hanabira/)). Most are **stubs**, which hold only the
pattern and the level it is commonly listed at. The work is to turn stubs into
full entries. [generated/coverage.md](generated/coverage.md) shows how far that
has got.

Levels are where a point is **commonly listed**. There has been no official
JLPT grammar list since 2010, and lists disagree.

## Repository structure

- [content/](content/) is the source of truth, and the only place to edit.
  - [content/ojg.yaml](content/ojg.yaml): metadata, source policy, id scheme,
    review statuses, retired ids.
  - [content/references.yaml](content/references.yaml): the sources, with
    their licences.
  - [content/grammar/](content/grammar/): one file per level (`N5.yaml` …
    `N1.yaml`, and `beyond.yaml` for points outside the JLPT).
- [schemas/](schemas/): the JSON Schema every level file must meet.
- [dist/](dist/): generated files for tools. `ojg.full.json` is the whole
  work; `ojg.jsonl` has one entry per line.
- [generated/](generated/): generated reports.
- [sources/](sources/): archived copies of the sources the list was seeded from.
- [scripts/](scripts/): import, validation and build.

Do not edit `dist/` or `generated/` by hand.

## Commands

Requires Node 22+.

```bash
npm install
npm run validate     # schema and cross-checks
npm run build        # regenerate dist/ and generated/
npm run check        # what CI runs: validate, and fail if outputs are stale
```

## Using it

Pin a release and read `dist/ojg.full.json`. Ids (`OJG-0082`) are permanent. A
point that is merged or split is listed under `retired` with what replaced it,
so a stored id can always be followed.

## Licence

© 2026 Jesper Brännström and contributors, under
[CC BY 4.0](LICENSE.md). The list of points and their levels is derived from
Jonathan Waller's JLPT Resources (http://www.tanos.co.uk/jlpt/, CC BY) and,
for N5 and N4, from Hanabira (https://hanabira.org, CC BY 4.0).
