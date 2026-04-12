---
name: vault-index
description: Build or refresh index.md from curated vault content
---

# Vault Index

Keep `index.md` as the durable entry point for active curated content.

## Parameters

- `--mode report|apply-safe|apply` (default: `report`)
- Optional scope hint: specific sections to refresh (`concepts`, `projects`,
  etc.)

## Workflow

1. Scan active curated areas: `notes/`, `projects/`, `resources/`.
2. Exclude `raw/`, `archive/`, and transient material.
3. Prefer durable hubs:
   - canonical concepts (e.g. `notes/concepts/`)
   - active project tracker and live project pages
   - stable reference resources
4. Build a proposed index update:
   - add missing durable pages
   - remove dead/stale entries
   - preserve high-value hand-written framing
5. Execute by mode:
   - `report`: show proposed edits only
   - `apply-safe`: conservative refresh; do not rewrite section prose
   - `apply`: fully refresh targeted sections while preserving intent
6. If retrieval/index health is uncertain, run `vault-qmd --mode report` first
   for qmd-backed preflight checks.

## Safety

- Only edit `index.md` unless explicitly requested otherwise.
- Never index files under `raw/`.
- Keep archived content out of main navigation unless explicitly requested.
- Favor durable pages over ephemeral notes.

## Output

Return:

- what changed (or would change)
- sections touched
- links added/removed
