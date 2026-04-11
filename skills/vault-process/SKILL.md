---
name: vault-process
description:
  Process source captures into curated notes with linking and archival
---

# Process Sources

Process captures from `raw/sources/` into curated notes/projects while
preserving source provenance.

## Arguments

`arguments` - Optional path and flags.

**Path behavior:**

- `vault-process` defaults to `./raw/sources`
- `vault-process raw/sources` uses relative path
- `vault-process /abs/path/raw/sources` uses absolute path

**Flags:**

- `--dry-run` preview only
- `--yes` execute without confirmation

## Raw-First Contract

For each processed item:

1. Source capture starts in `raw/sources/`.
2. Curated interpretation is written to `notes/` and/or `projects/`.
3. After successful curation, move the processed source from `raw/sources/` to
   `raw/processed/YYYY-MM-DD/`.
4. If the source reinforces an existing recurring theme, update the canonical
   concept page instead of creating another fragment.
5. `index.md` is updated for new durable pages.
6. `log.md` receives an operation entry.

## Process

### Step 1: Discover capture items

Scan `raw/sources/` for unprocessed markdown/text captures and skip hidden
files.

### Step 2: Classify captures

- URL-dominant
- text-dominant
- mixed

### Step 3: Preserve source provenance

For each item, use a stable, kebab-case filename and preserve source content
unchanged.

### Step 4: Curate notes

Create/update target pages with frontmatter and `## Related` links.

When a theme repeats across captures or notes, prefer:

- updating an existing concept page under `notes/concepts/`
- creating a new concept page if the pattern is clearly durable
- linking transient reports back to the concept page

### Step 5: Link and backlink pass

Add contextual wikilinks and backlinks for touched pages.

### Step 6: Archive originals

Move each successfully processed source file to `raw/processed/YYYY-MM-DD/`.

### Step 7: Update index and log

- Add new durable pages to `index.md`.
- Append structured operation details to `log.md`.

### Step 8: Report summary

Report created/updated pages, source files stored, archived items, and added
links.

## Safety

- Treat `raw/sources/` as an unprocessed inbox.
- Treat `raw/processed/` as immutable evidence.
- Do not mutate file contents under `raw/sources/`, `raw/processed/`, or
  `raw/assets/`.
- Do not assume or create an inbox staging layer.
- Confirm before execution unless `--yes`.
