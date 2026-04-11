---
name: vault-cleanup
description: Audit processed-source archives for integrity and hygiene
---

# Cleanup

Audit `raw/processed/` for hygiene issues without deleting canonical evidence.

## Parameters

- `--days N` report folders older than `N` days (default: `90`)
- `--mode report|apply-safe|apply` (default: `report`)

`apply-safe` and `apply` are both non-destructive here: only empty-folder
cleanup is permitted.

## Workflow

1. Scan `raw/processed/YYYY-MM-DD/` and flag:
   - date folders older than threshold
   - empty date folders
   - non-date folder anomalies
   - duplicate filenames across dates
2. Classify findings:
   - informational
   - safe fix available
   - manual decision required
3. Execute by mode:
   - `report`: findings only
   - `apply-safe` / `apply`: remove empty date folders after confirmation
4. Return summary and follow-up actions.

## Edge Cases

- If `raw/processed/` missing: report no-op.
- If no findings: report clean state.

## Safety

- Treat `raw/processed/` as canonical immutable evidence.
- Never delete processed source files from `raw/processed/`.
- Never delete from `raw/sources/`.
- Never delete from `raw/assets/`.
- Never delete from `notes/`, `projects/`, or `resources/`.
- Never touch curated notes/projects unless explicitly requested.

## Output

Return:

- findings by class
- fixes applied (if any)
- manual follow-up items
