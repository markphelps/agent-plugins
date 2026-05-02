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
- **Connection candidates**: Notes that should be linked to strengthen the
  knowledge graph over time
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
- Does NOT add speculative graph links; only high-confidence links are applied

## Workflow

1. Scan scoped directories and build issue list with file references.
2. Classify by severity: info, warning, critical.
3. In `report` mode: list issues and proposed fixes only.
4. In `apply` mode: fix link issues, flag decisions needing manual review.
5. Find connection candidates:
   - unlinked notes sharing a named project, idea, concept, source, or decision
   - notes that explicitly mention another note title or alias without a
     wikilink
   - external source records that support a project, idea, or concept
   - orphan pages with an obvious parent, project, concept, or resource
6. In `apply` mode: add high-confidence contextual links and backlinks.
7. Call out concept-promotion candidates (themes appearing 3+ times).
8. Report idea lifecycle issues:
   - duplicate ideas across `fleeting/`, `incubating/`, `someday/`, `rejected/`
   - stale incubating ideas without next action
   - project-like ideas that may need tracker promotion
9. Report merge candidates:
   - exact duplicates or near-duplicates
   - continuation notes that extend the same idea/project
   - split notes whose boundaries are accidental rather than useful
10. Report summaries or research briefs that do not cite complete sources under
    `raw/processed/YYYY-MM-DD/`.
11. Report tag issues:

- likely clipped/source notes missing `external`
- owned ideas, project drafts, or plans incorrectly tagged `external`

12. Report mismatched project states for `vault-tracker` handling.
13. Summarize outcomes.

## Connection Candidate Rubric

Add links to build the knowledge graph when the relationship is concrete and
useful for future navigation.

- **High confidence**: direct title/alias mention, shared source URL, explicit
  parent/child relation, project material linked to its project, research source
  supporting a specific project/idea/concept, or concept page named by the note.
- **Medium confidence**: strong topical overlap or recurring phrase, but the
  relationship label is unclear.
- **Low confidence**: same broad domain, weak semantic similarity, or link would
  be decorative.

Apply-mode link additions must be contextual: add the wikilink near the relevant
claim, heading, source, or `Related` section. If no natural location exists,
report the candidate instead of forcing a link.

Prefer linking over merging when notes are related but distinct. Prefer concept
links over many point-to-point links when a concept page is the better hub.

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
- Never add links based only on keyword overlap.
- Never modify raw/, processed/, or assets/.
- Exclude archive/ from automatic scans.

## Output

Return:

- Issue list with severity and file references
- Fixes applied (link corrections only)
- Decisions requiring manual review
- Concept promotion candidates
- Connection candidates and links added
- Mismatched states flagged for vault-tracker
- Idea lifecycle issues and duplicate idea candidates
- Merge candidates with target, confidence, and rationale
- Synthesis notes missing archived source links
- External tag drift findings
