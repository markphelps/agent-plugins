---
name: vault-concepts
description: Maintain canonical concept pages and surface recurring themes
---

# Concepts

Promote recurring themes into canonical concept pages and keep concept
navigation coherent.

## Purpose

Maintain `notes/concepts/` as the durable vocabulary of your vault. Surface
cross-domain patterns and decide when transience deserves permanence.

## Parameters

- `--topic TOPIC` focus on specific theme (optional)
- `--mode report|apply` (default: `report`)

## Thresholds for New Concept Creation

Only create new concept pages when ALL are true:

- Theme appears in 3+ unrelated notes
- Evidence is concrete and linkable
- Destination concept is clear
- Change is additive and low-risk

## Workflow

1. **Scan**: Read active surface (`notes/`, `projects/`, `resources/`) for
   recurring themes
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
- **apply**: Update existing concepts; create new ones when thresholds met

## Safety

- Prefer updating existing concepts over creating near-duplicates
- Never delete notes or archive content
- Never modify raw/, processed/, or assets/
- Confirm before creating new concept pages

## Output

Return:

- Concepts created/updated/proposed (with confidence)
- Evidence links used
- Reference normalization performed
- Index/log update status
- Recommended follow-up actions
