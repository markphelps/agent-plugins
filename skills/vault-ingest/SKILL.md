---
name: vault-ingest
description:
  Move captured sources through ingestion pipeline: process captures, create curated notes,
  promote themes to concepts, archive sources, update index, and audit processed archives
---

# Vault Ingest

Ingest captures from `raw/sources/` into curated notes and projects, archive
processed sources, update navigation, and audit processed archives for hygiene.

## Parameters

- `--mode report|apply` (default: `report`)
  - `report`: preview all planned operations
  - `apply`: execute confirmed operations
- `--path PATH` (optional): override default `./raw/sources` input path

## Core Contract

For each ingestion cycle:

- Source starts in `raw/sources/` (unprocessed inbox)
- Curated interpretation lives in `notes/` and/or `projects/`
- Recurring themes are promoted to `notes/concepts/` as canonical concept pages
- Source is archived to `raw/processed/YYYY-MM-DD/` only after successful
  curation
- New durable pages are reflected in `index.md`
- All material operations are logged in `log.md`
- `raw/processed/` is audited for empty folders and anomalies

## Workflow

1. **Scan** `raw/sources/` for unprocessed captures (skip hidden files)
2. **Process** each capture:
   - Create/update curated pages in `notes/` and/or `projects/`
   - Add frontmatter to new pages
   - Include `## Related` section with contextual wikilinks
   - Maintain backlinks across touched pages
3. **Promote** recurring themes to canonical concept pages in `notes/concepts/`
4. **Archive** successfully processed sources to `raw/processed/YYYY-MM-DD/`
5. **Update** navigation and ops trail:
   - Add new durable pages to `index.md`
   - Append concise operation entry to `log.md`
6. **Audit** processed archives:
   - Scan `raw/processed/YYYY-MM-DD/` for empty date folders
   - Flag non-date folder anomalies
   - Report duplicate filenames across dates
   - Remove empty folders (with confirmation in apply mode)
7. **Execute** by mode:
   - `report`: preview plan only (no changes)
   - `apply`: run full pipeline with confirmation

## Safety

- Never delete from `raw/sources/` — only archive moves after successful
  processing
- Treat `raw/processed/` as immutable evidence — never delete processed source
  files
- Non-destructive edits by default — curated pages are only added to or updated
- Confirm before execution unless `--yes`
- Do not mutate file contents under `raw/sources/`, `raw/processed/`, or
  `raw/assets/`
- Do not assume or create an inbox staging layer

## Output

Return:

- discovered captures and processing plan
- created/updated curated pages with links
- source files archived and destination paths
- themes promoted to concepts (if any)
- `index.md` additions
- `log.md` entry appended
- audit findings (empty folders, anomalies)
- fixes applied (if any)
- manual follow-up items
