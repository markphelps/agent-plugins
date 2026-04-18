---
name: vault-maintain
description:
  Weekly bounded maintenance loop across ingestion, hygiene, tracking, and
  concepts
---

# Vault Maintain

Run a comprehensive weekly maintenance sweep across the active vault surface.
This is the unified entry point for periodic vault care, coordinating ingestion,
hygiene, project tracking, and concept promotion into a single bounded workflow.

## Command

```
vault-maintain [--mode report|apply-safe|apply]
```

## Parameters

- `--mode report|apply-safe|apply` (default: `report`)
  - `report`: audit and preview all findings (read-only)
  - `apply-safe`: apply high-confidence, low-risk updates only
  - `apply`: include medium-confidence actions when evidence is clear

## Weekly Sequence

Run these steps in order to produce a complete weekly maintenance report:

### 1. Ingest Audit

Run `vault-ingest --mode report` to:

- Scan `raw/sources/` for unprocessed captures
- Preview curated pages to be created/updated
- Show sources ready for archive
- Identify themes for concept promotion

### 2. Hygiene Audit

Run `vault-lint --mode report` to:

- Detect contradictions across related notes
- Find orphan pages and stale content
- Identify missing concept pages
- Flag broken or ambiguous wikilinks
- Surface promotion candidates from drift reports

### 3. Tracker Audit

Run `vault-tracker --mode report` to:

- Audit tracker vs filesystem state
- Detect mismatches and orphan entries
- Propose lifecycle transitions
- Identify untracked projects

### 4. Concept Audit

Run `vault-concepts --mode report` to:

- Scan for recurring themes across curated areas
- Detect candidate concept pages
- Propose updates to existing concepts
- Surface new concept creation candidates

### 5. Weekly Summary Production

Compile findings into a weekly summary including:

- Pending ingestions (count, sources, themes)
- Hygiene issues by severity (contradictions, orphans, stale)
- Tracker transitions proposed (state changes, promotions)
- Concept candidates (updates, creations deferred)
- Unresolved decisions requiring user input

### 6. Maintenance Record

Append the maintenance entry to `log.md` manually when the vault uses one:

- Operation: `vault-maintain`
- Summary: date range and completion status
- Key actions: counts of items processed in each category
- Touched files: any modified curated pages plus tracker or concept updates

## Mode Behavior

### `report` (Default)

- Run all audits in read-only mode
- Compile findings without any modifications
- Present weekly summary and proposals
- List unresolved decisions

### `apply-safe`

Apply only high-confidence, low-risk changes:

- **Link normalization**: Fix broken or ambiguous wikilinks
- **Tracker updates**: Unambiguous state changes, formatting fixes
- **Maintenance record**: Append a concise manual entry to `log.md` if present

Excluded from `apply-safe`:

- Archive moves requiring link rewrites
- New concept page creation
- Ingestion pipeline execution (stays in `report`)

### `apply`

Additionally allow medium-confidence actions:

- **Archive moves**: Deterministic file moves with automatic link rewrites
- **Concept creation**: New concept pages when promotion thresholds are met
  (theme appears in 3+ unrelated notes, evidence is concrete and linkable)

## Safety

- **Never delete curated notes** — archive moves only
- **Do not archive ambiguous live projects** without explicit instruction
- **Keep changes reviewable**: List all touched files with relative paths
- **Preserve hand-written content**: Favor additive updates over rewrites
- **Exclude `archive/`** from active maintenance unless explicitly scoped
- **Never touch** `raw/processed/*` or hidden/system directories
- **Confirm before execution** unless running in `--mode report`

## Compose Existing Skills

This skill orchestrates the following specialized skills:

| Step | Skill            | Purpose                             |
| ---- | ---------------- | ----------------------------------- |
| 1    | `vault-ingest`   | Source ingestion pipeline           |
| 2    | `vault-lint`     | Hygiene and contradiction detection |
| 3    | `vault-tracker`  | Project lifecycle management        |
| 4    | `vault-concepts` | Concept promotion and creation      |

## Output

Return:

- **Applied changes**: What was modified (by mode)
- **Deferred/proposed changes**: Pending items for future cycles
- **Confidence notes**: High/medium/low confidence per category
- **Unresolved decisions**: Items requiring explicit user input
- **Touched files**: List of all modified files with relative paths
- **Weekly summary**: Compact overview of vault state and progress

## Example Usage

```bash
# Preview weekly maintenance (read-only)
vault-maintain --mode report

# Apply safe updates only
vault-maintain --mode apply-safe

# Full maintenance with archive moves and concept creation
vault-maintain --mode apply
```
