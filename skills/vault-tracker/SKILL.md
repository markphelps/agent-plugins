---
name: vault-tracker
description:
  Manage PORT object lifecycle through Portent metadata, folder state, and index
  navigation
---

# Vault Tracker

Unified PORT object lifecycle management: track Projects, Operations,
Responsibilities, and externally tracked Task references; detect mismatches
between filesystem location, Portent metadata, and active navigation; propose
transitions; and coordinate archival.

Manage lifecycle and navigation for PORT objects: `Project`, `Operation`,
`Responsibility`, and externally tracked `Task` references.

Portent reference: `../references/portent-knowledge-base-spec.md`.

## Recency Priority

Work the active surface newest-first, ranked by each object's `updated`
frontmatter date (fall back to file modification time when `updated` is absent).
Concentrate scrutiny on the freshest material — recently-touched objects are
where active thinking lives and where new mismatches, overlaps, and gaps appear.
Long-untouched objects are assumed settled and rank lower, but are never
excluded: they remain valid link targets, merge destinations, and canonical
homes, and still get a structural check (broken links, orphaning).

Surface recently-touched objects' metadata and navigation mismatches first when
reporting and proposing transitions.

## Command

```
vault-tracker [--mode report|apply-safe|apply] [--project NAME] [transition]
```

## Parameters

- `--mode report|apply-safe|apply` (default: `report`)
- `--project NAME` optional project name/path to scope operation
- `transition` optional explicit transition intent (e.g., `mark shipped`,
  `archive now`)

## Lifecycle States

- `active` — currently executing project
- `exploring` — early investigation, not fully committed
- `paused` — temporarily on hold
- `shipped` — completed/delivered
- `archived` — moved to `archive/`
- `fleeting` — rough idea fragment (in `ideas/fleeting/`)
- `incubating` — idea stage (in `ideas/incubating/`)
- `someday` — intentionally parked idea (in `ideas/someday/`)
- `rejected` — explicitly declined idea (in `ideas/rejected/`)

Portent frontmatter is authoritative for object meaning:

- Project transitions update `stage` and `status` before file moves.
- Operations should usually `belongs_to` a Responsibility or Project.
- Responsibilities should collect related Projects and Operations.
- Ideas promoted to active work become `type: Project`, `status: organized`, and
  `stage: active` before or during any folder movement.

## Valid Transitions

| From                                    | To            | Conditions         |
| --------------------------------------- | ------------- | ------------------ |
| `active` ↔ `exploring`                  | Bidirectional | Reclassification   |
| `active\|exploring` → `paused`          | One-way       | Needs break point  |
| `paused` → `active`                     | One-way       | Resuming work      |
| `exploring` → `incubating`              | One-way       | Back to idea stage |
| `active\|exploring\|paused` → `shipped` | One-way       | Completion         |
| `shipped` → `archived`                  | One-way       | Final archival     |
| `fleeting` → `incubating`               | One-way       | Idea has shape     |
| `incubating` → `someday`                | One-way       | Park for later     |
| `fleeting\|incubating` → `rejected`     | One-way       | Declined idea      |

## Mode Behavior

- `report`: audit Portent metadata vs filesystem/navigation state, detect
  mismatches, propose transitions
- `apply-safe`: apply unambiguous metadata and navigation updates only (no file
  moves)
- `apply`: apply confirmed transitions including file moves and link rewrites

## Workflow

1. **Scan active navigation**: Read `index.md` when present to discover active
   project and idea entry points.
2. **Scan projects/**: Discover project directories and their lifecycle
   location.
3. **Scan PORT metadata**:
   - Projects in `projects/`, shaped project candidates in `ideas/`
   - Operations under `notes/operations/` or equivalent local convention
   - Responsibilities under `notes/responsibilities/` or equivalent local
     convention
   - Task references that live outside the vault but relate back to Portent
     objects
4. **Detect mismatches**:
   - Portent `type`, `status`, and `stage` vs folder location
   - Active `index.md` entries vs archived or inactive object metadata
   - Active Projects missing from `index.md` when local convention uses an
     active catalog
   - Operations without a Responsibility or Project parent
   - Responsibilities without related Projects or Operations when obvious
   - Duplicate idea or project directories that should be one lifecycle item
5. **Propose transitions and merges**:
   - Smallest valid state change per mismatch
   - Canonical merge target for duplicate ideas/projects
   - Link rewrites and index/navigation updates required by the merge
6. **Handle idea promotion paths**:
   - `ideas/incubating/` → `projects/active/` (promote to project)
   - `ideas/fleeting/` → `ideas/incubating/` (promote idea)
   - `ideas/incubating/` → `ideas/someday/` (park idea)
   - `ideas/incubating/` → `ideas/rejected/` (decline idea)
7. **Apply by mode**:
   - `report`: return proposals with evidence and confidence
   - `apply-safe`: update Portent frontmatter, index links, and obvious
     backlinks when unambiguous, no merges
   - `apply`: perform confirmed file moves, high-confidence merges, and inbound
     link rewrites
8. **Shipped compaction**: When a project transitions to `shipped`, immediately
   run or propose
   `vault-compact --scope projects --project <name> --mode apply --aggression aggressive`
   to merge launch artifacts, drafts, research, and stale execution notes into
   one canonical shipped project record. Absorbed curated files may be deleted
   after unique content is preserved. Never delete `raw/`.
9. **Log operation**: Append concise entry to `log.md`

## Merge Rules

Merge idea or project directories only when they represent the same underlying
thing, not just similar domains. Prefer the more advanced lifecycle state as the
canonical destination (`active` over `incubating`, `incubating` over `fleeting`)
unless the user says otherwise.

- Preserve all files by moving them into the canonical directory or appending
  sections into the canonical note.
- Preserve former names as aliases or backlinks when useful.
- Rewrite inbound links to the canonical path.
- In `report` mode, show both the canonical destination and what would be moved.
- In `apply` mode, require clear evidence or explicit user instruction.

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
- **Never discard duplicate project or idea material** — merge or move it
- **Confirmation required** for destructive moves (archive transitions)
- **Link integrity**: Check/rewrite inbound links before archival
- **Metadata and docs are source of truth**: Keep Portent frontmatter and
  project docs aligned
- **Skip archive operations** for `active/exploring` without explicit evidence
- **Never touch** `raw/processed/*` or hidden/system directories

## Report Scope

Default scope is live surface only (`active`, `exploring`, `paused`). Include
`shipped`/`archived` only when explicitly requested via `--project` or explicit
transition.

## Compose Existing Skills

- `vault-lint` for stale/orphan detection and wikilink issues
- `vault-compact` for post-shipping project document consolidation
- `vault-concepts` for recurring theme promotion
- `vault-maintain` for periodic full-vault upkeep

## Output

Return:

- Transitions applied/proposed with evidence and confidence
- Mismatches detected (metadata vs filesystem/navigation)
- Files moved/renamed and link rewrites applied
- Merges applied/proposed with canonical target and retained aliases
- Idea promotions (incubating→project, fleeting→incubating)
- PORT metadata updates for Project, Operation, Responsibility, and Task
  references
- Index/navigation updates
- Touched files
- Skipped items and rationale
