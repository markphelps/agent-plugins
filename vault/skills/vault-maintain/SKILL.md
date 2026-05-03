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
- Preview source categories and destination paths
- Show high-confidence source moves ready to apply
- Identify ambiguous captures needing user direction

### 2. Hygiene Audit

Run `vault-lint --mode report` to:

- Detect contradictions across related notes
- Find orphan pages and stale content
- Find connection candidates for knowledge graph growth
- Find duplicate or overlapping notes, ideas, and projects
- Identify missing concept pages
- Flag broken or ambiguous wikilinks
- Surface promotion candidates from drift reports

### 3. Tracker Audit

Run `vault-tracker --mode report` to:

- Audit tracker vs filesystem state
- Detect mismatches and orphan entries
- Detect duplicate ideas/projects that should be merged
- Propose lifecycle transitions
- Identify untracked projects

### 4. Concept Audit

Run `vault-concepts --mode report` to:

- Scan for recurring themes across curated areas
- Detect duplicate or overlapping concept pages
- Detect candidate concept pages
- Propose updates to existing concepts
- Surface new concept creation candidates

### 5. Weekly Summary Production

Compile findings into a weekly summary including:

- Pending ingestions (count, source types, routing decisions)
- Source routing proposals (category, destination, confidence)
- Hygiene issues by severity (contradictions, orphans, stale)
- Connection candidates (source, target, confidence, relationship)
- Merge candidates (target, sources, confidence, required link rewrites)
- Synthesis archive checks (summaries link to complete sources in
  `raw/processed/YYYY-MM-DD/`)
- External tag checks (clipped notes tagged `external`, owned notes not tagged
  `external`)
- Tracker transitions proposed (state changes, promotions)
- Concept candidates (updates, creations deferred)
- Unresolved decisions requiring user input

### 6. Maintenance Record

Append the maintenance entry to `log.md` manually when the vault uses one:

- Operation: `vault-maintain`
- Summary: date range and completion status
- Key actions: counts of items processed in each category
- Touched files: moved sources plus tracker, link, or concept updates

## Mode Behavior

### `report` (Default)

- Run all audits in read-only mode
- Compile findings without any modifications
- Present weekly summary and proposals
- List unresolved decisions

### `apply-safe`

Apply only high-confidence, low-risk changes:

- **Link normalization**: Fix broken or ambiguous wikilinks
- **Graph links**: Add high-confidence contextual wikilinks discovered by
  `vault-lint`
- **Tracker updates**: Unambiguous state changes, formatting fixes
- **Merge prep**: Add backlinks or aliases for high-confidence merge candidates
  without moving content
- **Synthesis link repair**: Add missing links from summaries to archived source
  records when the archive path is unambiguous
- **Maintenance record**: Append a concise manual entry to `log.md` if present

Excluded from `apply-safe`:

- Source moves requiring link rewrites
- Content merges
- New concept page creation
- Ingestion pipeline execution (stays in `report`)

### `apply`

Additionally allow medium-confidence actions:

- **Source moves**: Deterministic file moves with automatic link rewrites
- **Content merges**: High-confidence duplicate notes, ideas, projects, or
  concepts when provenance and links can be preserved
- **Synthesis archive repair**: Move complete external source records into
  `raw/processed/YYYY-MM-DD/` when a summary exists without an immutable source
  archive
- **Concept creation**: New concept pages when promotion thresholds are met
  (theme appears in 3+ unrelated notes, evidence is concrete and linkable)

## Safety

- **Never delete vault content** — move or archive only
- **Do not archive ambiguous live projects** without explicit instruction
- **Keep changes reviewable**: List all touched files with relative paths
- **Preserve hand-written content**: Favor additive updates over rewrites
- **Merge conservatively**: When two items are related but distinct, link them
  instead of merging
- **Graph links need evidence**: Add only links with a clear relationship and
  natural context
- **Synthesis requires sources**: Summaries and briefs must cite complete
  archived source records
- **Exclude `archive/`** from active maintenance unless explicitly scoped
- **Never mutate existing** `raw/processed/*` files; additive archived source
  copies are allowed for synthesis archive repair
- **Confirm before execution** unless running in `--mode report`

## Compose Existing Skills

This skill orchestrates the following specialized skills:

| Step | Skill            | Purpose                             |
| ---- | ---------------- | ----------------------------------- |
| 1    | `vault-ingest`   | Source classification and routing   |
| 2    | `vault-lint`     | Hygiene and contradiction detection |
| 3    | `vault-tracker`  | Project lifecycle management        |
| 4    | `vault-concepts` | Concept promotion and creation      |

## Output

Return:

- **Applied changes**: What was modified (by mode)
- **Deferred/proposed changes**: Pending items for future cycles
- **Merge report**: Merges applied/proposed, canonical targets, retained
  provenance
- **Graph report**: Links added/proposed and relationship evidence
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

# Full maintenance with source moves and concept creation
vault-maintain --mode apply
```
