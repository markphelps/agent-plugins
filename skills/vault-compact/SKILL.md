---
name: vault-compact
description: Merge clusters of small related notes into consolidated files
---

# Compact

Consolidate fragmented small notes into durable canonical files while preserving
content and wikilinks.

## Arguments

`arguments` may include:

- optional target path (default: current directory)
- `--mode report|apply-safe|apply` (default: `report`)
- `--yes` (skip confirmation in apply modes)
- `--max-lines N` (default: 50)
- `--min-cluster N` (default: 2)

## Scope

Scan `.md` files recursively and exclude:

- hidden folders
- `raw/processed/`, `raw/sources/`, `raw/assets/`

Never compact `raw/*` content.

## Cluster Rules

Prioritize these in order:

1. Date-series files with shared basename
2. High-overlap topic siblings (tags/title/folder)
3. Very small same-folder fragments

Do not compact:

- notes marked `status: active`
- standalone substantial notes above the size threshold
- clusters below `--min-cluster`

## Process

1. Detect candidate clusters and choose one destination file per cluster.
2. Build merged content with one top frontmatter block (`created`, `updated`,
   merged tags, `source: compacted`).
3. Preserve source content; strip only duplicate file-level frontmatter/H1.
4. Order date-series entries chronologically (oldest first).
5. Build wikilink rewrite map from old files to destination anchors.
6. In `report`, output plan only.
7. In `apply-safe`, execute high-confidence clusters only.
8. In `apply`, execute all approved clusters; rewrite links and archive
   originals under mirrored `archive/` paths.
9. Append operation entry to `log.md`.

## Safety

- Default to report-first.
- Require confirmation unless `--yes`.
- Verify merged output contains all source entries before archiving originals.
- Never hard-delete originals unless explicitly requested.

## Output

Return:

- clusters found
- destination files
- link updates count
- archive moves performed/proposed
- touched files
