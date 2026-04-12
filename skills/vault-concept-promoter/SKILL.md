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
- `vault-drift` for cross-domain recurrence signals
- `vault-index` when concept navigation needs refresh
- `vault-log` for append-only operation history

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
6. Refresh `index.md` when concept navigation changed.
7. Append concise operation entry to `log.md`.

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
- whether `index.md` / `log.md` were updated
- touched files
