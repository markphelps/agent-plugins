---
name: vault-organize
description:
  Reorganize curated vault files (rename/group/frontmatter) without touching raw
  evidence
---

# Organize Vault

Reorganize curated notes/projects with minimal churn.

## Arguments

`arguments` may include:

- optional scope/path (default active curated surface)
- `--mode report|apply-safe|apply` (default: `report`)

## Process

1. Detect naming/layout/frontmatter inconsistencies.
2. Propose a concrete file-operation plan (moves/renames/frontmatter fixes).
3. In `report`, output plan only.
4. In `apply-safe`, apply low-risk operations with straightforward link
   rewrites.
5. In `apply`, allow broader folder regrouping when link updates are clear.
6. Rewrite affected wikilinks and append `log.md` entry.

## Safety

- Never touch `raw/*`.
- Keep filenames kebab-case.
- Prefer small batches over large reshuffles.

## Output

Return:

- plan + confidence
- operations executed/proposed
- link rewrites
- touched files
