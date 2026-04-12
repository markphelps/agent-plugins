---
name: vault-ideas
description: Scan vault for patterns and generate actionable ideas
---

# Ideas

Generate actionable ideas from recurring patterns in the active vault surface.

## Parameters

- optional path (default: current working directory)
- `--focus AREA` focus on a domain (projects, writing, etc.)
- `--max-per-category N` cap ideas per category (default: 3)
- `--categories LIST` comma-separated subset of: `build,write,explore,revisit`

## Workflow

1. Scan active notes/projects and build topic/pattern clusters.
2. Detect recurring problems, opportunities, and stalled/high-signal areas.
3. Generate candidate ideas by category and rank by evidence strength.
4. Return a structured report with confidence and concrete next actions.

For large vaults, parallelize extraction tasks before synthesis.

## Confidence Rubric

- `high`: supported by 3+ independent notes
- `medium`: supported by 2 strong notes
- `low`: weak/adjacent evidence only

## Output

For each idea include:

- idea (1-2 sentences)
- category (`build|write|explore|revisit`)
- evidence (`[[wikilinks]]`)
- confidence (`high|medium|low`)
- why now (1 sentence)

## Constraints

- Ground ideas in actual vault evidence.
- Do not repeat ideas already captured as active project plans unless proposing
  a distinct next move.
- Favor quality over quantity (respect category caps).
