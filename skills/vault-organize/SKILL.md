---
name: vault-organize
description:
  Reorganize curated vault files (rename/group/frontmatter) without touching raw
  evidence
---

# Organize Vault

Reorganize curated markdown files (naming, grouping, frontmatter, wikilinks).

## Arguments

`arguments` - Path and optional flags.

**Flags:**

- `--dry-run` show plan only
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

## Process

### Step 1: Discover candidate markdown files

Analyze only active curated areas such as `notes/`, `projects/`, `resources/`.
Treat `archive/` as out-of-scope unless the user explicitly asks to reorganize
archived material.

### Step 2: Build execution plan (in-memory)

Create a plan object for:

- folder creates/renames
- file moves/renames
- frontmatter updates
- wikilink updates
- empty-folder cleanup

Do not persist plan JSON to disk.

### Step 3: Present plan

Show a readable preview and ask for confirmation unless `--yes`.

### Step 4: Execute

Apply plan operations, then report actual changes.

## Safety

- Default to non-destructive edits.
- Never touch `raw/*` content.
- Keep wikilinks consistent after renames/moves.
- Treat `notes/`, `projects/`, and `resources/` as the default organize targets.
- Do not move files into or out of `archive/` unless the reorganization goal
  explicitly calls for archiving or restoring.
