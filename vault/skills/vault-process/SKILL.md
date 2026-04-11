---
name: vault-process
description:
  Process source captures into curated notes with linking and archival
---

# Process Sources

Process captures from `raw/sources/` into curated notes/projects while
preserving source provenance.

## Parameters

- Path input (optional):
  - default: `./raw/sources`
  - relative or absolute path accepted

- Flags:
  - `--mode report|apply-safe|apply` (default: `report`)
  - `--yes` execute without confirmation

## Core Contract

For each processed item:

- Source starts in `raw/sources/`.
- Curated interpretation lives in `notes/` and/or `projects/`.
- Source is archived to `raw/processed/YYYY-MM-DD/` only after successful
  curation.
- Repeated themes should reinforce canonical concept pages.
- New durable pages should be reflected in `index.md`.
- Material operations should be logged in `log.md`.

## Workflow

1. Discover unprocessed captures in `raw/sources/` (skip hidden files).
2. Create/update curated pages in `notes/` and/or `projects/`:
   - include frontmatter
   - include `## Related` links
   - promote repeated themes into canonical concept pages when durable
3. Run link pass:
   - add contextual wikilinks
   - maintain backlinks across touched pages
4. Move successfully processed source files to `raw/processed/YYYY-MM-DD/`.
5. Update navigation and ops trail:
   - add new durable pages to `index.md`
   - append operation entry to `log.md`
6. Execute by mode:
   - `report`: preview plan only
   - `apply-safe`: run high-confidence actions
   - `apply`: run full confirmed actions
7. If new durable pages were created and this vault is host-backed, run
   `vault-qmd --mode apply-safe` for search/index refresh readiness.

## Safety

- Treat `raw/sources/` as an unprocessed inbox.
- Treat `raw/processed/` as immutable evidence.
- Do not mutate file contents under `raw/sources/`, `raw/processed/`, or
  `raw/assets/`.
- Do not assume or create an inbox staging layer.
- Confirm before execution unless `--yes`.

## Output

Return:

- created/updated curated pages
- source files processed and archived
- links added/updated
- `index.md` and `log.md` updates
