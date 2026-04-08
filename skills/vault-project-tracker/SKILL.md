---
name: vault-project-tracker
description:
  Maintain project-tracker.md and manage project lifecycle state changes
---

# Project Tracker

Use this skill to keep `projects/project-tracker.md` aligned with the real state
of the vault and to manage project lifecycle transitions.

## Goals

- Keep the live project surface small and accurate
- Reflect the true state of each project: active, exploring, paused, shipped, or
  archived
- Move dead project material to `archive/` when appropriate
- Keep `archive/index.md` and `log.md` in sync with lifecycle changes

## Lifecycle States

- `active` - current work with ongoing investment
- `exploring` - real but not yet committed
- `paused` - intentionally inactive but still live
- `shipped` - released or completed
- `archived` - no longer part of the active surface

## Inputs

`arguments` may include:

- a project name
- optional notes such as "archive now", "mark shipped", or "promote to active"
- `audit` to run tracker-to-filesystem checks

State transition details should be gathered interactively from the user instead
of requiring fully-specified arguments at call time.

## Process

### Step 1: Run interactive intake first

Before changing files, ask the user concise questions to confirm current
reality.

Default scope for interactive questions:

- Ask about projects currently listed as `active`, `exploring`, or `paused`
- Do not ask review questions for `shipped` or `archived` projects unless the
  user explicitly asks to review them
- If a specific project was provided, ask only about that project (even if it is
  not in the default scope)

Minimum prompts for each scoped project:

- Which project should be updated?
- What is the project's current state right now?
- What should the new state be?
- Any special action needed (archive now, mark shipped, keep as-is with notes)?

If the user only asks for a general update, propose a short candidate list from
the `active`, `exploring`, and `paused` sections of
`projects/project-tracker.md` and ask them to pick one or more.

Do not assume lifecycle state from invocation text when it is ambiguous.

### Step 2: Inspect current tracker and project files

- Read `projects/project-tracker.md`
- Find the target project folder and key docs under `projects/`
- Check for references outside the project folder before moving anything

### Step 3: Classify the transition

Choose the smallest correct action:

- `active -> exploring`
- `exploring -> active`
- `active/exploring -> paused`
- `paused -> active`
- `active/exploring/paused -> shipped`
- `active/exploring/paused/shipped -> archived`

### Step 4: Apply state-specific behavior

#### If marking `active`, `exploring`, `paused`, or `shipped`

- Update `projects/project-tracker.md`
- Keep project docs in `projects/`
- Normalize links in the tracker if needed

#### If marking `archived`

- Move project docs from `projects/...` to `archive/projects/dead/...`
- Rewrite inbound links outside the folder to point to the archive path
- Update `projects/project-tracker.md`
- Add or refresh an entry in `archive/index.md`

### Step 5: Keep the tracker lightweight

`projects/project-tracker.md` should be a control plane, not a full archive.

- Keep active/exploring/shipped sections concise
- Use `Archived` only for recent archive activity
- Point older historical detail to `[[archive/index]]`

### Step 6: Record the change

- Append a concise lifecycle entry to `log.md`

## Audit Mode

If invoked as `vault-project-tracker audit`:

- compare `projects/project-tracker.md` to the actual contents of `projects/`
- default to the live surface only: `active`, `exploring`, and `paused`
- flag mismatches between tracker state and filesystem reality for that live
  surface
- suggest promotions, pauses, shipped transitions, or archive candidates for
  live projects
- identify projects listed in tracker but missing corresponding files
- do not include `shipped` or `archived` audit findings unless the user
  explicitly asks for full-history audit

## Safety

- Do not delete project files unless explicitly requested
- Do not archive a project until inbound links are checked and updated
- Do not let `project-tracker.md` become the only place that stores project
  history
- Prefer archive moves over deletion for curated project material
- Keep the user's declared current projects authoritative when provided

## Output

Report:

- lifecycle change applied
- files moved or updated
- tracker sections changed
- archive/log updates made
