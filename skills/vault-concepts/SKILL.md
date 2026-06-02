---
name: vault-concepts
description: Maintain canonical concept pages and surface recurring themes
---

# Concepts

Promote recurring themes into canonical concept pages and keep concept
navigation coherent.

Portent reference: `../references/portent-knowledge-base-spec.md`.

## Recency Priority

Work the active surface newest-first, ranked by each object's `updated`
frontmatter date (fall back to file modification time when `updated` is absent).
Concentrate scrutiny on the freshest material — recently-touched objects are
where active thinking lives and where new mismatches, overlaps, and gaps appear.
Long-untouched objects are assumed settled and rank lower, but are never
excluded: they remain valid link targets, merge destinations, and canonical
homes, and still get a structural check (broken links, orphaning).

Weight theme detection toward recent notes so emerging themes surface early, but
keep temporal spread as the high-confidence signal: a concept still needs
occurrences across time, not just a recent burst.

## Purpose

Maintain `notes/concepts/` as the durable vocabulary of your vault. Surface
cross-domain patterns and decide when transience deserves permanence.

Concept pages are Portent `Topic` objects. New recurring-theme pages should use
`type: Topic`, `status: organized`, and explicit `related_to` links to the
Projects, Notes, Events, or Responsibilities they help explain.

## Parameters

- `--topic TOPIC` focus on specific theme (optional)
- `--mode report|apply` (default: `report`)

## Thresholds for New Concept Creation

Only create new concept pages when ALL are true:

- Theme appears in 3+ unrelated notes
- Evidence is concrete and linkable
- Destination concept is clear
- Destination Topic object is clear
- Change is additive and low-risk

## Workflow

1. **Scan**: Read active surface (`notes/`, `ideas/`, `projects/`) for recurring
   themes
2. **Detect**: Extract patterns across unrelated notes:
   - Phrases/metaphors that recur
   - Principles or mental models
   - Unresolved questions with traction
3. **Filter**: Remove false positives:
   - Deliberate tag repetition
   - Common filler phrasing
   - Same-project-only repetition
4. **Cluster**: Group related patterns and rank by confidence
5. **Decide** per candidate:
   - Update existing concept page
   - Merge near-duplicate concept pages into one canonical concept
   - Create new concept page (if thresholds met)
   - Defer (insufficient evidence)
6. **Normalize**: Rewrite transient note references to point to canonical
   concepts
7. **Refresh**: Update `index.md` when concept navigation changes
8. **Log**: Append concise operation entry

## Confidence Rubric

- **High**: 3+ unrelated notes with temporal spread
- **Medium**: 2 unrelated notes with strong conceptual overlap
- **Low**: Weak recurrence or same-domain concentration

## Apply Behavior

- **report**: List candidates only, no changes
- **apply**: Update existing concepts; merge high-confidence duplicates; create
  new ones when thresholds met

## Merge Rules

Merge concept pages when they name the same principle, mental model, or durable
vocabulary item. Do not merge broad neighboring concepts just because they are
often linked together.

- Choose the clearest, most established page as canonical.
- Preserve distinct examples, open questions, and source links from merged
  pages.
- Rewrite links from merged pages to the canonical concept.
- Keep aliases when alternate names are likely search terms.
- Report medium-confidence concept overlaps instead of merging them.

## Safety

- Prefer updating existing concepts over creating near-duplicates
- Never delete notes or archive content
- Never merge concept pages that represent different decisions or levels of
  abstraction
- Never modify raw/, processed/, or assets/
- Confirm before creating new concept pages

## Output

Return:

- Concepts created/updated/proposed (with confidence)
- Concepts merged/proposed for merge
- Topic object metadata added or updated
- Evidence links used
- Reference normalization performed
- Index/log update status
- Recommended follow-up actions
