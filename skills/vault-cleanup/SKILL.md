---
name: vault-cleanup
description: Audit processed-source archives for integrity and hygiene
---

# Cleanup

Audit `raw/processed/` for hygiene issues without deleting canonical evidence.

## Arguments

`arguments` - Optional flags.

**Flags:**

- `--days N` report folders older than N days (default: 90)
- `--apply-safe` allow safe non-destructive fixes (empty-folder removal only)
- `--dry-run` preview only (default behavior)

## Process

### Step 1: Scan archive health

Scan `raw/processed/YYYY-MM-DD/` and identify:

- date folders older than threshold
- empty date folders
- non-date folders or naming anomalies
- duplicate filenames across multiple dates

### Step 2: Present summary

Show findings and classify each as:

- informational only
- safe fix available
- needs manual decision

### Step 3: Optional safe fixes

If `--apply-safe`, remove only empty date folders after confirmation.

### Step 4: Report results

Show findings, optional fixes applied, and any manual follow-up actions.

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
