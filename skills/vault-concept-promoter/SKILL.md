---
name: vault-concept-promoter
description:
  Promote repeated themes into canonical concept pages under notes/concepts
---

# Concept Promoter

Keep `notes/concepts/` as the canonical synthesis layer for recurring ideas.

## Arguments

`arguments` may include:

- optional topic/scope
- `--mode report|apply-safe|apply` (default: `report`)

## Compose Existing Skills

- `vault-lint` for repetition and missing-concept signals
- `vault-synthesis --kind drift` for recurring cross-domain patterns
- `vault-synthesis --kind trace` for historical evolution
- `vault-index` for navigation refresh when needed
- `vault-log` for operation history

## Process

1. Identify repeated themes across active notes/projects.
2. Decide update-vs-create for concept pages.
3. In `report`, propose promotions only.
4. In `apply-safe`, apply additive updates to existing concept pages.
5. In `apply`, allow creation of clear new concept pages when evidence is strong
   (3+ unrelated notes).
6. Normalize references to point at canonical concepts.
7. Refresh `index.md` if navigation changed and append `log.md` entry.

## Safety

- Prefer updating existing pages over creating near-duplicates.
- No archival/deletion actions in this skill.

## Output

Return:

- concepts created/updated
- evidence used
- reference normalization
- touched files
