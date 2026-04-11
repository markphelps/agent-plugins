---
name: vault-project-tracker
description:
  Maintain project-tracker.md and manage project lifecycle state changes
---

# Project Tracker

Keep `projects/project-tracker.md` aligned with actual project state.

## Arguments

`arguments` may include:

- optional project name/path
- optional explicit transition target
- `--mode report|apply-safe|apply` (default: `report`)

## Lifecycle States

- `active`, `exploring`, `paused`, `shipped`, `archived`

## Process

1. Read tracker and current `projects/` surface.
2. Detect mismatches and lifecycle candidates.
3. In `report`, return proposed transitions only.
4. In `apply-safe`, apply unambiguous tracker updates.
5. In `apply`, perform transitions requiring file moves (including archive
   moves) when links can be rewritten safely.
6. Keep tracker concise and append lifecycle entry to `log.md`.

## Safety

- Prefer archive moves over deletion.
- Do not archive active projects without clear evidence/instruction.
- Keep project history in project docs, not only tracker rows.

## Output

Return:

- transitions applied/proposed
- files moved/rewritten
- tracker sections changed
- touched files
