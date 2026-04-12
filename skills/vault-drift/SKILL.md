---
name: vault-drift
description: Surface recurring themes and unconscious patterns across your vault
---

# Drift

Surface cross-domain recurring patterns in the active vault and route durable
ones into concept pages.

## Parameters

- `--path PATH` vault path (default: current directory)
- `--since DAYS` recency window (default: all)
- `--mode report|apply-safe|apply` (default: `report`)

## Workflow

1. Scan active markdown surface (exclude `raw/*`, `archive/*`, hidden dirs).
2. Extract recurring signals across unrelated notes:
   - phrases/metaphors
   - concepts/principles
   - unresolved questions
3. Filter false positives:
   - deliberate tag repetition
   - filler/common phrasing
   - same-project-only repetition
4. Cluster patterns and rank by confidence.
5. Execute by mode:
   - `report`: return drift findings only
   - `apply-safe`: update existing concept pages via `vault-concept-promoter`
   - `apply`: also propose/create new concept-page candidates when confidence is
     high

## Confidence Rubric

- `high`: appears in 3+ unrelated notes with temporal spread
- `medium`: appears in 2 unrelated notes with strong overlap
- `low`: weak recurrence or same-domain concentration

## Output

Return top drift clusters (default cap: 5), each with:

- drift label
- confidence
- momentum signal (accelerating|steady|fading)
- evidence quotes + `[[wikilinks]]`
- recommended concept action

## Constraints

- Only surface cross-domain patterns.
- Quote evidence directly; do not fabricate.
- Avoid psychoanalysis; report observable patterns.
- Prefer canonical concept updates over one-off drift files.
