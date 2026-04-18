---
name: vault-concept-promoter
description:
  Promote repeated themes into canonical concept pages under notes/concepts
---

# Concept Promoter

Promote recurring patterns into canonical concept pages and keep concept
navigation coherent.

## Parameters

- optional topic or scope path
- `--mode report|apply-safe|apply` (default: `report`)

## Compose Existing Skills

- `vault-lint` for repeated-theme candidate discovery
- `vault-concepts` for the current canonical concept workflow
- `vault-maintain` for periodic full-vault maintenance

## Workflow

1. Scan active curated areas (`notes/`, `projects/`, `resources/`).
2. Detect recurring themes and candidate concept targets.
3. Decide action per candidate:
   - update existing concept page
   - create new concept page
   - defer (insufficient evidence)
4. Apply by mode:
   - `report`: propose concept actions only
   - `apply-safe`: update existing concept pages only
   - `apply`: update existing pages and create new pages when thresholds are met
5. Normalize references so transient notes point to canonical concept pages.
6. Refresh supporting navigation manually if your vault keeps a curated
   `index.md`.
7. Append a concise operation entry manually if your vault keeps `log.md`.

## Apply Thresholds

Allow creation (`apply`) only when all are true:

- theme appears in 3+ unrelated notes
- evidence is concrete and linkable
- destination concept is clear
- change is additive and low-risk

## Safety

- Prefer updating existing concept pages over creating near-duplicates.
- Do not archive/delete notes from this skill.
- Use `archive/` as evidence only when historically necessary.

## Output

Return:

- concepts created/updated/proposed
- evidence links used
- reference normalization performed
- whether supporting navigation or logs were updated
- touched files
