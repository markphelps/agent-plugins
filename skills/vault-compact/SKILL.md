---
name: vault-compact
description:
  Collapse semantically overlapping notes, ideas, and project docs into clearer
  canonical surfaces while preserving distinct claims, decisions, examples, and
  source provenance.
---

# Vault Compact

Reduce repeated thinking across the active vault. This skill is for semantic
overlap, not just exact duplicate text: compact passages when they do the same
job in the knowledge system.

## Command

```
vault-compact [--scope notes|ideas|projects|all] [--mode report|apply-safe|apply] [--aggression conservative|normal|aggressive]
```

## Parameters

- `--scope notes|ideas|projects|all` (default: `all`)
- `--mode report|apply-safe|apply` (default: `report`)
  - `report`: identify overlap and propose canonical destinations only
  - `apply-safe`: apply high-confidence local compaction only
  - `apply`: also merge high-confidence cross-file overlap when provenance and
    links can be preserved; delete absorbed curated files when appropriate
- `--aggression conservative|normal|aggressive` (default: `conservative`)
  - `conservative`: exact/near-duplicate sections and obvious repeated claims
  - `normal`: same-claim overlap with unique examples preserved
  - `aggressive`: broader synthesis; appropriate for shipped/archived project
    compaction or when explicitly requested

## What Counts As Overlap

Compact when multiple passages are doing the same job:

- repeated thesis or framing
- duplicated audience/problem/value-prop language
- duplicated project status or next-action text
- same source summary in multiple curated notes
- same idea split across multiple idea notes
- concept explanation repeated instead of linked to the concept page
- stale restatement that is superseded by a clearer canonical section
- shipped project launch artifacts, drafts, and research that have served their
  temporary purpose

Do not compact just because notes share keywords.

## Unit Of Judgment

Compare passages as claim-like units:

- thesis
- audience
- problem
- product idea
- decision
- evidence
- example
- caveat
- open question
- next action
- implementation detail
- source summary

If two units make the same claim, collapse them. If one adds a distinct example,
decision, caveat, source, audience, or implementation detail, preserve that
detail.

## Workflow

1. Read `AGENTS.md`, then `index.md`.
2. Confirm the scoped directories:
   - `notes/`
   - `ideas/`
   - `projects/`
3. Exclude `raw/`, `raw/processed/`, `raw/assets/`, and `archive/` unless the
   user explicitly asks for an audit that includes archived curated material.
4. Use qmd first for semantic retrieval:
   - `qmd query` for themes and semantic overlap
   - `qmd search` for exact phrases, titles, URLs, and aliases
   - `rg` for migration residue, raw strings, and link rewrites
5. Build candidate groups by canonical topic, project, idea, source, or claim.
6. Classify each group by confidence and compaction action.
7. In `report` mode, stop after a compact report.
8. In `apply-safe` mode, apply only local, high-confidence edits inside one file
   or obvious link substitutions to canonical concept notes.
9. In `apply` mode, apply high-confidence cross-file compaction only when all
   unique content and provenance can be retained.
10. Delete absorbed curated files only after the canonical destination preserves
    their unique claims, examples, decisions, and provenance.
11. Update `updated:` frontmatter on edited curated notes where practical.
12. Run `qmd update` after any edits, moves, or deletions.
13. Append one concise line to `log.md` for every material vault change.

## Compaction Actions

- `dedupe`: remove exact or near-exact repeated paragraphs, bullets, or
  sections.
- `collapse`: replace equivalent claims with one sharper canonical statement and
  preserve unique examples, caveats, evidence, and decisions below it.
- `route`: replace repeated local explanation with a wikilink to the canonical
  note or section.
- `merge-plan`: propose a merge, canonical destination, unique content to
  preserve, and link rewrites; do not edit.
- `absorb-delete`: after a successful merge, remove curated source files whose
  useful content now lives in the canonical destination.
- `link-only`: add or propose a relationship link because notes are related but
  distinct.

## Confidence Rubric

### High Confidence

- Same source URL or same clipped source identity.
- Same title, slug, project, or idea identity.
- One note explicitly continues, replaces, or supersedes another.
- Passages make the same claim with compatible meaning.
- Differences are examples, wording, or ordering, not substance.
- Canonical destination is obvious.

