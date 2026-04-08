---
name: vault-concept-promoter
description:
  Promote repeated themes into canonical concept pages under notes/concepts
---

# Concept Promoter

Use this skill to turn repeated patterns in the active vault into durable
concept pages.

## Purpose

- keep `notes/concepts/` as the canonical synthesis layer
- prevent repeated ideas from remaining trapped in dated notes
- strengthen existing concept pages with new evidence over time

## Reuse Existing Skills

Prefer these existing skills as components instead of duplicating their logic:

- `vault-lint` to identify repeated patterns and missing concept pages
- `vault-drift` to surface cross-domain recurring signals
- `vault-trace` to gather evolution/history for a specific concept
- `vault-index` if concept changes require top-level navigation refresh
- `vault-log` to append the operation entry

## Modes

- `audit` - report concept-promotion candidates only
- `apply` - update or create concept pages

If no mode is specified, default to `audit`.

## Process

### Step 1: Scan for concept candidates

Focus on active curated areas only:

- `notes/`
- `projects/`
- `resources/`

Ignore:

- `archive/`
- `raw/`

Look for:

- themes appearing across 3+ unrelated notes
- repeated language in current project docs and durable notes
- dated or transient notes that should point to a canonical concept page

### Step 2: Decide whether to update or create

For each candidate:

- if a matching concept page already exists, update it
- if no concept page exists and the pattern is clearly durable, create one in
  `notes/concepts/`
- if confidence is weak, report only

### Step 3: Strengthen the concept page

When updating or creating a concept page:

- add a concise core claim
- add strong evidence links
- add implications or operating rules
- add `## Related` links to nearby concepts

### Step 4: Normalize references

If a dated note, report, or trace currently acts as the main home for the idea:

- link it to the canonical concept page
- reduce dependence on transient notes as the primary reference target

### Step 5: Refresh navigation and history

- if concepts changed materially, run the logic of `vault-index`
- append a concise entry to `log.md` using `vault-log`

## Apply Thresholds

Auto-apply only when all are true:

- theme appears in 3+ unrelated notes
- evidence is concrete, not speculative
- destination concept is clear
- edits are additive and low-risk

Otherwise, stay in `audit` mode.

## Safety

- do not create concept spam
- prefer updating existing concept pages over creating near-duplicates
- do not archive or delete notes from this skill
- do not use `archive/` as evidence unless it is historically important to the
  concept

## Output

Report:

- concepts updated or created
- evidence sources used
- references normalized
- whether `index.md` and `log.md` were updated
