---
name: vault-lint
description:
  Lint vault for contradictions, stale pages, orphans, and weak linking
---

# Lint Vault

Run an active-surface hygiene pass and route execution to specialized skills.

## Arguments

`arguments` may include:

- optional scope/path
- `--mode report|apply-safe|apply` (default: `report`)

## Checks

- contradictions across related notes
- stale pages and weakly connected/orphan pages
- broken/ambiguous wikilinks
- duplicated concept surfaces
- archive candidates and concept-promotion candidates

## Process

1. Build prioritized issue list with file references.
2. In `report`, return findings only.
3. In `apply-safe`, apply low-risk direct fixes (link normalization,
   formatting-level hygiene).
4. In `apply`, additionally invoke `vault-archive-audit --mode apply-safe` and
   `vault-concept-promoter --mode apply-safe` where confidence is high.
5. Append lint entry to `log.md` when changes are applied.

## Safety

- Exclude `raw/*` and `archive/*` unless explicitly requested.
- Keep destructive actions out of lint.

## Output

Return:

- findings by severity
- actions applied/deferred
- follow-up skills recommended
- touched files
