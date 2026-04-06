---
name: vault-cleanup
description: Delete old processed inbox items and execution plans
---

# Cleanup

Delete old archived items from `inbox/_processed/` and old execution plans from
`._meta/plans/`. Helps keep the vault tidy.

## Arguments

`arguments` - Optional flags.

**Flags:**

- `--days N` - Delete items older than N days (default: 90)
- `--dry-run` - Show what would be deleted without doing it

**Examples:**

```
vault-cleanup              # Delete items older than 90 days
vault-cleanup --days 30    # Delete items older than 30 days
vault-cleanup --dry-run    # Preview what would be deleted
```

## Process

### Step 1: Find old processed items

Scan `inbox/_processed/` for date folders older than the threshold:

```
inbox/_processed/
├── 2024-09-15/     # 111 days old → DELETE
├── 2024-10-20/     # 76 days old → KEEP
└── 2024-12-01/     # 34 days old → KEEP
```

### Step 2: Find old plan files

Scan `._meta/plans/` for plan files older than the threshold:

```
._meta/plans/
├── 2024-09-15-120000.json    # 111 days old → DELETE
├── 2024-10-20-093000.json    # 76 days old → KEEP
└── 2024-12-01-140000.json    # 34 days old → KEEP
```

### Step 3: Present summary

```
Cleanup preview (items older than 90 days):

Processed items to delete:
  - inbox/_processed/2024-09-15/ (5 files)
  - inbox/_processed/2024-09-20/ (3 files)
  - inbox/_processed/2024-09-28/ (7 files)

Plan files to delete:
  - ._meta/plans/2024-09-15-120000.json
  - ._meta/plans/2024-09-20-143000.json

Total: 15 files in 3 folders + 2 plan files

Delete these items? [Y/n]
```

**If `--dry-run`:** Stop here.

**Otherwise:** Ask for confirmation.

### Step 4: Execute deletion

```bash
rm -rf inbox/_processed/2024-09-15/
rm -rf inbox/_processed/2024-09-20/
rm -rf inbox/_processed/2024-09-28/
rm ._meta/plans/2024-09-15-120000.json
rm ._meta/plans/2024-09-20-143000.json
```

### Step 5: Report results

```
Cleanup complete:
  - Deleted 15 processed items from inbox/_processed/
  - Deleted 2 plan files from ._meta/plans/
  - Oldest deleted: 2024-09-15

Kept items from last 90 days.
```

## Edge Cases

- If `inbox/_processed/` doesn't exist → Report "No processed items to clean"
- If `._meta/plans/` doesn't exist → Report "No plan files to clean"
- If nothing is old enough → Report "Nothing to clean, all items within
  threshold"

## Safety

- Always confirm before deleting (no `--yes` flag for cleanup)
- Show exactly what will be deleted before proceeding
- Only touches `_processed/` and `._meta/plans/`, nothing else
