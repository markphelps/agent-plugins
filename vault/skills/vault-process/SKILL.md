---
name: vault-process
description:
  Process raw inbox captures into curated notes with linking and archival
---

# Process Raw Inbox

Process captures from `raw/inbox/` into curated notes/projects while preserving
source provenance.

## Arguments

`arguments` - Optional path and flags.

**Path behavior:**

- `vault-process` defaults to `./raw/inbox`
- `vault-process raw/inbox` uses relative path
- `vault-process /abs/path/raw/inbox` uses absolute path

**Flags:**

- `--dry-run` preview only
- `--yes` execute without confirmation

## Raw-First Contract

For each processed item:

1. Source capture starts in `raw/inbox/`.
2. Canonical source copy is stored in `raw/sources/`.
3. Curated interpretation is written to `notes/` and/or `projects/`.
4. Original inbox item is moved to `raw/processed/YYYY-MM-DD/`.
5. `index.md` is updated for new durable pages.
6. `log.md` receives an operation entry.

## Process

### Step 1: Discover capture items

Scan input folder for markdown/text captures and skip hidden files.

### Step 2: Classify captures

- URL-dominant
- text-dominant
- mixed

### Step 3: Preserve source provenance

For each item, store canonical source in `raw/sources/` before or during
curation using a stable, kebab-case filename.

### Step 4: Curate notes

Create/update target pages with frontmatter and `## Related` links.

### Step 5: Link and backlink pass

Add contextual wikilinks and backlinks for touched pages.

### Step 6: Archive originals

Move processed item to `raw/processed/YYYY-MM-DD/`.

### Step 7: Update index and log

- Add new durable pages to `index.md`.
- Append structured operation details to `log.md`.

### Step 8: Report summary

Report created/updated pages, source files stored, archived items, and added
links.

## Safety

- Treat `raw/sources/` as immutable evidence.
- Do not mutate or delete files in `raw/sources/` or `raw/assets/`.
- Only move files out of `raw/inbox/` into dated `raw/processed/` folders.
- Confirm before execution unless `--yes`.
