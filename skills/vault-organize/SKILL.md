---
name: vault-organize
description:
  Reorganize curated vault files (rename/group/frontmatter) without touching raw
  evidence
---

# Organize Vault

Reorganize curated markdown files (naming, grouping, frontmatter, wikilinks).

## Parameters

- Path input (optional): scope target directory
- Flags:
  - `--mode report|apply-safe|apply` (default: `report`)
  - `--yes` execute without confirmation
  - `--no-move` frontmatter/link updates only
  - `--shallow` top-level only

## Mandatory Skips

Never move/rename files under:

- `raw/`
- `raw/sources/`
- `raw/assets/`
- `raw/processed/`
- hidden/system dirs (`.git/`, `.obsidian/`, etc.)

## Workflow

1. Discover candidate markdown files in active curated areas:
   - `notes/`, `projects/`, `resources/`
   - exclude `archive/` unless explicitly requested
2. Build an in-memory execution plan:
   - folder creates/renames
   - file moves/renames
   - frontmatter updates
   - wikilink updates
   - empty-folder cleanup
3. Present a readable preview; confirm unless `--yes`.
4. Execute by mode:
   - `report`: preview only
   - `apply-safe`: high-confidence operations only
   - `apply`: full confirmed plan

## Safety

- Default to non-destructive edits.
- Never touch `raw/*` content.
- Keep wikilinks consistent after renames/moves.
- Treat `notes/`, `projects/`, and `resources/` as the default organize targets.
- Do not move files into or out of `archive/` unless the reorganization goal
  explicitly calls for archiving or restoring.

## Output

Return:

- planned/executed moves and renames
- frontmatter/link updates
- skipped items and why
