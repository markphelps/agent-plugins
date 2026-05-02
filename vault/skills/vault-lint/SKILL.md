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
- **Merge candidates**: Duplicate or overlapping notes, ideas, projects, or
  resources that should probably be one durable item
- **Unbacked synthesis**: Summaries or briefs without links to complete archived
  source records
- **External tag drift**: Clipped source notes missing `external`, or owned
  notes incorrectly tagged `external`

## Scope

- **notes/**, **ideas/**, **projects/**, and **resources/** by default (exclude
  archive/ unless explicitly requested)
- Does NOT move files (use `vault-tracker` for lifecycle changes)
- Does NOT delete content
- Does NOT merge files automatically; proposes merge plans for review

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
7. Report merge candidates:
   - exact duplicates or near-duplicates
   - continuation notes that extend the same idea/project
   - split notes whose boundaries are accidental rather than useful
8. Report summaries or research briefs that do not cite complete sources under
   `raw/processed/YYYY-MM-DD/`.
9. Report tag issues:
   - likely clipped/source notes missing `external`
   - owned ideas, project drafts, or plans incorrectly tagged `external`
10. Report mismatched project states for `vault-tracker` handling.
11. Summarize outcomes.

## Merge Candidate Rubric

- **High confidence**: same title/slug, same source URL, same project or idea
  identity, or one note explicitly says it continues another.
- **Medium confidence**: heavy topical overlap with compatible claims, but
  uncertain destination or lifecycle state.
- **Low confidence**: same broad area but distinct decisions, audiences, or
  implementation paths.

High-confidence candidates may be passed to `vault-ingest`, `vault-tracker`, or
`vault-concepts` for apply-mode merging. Medium/low candidates should stay as
separate notes with proposed links.

## Safety

- Report-first by default on all ambiguous issues.
- Never delete content or move files.
- Never collapse distinct ideas just because they share keywords.
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
- Merge candidates with target, confidence, and rationale
- Synthesis notes missing archived source links
- External tag drift findings
