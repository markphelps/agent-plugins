---
name: vault-maintenance
description:
  Unified maintenance orchestrator for session-end and weekly vault hygiene.
---

# Vault Maintenance

Run a bounded maintenance pass that keeps project state, concepts, archive
candidates, navigation, and logs in sync.

## Arguments

`arguments` may include:

- `--cadence session|weekly` (default: `session`)
- `--mode report|apply-safe|apply` (default: `report`)
- optional project name/path for session-focused runs

## Compose Existing Skills

Use or emulate these in order:

1. `vault-project-tracker --mode report`
2. `vault-concept-promoter --mode report`
3. `vault-archive-audit --mode report`
4. `vault-index` (only when navigation changed)
5. `vault-log`

## Cadence Behavior

### `session`

Focus on recently touched project areas and session context:

- sync project status and recent project doc deltas
- keep updates minimal and scoped

### `weekly`

Run full active-surface hygiene:

- tracker drift, concept drift, archive candidates, index drift

## Modes

- `report`: findings only, no broad edits
- `apply-safe`: apply high-confidence low-risk fixes
- `apply`: also apply higher-impact changes when evidence is clear

## Safe Apply Scope

Allowed in `apply-safe`:

- tracker formatting/status normalization when unambiguous
- concept-page evidence updates
- low-risk link normalization
- index refresh when needed
- append log entry

Requires `apply` mode:

- archiving clear dead projects/notes
- lifecycle transitions with moderate ambiguity

Never do without explicit user instruction:

- deleting curated material
- moving/deleting anything under `raw/` beyond ingest rules

## Output

Return:

- cadence + mode used
- applied changes
- deferred/proposed changes
- confidence notes
- touched files
