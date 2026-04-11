---
name: vault-archive-audit
description:
  Audit project and note candidates for archival and optionally apply safe
  archive moves
---

# Archive Audit

Identify dead or superseded curated material and move it to `archive/` when
confidence is high.

## Arguments

`arguments` may include:

- optional target scope/path
- `--mode report|apply-safe|apply` (default: `report`)

## Compose Existing Skills

- `vault-project-tracker` for project lifecycle transitions
- `vault-lint` for stale/orphan candidate signals
- `vault-log` for append-only history

## Process

1. Scan active curated surface (`projects/`, active `notes/`).
2. Rank candidates: `safe`, `needs-link-rewrite`, `keep`, `needs-decision`.
3. In `report`, output candidates only.
4. In `apply-safe`, archive only high-confidence candidates with obvious
   destination and low-risk rewrites.
5. In `apply`, also archive medium-confidence candidates when evidence is clear.
6. Update tracker/navigation references and append `log.md` entry.

## Safety

- Never delete curated files here; archive moves only.
- Never operate on `raw/processed/`.
- Do not archive active/exploring projects without explicit evidence.

## Output

Return:

- candidates and confidence
- applied/deferred actions
- rewrites completed/proposed
- touched files
