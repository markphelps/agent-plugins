---
name: vault-archive-audit
description:
  Audit project and note candidates for archival and optionally apply safe
  archive moves
---

# Archive Audit

Identify dead/superseded curated material and move it to `archive/` when
confidence is sufficient.

## Parameters

- optional scope/path
- `--mode report|apply-safe|apply` (default: `report`)

## Compose Existing Skills

- `vault-project-tracker --mode report` for project-state mismatches
- `vault-lint` for stale/orphan candidate signals
- `vault-log` for append-only operation history

## Mode Behavior

- `report`: candidate discovery and ranking only
- `apply-safe`: archive high-confidence candidates only
- `apply`: include medium-confidence candidates when link rewrites are
  deterministic

## Workflow

1. Scan active curated surface (`projects/` + active `notes/`).
2. Classify each candidate:
   - `safe-now`
   - `safe-with-rewrites`
   - `keep-active`
   - `needs-decision`
3. Apply by mode:
   - `report`: return candidate list + rationale
   - `apply-safe`: execute `safe-now`
   - `apply`: execute `safe-now` + `safe-with-rewrites` when clear
4. Keep tracker/navigation references coherent.
5. Append archive operation entry to `log.md`.

## Safety

- Never delete curated content in this skill; archive moves only.
- Never operate on `raw/processed/`.
- Do not archive active/exploring projects without explicit evidence or user
  instruction.

## Output

Return:

- candidates by class
- applied/deferred archive actions
- rewrites applied/proposed
- touched files
