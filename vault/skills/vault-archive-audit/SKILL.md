---
name: vault-archive-audit
description:
  Audit project and note candidates for archival and optionally apply safe
  archive moves
---

# Archive Audit

Use this skill to identify dead or superseded material that should leave the
active vault surface.

## Purpose

- keep `projects/` and active `notes/` small and current
- move dead curated material into `archive/`
- avoid accidental deletion by preferring archival moves

## Reuse Existing Skills

Prefer these existing skills as components instead of duplicating their logic:

- `vault-project-tracker audit` for lifecycle mismatches and project-state
  review
- `vault-lint` for stale active material and archive candidates
- `vault-project-tracker` for applying project archival transitions
- `vault-log` for append-only history

## Modes

- `report` - identify candidates only
- `apply` - perform safe archive moves for high-confidence candidates

If no mode is specified, default to `report`.

## Candidate Types

### Projects

Archive candidates typically have:

- no longer part of current active/exploring work
- low or manageable inbound references
- no recent updates
- a clear archived destination under `archive/projects/dead/`

### Notes

Archive candidates typically have:

- dated/transient naming patterns
- superseded brainstorms or reviews
- weak navigation value in the active wiki

## Process

### Step 1: Audit the active surface

Inspect:

- `projects/`
- active note areas under `notes/`
- `projects/project-tracker.md`

### Step 2: Rank candidates

Classify each candidate as:

- `safe to archive now`
- `archive with link updates`
- `keep active`
- `needs human decision`

### Step 3: Apply only high-confidence moves

When in `apply` mode, auto-apply only if:

- the item is clearly not current
- the destination is obvious
- inbound references are low or easy to rewrite
- no deletion is required

For project folders, prefer routing the change through the behavior defined by
`vault-project-tracker`.

### Step 4: Update control planes

- keep `projects/project-tracker.md` lightweight
- refresh `archive/index.md` if needed
- append to `log.md`

## Safety

- never delete from curated areas unless explicitly requested
- prefer `report` mode when confidence is mixed
- do not archive currently active or exploring projects without explicit user
  instruction or prior user-declared policy

## Output

Report:

- archive candidates found
- actions applied or deferred
- link rewrites required or completed
- tracker/archive/log updates made
