---
name: vault-tracker
description:
  Manage project lifecycle and project-tracker.md—track state changes, propose
  transitions, and coordinate archival
---

# Vault Tracker

Unified project lifecycle management: track projects, detect mismatches between
filesystem and tracker, propose transitions, and coordinate archival.

## Command

```
vault-tracker [--mode report|apply-safe|apply] [--project NAME] [transition]
```

## Parameters

- `--mode report|apply-safe|apply` (default: `report`)
- `--project NAME` optional project name/path to scope operation
- `transition` optional explicit transition intent (e.g., `mark shipped`, `archive now`)

## Lifecycle States

- `active` — currently executing project
- `exploring` — early investigation, not fully committed
- `paused` — temporarily on hold
- `shipped` — completed/delivered
- `archived` — moved to `archive/`
- `incubating` — idea stage (in `ideas/incubating/`)

## Valid Transitions

| From | To | Conditions |
|------|-----|-----------|
| `active` ↔ `exploring` | Bidirectional | Reclassification |
| `active\|exploring` → `paused` | One-way | Needs break point |
| `paused` → `active` | One-way | Resuming work |
| `exploring` → `incubating` | One-way | Back to idea stage |
| `active\|exploring\|paused` → `shipped` | One-way | Completion |
| `shipped` → `archived` | One-way | Final archival |

## Mode Behavior

- `report`: audit tracker vs filesystem, detect mismatches, propose transitions
- `apply-safe`: apply unambiguous tracker updates only (no file moves)
- `apply`: apply confirmed transitions including file moves and link rewrites

## Workflow

1. **Read tracker**: Load `projects/project-tracker.md`
2. **Scan projects/**: Discover project directories and their state
3. **Detect mismatches**:
   - Filesystem state vs tracker state
   - Orphan tracker entries (no matching directory)
   - Untracked projects (directory exists, not in tracker)
4. **Propose transitions**: Smallest valid state change per mismatch
5. **Handle idea promotion paths**:
   - `ideas/incubating/` → `projects/active/` (promote to project)
   - `ideas/fleeting/` → `ideas/incubating/` (promote idea)
   - `ideas/incubating/` → `ideas/rejected/` (decline idea)
6. **Apply by mode**:
   - `report`: return proposals with evidence and confidence
   - `apply-safe`: update tracker rows/links when unambiguous
   - `apply`: perform file moves + inbound link rewrites
7. **Log operation**: Append concise entry to `log.md`

## Example Operations

```
# Report on all projects
vault-tracker --mode report

# Promote an incubating idea to active project
vault-tracker --mode apply --project my-idea promote-to-project

# Mark project as shipped
vault-tracker --mode apply-safe --project my-project mark shipped

# Archive a shipped project
vault-tracker --mode apply --project my-project archive now
```

## Safety

- **Never delete project files** — archive moves only
- **Confirmation required** for destructive moves (archive transitions)
- **Link integrity**: Check/rewrite inbound links before archival
- **Tracker ≠ sole history**: Keep project docs as source of truth
- **Skip archive operations** for `active/exploring` without explicit evidence
- **Never touch** `raw/processed/*` or hidden/system directories

## Report Scope

Default scope is live surface only (`active`, `exploring`, `paused`). Include
`shipped`/`archived` only when explicitly requested via `--project` or explicit
transition.

## Compose Existing Skills

- `vault-lint` for stale/orphan detection and wikilink issues
- `vault-drift` for cross-domain recurrence signals
- `vault-index` when navigation needs refresh
- `vault-log` for append-only operation history

## Output

Return:

- Transitions applied/proposed with evidence and confidence
- Mismatches detected (filesystem vs tracker)
- Files moved/renamed and link rewrites applied
- Idea promotions (incubating→project, fleeting→incubating)
- Tracker sections changed
- Touched files
- Skipped items and rationale
