---
name: vault-cleanup
description: Delete old raw/processed archives after confirmation
---

# Cleanup

Delete old dated archives from `raw/processed/`.

## Arguments

`arguments` - Optional flags.

**Flags:**

- `--days N` delete items older than N days (default: 90)
- `--dry-run` preview only

## Process

### Step 1: Find old archive folders

Scan `raw/processed/YYYY-MM-DD/` and identify folders older than threshold.

### Step 2: Present summary

Show folders/files to be deleted and ask for confirmation.

### Step 3: Execute deletion

Delete approved old date folders from `raw/processed/`.

### Step 4: Report results

Show total deleted and oldest remaining retained date.

## Edge Cases

- If `raw/processed/` missing: report no-op.
- If nothing old enough: report no-op.

## Safety

- Always require confirmation (except `--dry-run` which never deletes).
- Never delete from `raw/sources/`.
- Never delete from `raw/assets/`.
- Never touch curated notes/projects unless explicitly requested.
