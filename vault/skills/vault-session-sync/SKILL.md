---
name: vault-session-sync
description:
  End-of-session sync for vault state update project tracker, notes/index, and
  operation log from session context
---

# Session Sync

Run this at the end of a coding/research session to keep vault state current.

## Parameters

- `--mode report|apply-safe|apply` (default: `report`)
- optional focus: `--project <name|path>`
- optional context hints:
  - `--summary "<text>"`
  - `--changes "<paths or notes>"`
  - `--decision "<key outcome>"`
- optional quality hooks:
  - `--lint` (run `vault-lint --mode report`)
  - `--qmd` (run `vault-qmd --mode report` for hosted-vault preflight)

## Workflow

1. Gather session context from:
   - explicit flags (`--summary`, `--changes`, `--decision`)
   - latest touched project/note surface (if hints are omitted)
2. Resolve impacted projects/notes:
   - prioritize `projects/project-tracker.md` entries
   - include directly related `notes/` pages
3. Update project lifecycle state via `vault-project-tracker`:
   - `report`: propose transitions only
   - `apply-safe`: apply unambiguous tracker/link updates
   - `apply`: include confirmed archive transitions
4. Update durable navigation when needed via `vault-index`.
5. Optionally run:
   - `vault-lint --mode report` when `--lint` is set
   - `vault-qmd --mode report` when `--qmd` is set
6. Append one concise end-of-session entry via `vault-log`.

## Safety

- Non-destructive by default (`report`).
- Do not mutate anything under `raw/*`.
- Do not archive/delete content unless explicitly requested and mode allows it.
- Keep write scope tight: touched project rows, related notes, index/log only.

## Output

Return:

- session synopsis (what changed)
- project transitions proposed/applied
- index/log updates
- optional lint/qmd findings
- touched files
