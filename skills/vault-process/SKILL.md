---
name: vault-process
description:
  Process source captures into curated notes with linking and archival
---

# Process Sources

Convert `raw/sources/` captures into curated notes/projects with provenance.

## Arguments

`arguments` may include:

- optional source path (default: `raw/sources/`)
- optional destination hint (`notes/` or `projects/`)
- `--mode report|apply-safe|apply` (default: `report`)

## Process

1. Identify unprocessed source captures.
2. Propose curated outputs and target files.
3. In `report`, show ingest plan only.
4. In `apply-safe`, create/update curated files and add links/related sections.
5. In `apply`, also perform larger restructures if necessary and clear.
6. Move processed sources into `raw/processed/YYYY-MM-DD/`.
7. Refresh `index.md` if durable pages were added.
8. Append ingest entry to `log.md`.

## Safety

- Never edit source contents under `raw/`.
- Only permitted raw movement: `raw/sources/` -> `raw/processed/YYYY-MM-DD/`.

## Output

Return:

- sources processed
- curated files created/updated
- raw moves performed
- touched files
