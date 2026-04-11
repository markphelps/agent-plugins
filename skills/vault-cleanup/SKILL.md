---
name: vault-cleanup
description: Audit processed-source archives for integrity and hygiene
---

# Cleanup

Audit `raw/processed/` hygiene and optionally apply safe, non-destructive fixes.

## Arguments

`arguments` may include:

- `--days N` stale-threshold hint (default: 90)
- `--mode report|apply-safe|apply` (default: `report`)

## Process

1. Inspect `raw/processed/YYYY-MM-DD/` structure and date-folder integrity.
2. Report anomalies: malformed folder names, empty date folders, obvious
   structural drift.
3. In `report`, return findings only.
4. In `apply-safe`, remove empty date folders only after explicit confirmation.
5. `apply` behaves like `apply-safe` for this skill (no destructive escalation).
6. Append a concise cleanup entry to `log.md` when changes are applied.

## Safety

- Never modify content files inside processed folders.
- Never delete source evidence.

## Output

Return:

- findings
- safe fixes applied/proposed
- touched files
