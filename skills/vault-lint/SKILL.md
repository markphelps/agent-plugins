---
name: vault-lint
description: Hygiene pass over active notes, ideas, projects, and resources
---

# Lint Vault

Run a focused hygiene pass over active vault surface and propose fixes.

## Parameters

- `--scope notes|projects|all` (default: `all`)
- `--mode report|apply` (default: `report`)

## Checks

- **Orphan pages**: No inbound links from active surface
- **Stale pages**: `updated` date threshold + topic inactivity
- **Contradictions**: Conflicting claims across related notes
- **Broken/ambiguous wikilinks**: Invalid or unclear [[links]]
- **Missing concepts**: Repeated themes without canonical page
- **Mismatched states**: Project directory location vs tracker status

## Scope

- **notes/**, **ideas/**, **projects/**, and **resources/** by default (exclude
  archive/ unless explicitly requested)
- Does NOT move files (use `vault-tracker` for lifecycle changes)
- Does NOT delete content

## Workflow

1. Scan scoped directories and build issue list with file references.
2. Classify by severity: info, warning, critical.
3. In `report` mode: list issues and proposed fixes only.
4. In `apply` mode: fix link issues, flag decisions needing manual review.
5. Call out concept-promotion candidates (themes appearing 3+ times).
6. Report idea lifecycle issues:
   - duplicate ideas across `fleeting/`, `incubating/`, `someday/`, `rejected/`
   - stale incubating ideas without next action
   - project-like ideas that may need tracker promotion
7. Report mismatched project states for `vault-tracker` handling.
8. Summarize outcomes.

## Safety

- Report-first by default on all ambiguous issues.
- Never delete content or move files.
- Never modify raw/, processed/, or assets/.
- Exclude archive/ from automatic scans.

## Output

Return:

- Issue list with severity and file references
- Fixes applied (link corrections only)
- Decisions requiring manual review
- Concept promotion candidates
- Mismatched states flagged for vault-tracker
- Idea lifecycle issues and duplicate idea candidates
