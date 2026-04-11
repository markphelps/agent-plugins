---
name: vault-project-tracker
description:
  Maintain project-tracker.md and manage project lifecycle state changes
---

# Project Tracker

Keep `projects/project-tracker.md` aligned with real project state and lifecycle
transitions.

## Parameters

- optional project name/path
- optional transition intent (`mark shipped`, `archive now`, etc.)
- `--mode report|apply-safe|apply` (default: `report`)

## Lifecycle States

- `active`, `exploring`, `paused`, `shipped`, `archived`

## Mode Behavior

- `report`: audit tracker vs filesystem and propose transitions
- `apply-safe`: apply unambiguous tracker updates only
- `apply`: apply confirmed transitions, including archive moves with link
  rewrites

## Workflow

1. Interactive intake (unless explicit single-project request):
   - ask concise state questions for live-surface projects
   - avoid reviewing shipped/archived unless explicitly requested
2. Read tracker and inspect corresponding project docs/files.
3. Classify smallest valid transition:
   - `active <-> exploring`
   - `active|exploring -> paused`
   - `paused -> active`
   - `active|exploring|paused -> shipped`
   - `active|exploring|paused|shipped -> archived`
4. Apply by mode:
   - `report`: return proposed transitions and evidence
   - `apply-safe`: update tracker rows/links when obvious
   - `apply`: perform file moves + inbound link rewrites for archive transitions
5. Keep tracker lightweight (control-plane style).
6. Append concise lifecycle entry to `log.md`.

## Report Scope

Default report scope is live surface only (`active`, `exploring`, `paused`).
Include `shipped`/`archived` only when explicitly requested.

## Safety

- Never delete project files in this skill.
- Do not archive until inbound links are checked/rewritten.
- Prefer archive moves over deletion.
- Do not let tracker become the only source of project history.

## Output

Return:

- transitions applied/proposed
- evidence and confidence
- files moved/updated
- tracker sections changed
- touched files