High-confidence items may be compacted in `apply-safe` when local to one file,
or in `apply` when cross-file provenance and links can be preserved.

### Medium Confidence

- Same broad thesis with a meaningful caveat in one passage.
- Same product shape but slightly different audience or monetization.
- Same concept repeated across notes but no existing canonical destination.
- Canonical destination is plausible but not obvious.

Medium-confidence items become merge plans or concept-promotion candidates.

### Low Confidence

- Same broad domain only.
- Similar vocabulary but different use cases.
- Similar AI-generated structure but different actual content.
- Different lifecycle states or strategic decisions.

Low-confidence items should remain separate; propose links only when useful.

## Canonical Destination Rules

### Notes

- Prefer canonical concept pages under `notes/concepts/` for repeated theses.
- Prefer existing topic notes over creating new notes.
- External clipped notes are evidence, not owned synthesis. Preserve source
  identity and do not absorb complete external text into owned notes.
- Repeated source summaries should cite complete source records under
  `raw/processed/YYYY-MM-DD/` when used for synthesis.

### Ideas

- Keep the canonical idea in its lifecycle location under `ideas/`.
- Preserve distinctions in audience, wedge, pricing, validation status, and kill
  criteria.
- If two ideas share a product shape but differ in customer or strategy, do not
  merge; create a comparison or shared concept link instead.

### Projects

- Keep project PRDs, plans, decisions, research, and postmortems separate unless
  one is clearly obsolete or duplicative.
- Canonical project state should live in the main project PRD, README, or
  tracker according to the local convention.
- Do not merge active, paused, shipped, and rejected rationales into one generic
  project summary; lifecycle context matters.
- For shipped projects, run heavier compaction after the shipping transition.
  Merge temporary launch materials, tweet drafts, old outlines, research
  snippets, and implementation leftovers into one canonical shipped project
  record when they no longer serve active execution.
- Shipped project compaction may delete absorbed curated files after the merged
  record preserves unique outcomes, lessons, market notes, source links, and
  reusable copy.

## Synthesis Rules

Conservative synthesis is allowed only when:

- source passages agree
- no distinct decision, caveat, example, or evidence point is lost
- provenance links remain intact
- the new wording is more precise than the repeated wording
- the edit reduces repeated thinking rather than merely shortening the note

Prefer this shape:

```
Canonical claim.

Supporting examples:
- example from note A
- example from note B

Evidence:
- [[raw/processed/YYYY-MM-DD/source|Complete Source Record]]
```

Avoid flattening useful nuance into generic summaries.

## Safety

- Never edit anything under `raw/`.
- Never delete source evidence.
- Never delete curated files until their unique content has been merged into a
  canonical destination and inbound links have been updated.
- Never compact distinct ideas because they share keywords.
- Never replace a source record with a summary.
- Never remove unresolved questions, decisions, caveats, or examples unless they
  are duplicated elsewhere in the same canonical destination.
- Never merge across lifecycle states without preserving the lifecycle meaning.
- Default to `report` when confidence is not high.
- Keep all edits reviewable and list touched files.

## Output

Return:

- Scope, mode, and aggression used
- Candidate groups with canonical destination, confidence, and rationale
- Applied changes by file and compaction action
- Preserved unique claims, examples, evidence, and decisions
- Deferred merge plans with required user decisions
- Link-only relationships proposed or applied
- Absorbed files deleted, with canonical destination
- Files intentionally skipped and why
- `qmd update` status
- `log.md` entry status

## Example Report Shape

```markdown
## Compact Report

### Applied

- `notes/concepts/example.md`: collapsed repeated thesis under `## Core Claim`
  and preserved two unique examples.

### Merge Plans

- Canonical: `ideas/incubating/example-prd.md`
- Candidates: `ideas/fleeting/example.md`,
  `notes/app-marketing/example-positioning.md`
- Confidence: medium
- Rationale: same product shape, but audience differs.
- Preserve: pricing caveat, validation question, source link.

### Skipped

- `projects/active/example/prd.md` vs `projects/paused/example/prd.md`
- Reason: same project name but different lifecycle state and decision context.

### Maintenance

- `qmd update`: not run in report mode
- `log.md`: not updated in report mode
```
