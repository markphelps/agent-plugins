---
name: vault-review
description:
  Run a daily morning/evening review workflow and maintain structured daily
  notes.
---

# Review

Run a fast daily review loop against vault state.

## Arguments

`arguments` may include:

- `--kind morning|evening` (default: infer by time)
- `--date YYYY-MM-DD` (default: today)
- `--folder PATH` (default: `daily/`)
- `--mode report|apply-safe|apply` (default: `report`)

## Daily Note Contract

Path: `{folder}/YYYY-MM-DD.md` with sections:

- `## Plan`
- `## Log`
- `## Ideas`
- `## Carry Forward`

## Process

### Morning (`--kind morning`)

1. Read yesterday carry-forward + active projects + recent edits.
2. Generate 3-5 focus items.
3. In `apply-safe`/`apply`, append minimally to `## Plan`.

### Evening (`--kind evening`)

1. Read today plan + today's file activity.
2. Summarize progress in `## Log`.
3. Capture notable thoughts in `## Ideas`.
4. Carry unfinished items forward.
5. In `apply-safe`/`apply`, write updates minimally.

## Constraints

- No fabricated activity.
- Do not overwrite user-written sections; append/minimally edit only.

## Output

Return:

- kind/date
- summary
- sections updated/proposed
- touched files
