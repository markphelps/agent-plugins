---
name: vault-weekly-maintainer
description:
  Run a weekly vault maintenance sweep across tracker, concepts, archive
  hygiene, index, and log
---

# Weekly Maintainer

Use this skill as the orchestration layer for recurring vault upkeep.

## Purpose

Run a bounded weekly maintenance loop that keeps the vault accurate without
letting automation make large ambiguous changes silently.

## Reuse Existing Skills

This skill should call or emulate the logic of these skills in order:

1. `vault-project-tracker audit`
2. `vault-concept-promoter audit`
3. `vault-archive-audit report`
4. `vault-index`
5. `vault-log`

If the caller explicitly requests auto-apply mode, it may also apply safe fixes
from:

- `vault-project-tracker`
- `vault-concept-promoter`
- `vault-archive-audit`

## Modes

- `report` - default; produce weekly findings and only apply harmless hygiene
- `apply-safe` - apply high-confidence low-risk fixes

## Weekly Sequence

### Step 1: Tracker audit

- verify `projects/project-tracker.md` against current `projects/`
- flag status drift and missing entries

### Step 2: Concept promotion audit

- identify repeated patterns in active notes/projects
- recommend concept updates or new canonical pages

### Step 3: Archive audit

- identify dead or superseded projects/notes that should move to `archive/`
- separate high-confidence candidates from human-decision items

### Step 4: Index hygiene

- refresh `index.md` if current navigation drifted

### Step 5: Weekly summary

Produce a short summary with:

- current active projects
- exploring projects
- concept pages strengthened or proposed
- archive actions applied or recommended
- unresolved items needing human approval

### Step 6: Log the run

- append a concise maintenance entry to `log.md`

## Safe Auto-Apply Scope

Allowed in `apply-safe` mode:

- tracker formatting cleanup
- obvious tracker status normalization when user policy is already known
- evidence-only updates to existing concept pages
- low-risk link normalization
- `index.md` refresh
- `log.md` append

Not allowed without explicit instruction:

- deleting curated notes
- archiving ambiguous live projects
- creating many new concept pages at once

## Output

Return a compact weekly maintenance report with:

- applied changes
- proposed changes
- confidence notes
- next actions for the user or future cron runs
