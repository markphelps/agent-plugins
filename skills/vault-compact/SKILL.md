---
name: vault-compact
description: Merge clusters of small related notes into consolidated files
---

# Compact

Consolidate clusters of small related notes into canonical files while
preserving content and wikilinks.

## Parameters

- target path (default: current working directory)
- `--mode report|apply-safe|apply` (default: `report`)
- `--yes` execute without confirmation
- `--max-lines N` threshold for small files (default: 50)
- `--min-cluster N` minimum files per cluster (default: 2)

## Scope

Scan markdown recursively in target path, excluding hidden/system directories
and all `raw/*` paths (`raw/sources/`, `raw/processed/`, `raw/assets/`).

## Clustering

Prioritize these signals:

1. Date-series basename matches (strongest)
2. High-overlap tags + similar topic in same area
3. Small sibling fragments in same folder

## Confidence Rubric

- `high`: strong date-series/basename match and low link rewrite risk
- `medium`: tag/folder similarity with manageable rewrite risk
- `low`: weak semantic similarity or ambiguous destination

## Workflow

1. Discover small-note candidates under threshold.
2. Build clusters and assign confidence.
3. Plan destination files and wikilink rewrites.
4. Generate preview plan.
5. Execute by mode:
   - `report`: plan only
   - `apply-safe`: execute `high` confidence clusters only
   - `apply`: execute all user-confirmed clusters
6. In write modes, confirm unless `--yes`.
7. Execute merge:
   - merge content with one canonical frontmatter block
   - preserve content (strip only duplicate per-file frontmatter/H1)
   - update wikilinks
   - archive originals to mirrored `archive/` paths
8. Append operation entry to `log.md`.

## Safety

- Default to report-first.
- Do not hard-delete originals unless explicitly requested.
- Verify merged output contains all source entries before archiving originals.
- Keep operations reversible and report touched files.

## Output

Return:

- clusters by confidence
- selected execution set by mode
- destination files
- link updates applied/proposed
- archive moves applied/proposed
- touched files
