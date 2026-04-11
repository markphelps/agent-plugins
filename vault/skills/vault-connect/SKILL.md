---
name: vault-connect
description: Find unexpected connections between two topics in your vault
---

# Connect

Find meaningful bridges between two topics using vault evidence.

## Parameters

- topics: `A + B`, `A and B`, or `A & B`
- `--path PATH` vault path (default: current directory)
- `--depth N` link depth (default: 2, max: 3)
- `--mode report|apply-safe|apply` (default: `report`)

## Workflow

1. Resolve topic A and topic B note sets from filename/content/tags.
2. Expand each set through wikilinks up to `--depth`.
3. Detect intersections:
   - direct overlap notes
   - shared concepts/tags
   - bridge paths in the link graph
4. Rank candidate connections by:
   - strength (evidence density)
   - surprise (cross-domain novelty)
   - usefulness (actionability)
5. Execute by mode:
   - `report`: return ranked connections only
   - `apply-safe`: append findings to an existing target note when clearly
     specified
   - `apply`: create/update a dedicated synthesis note when requested or obvious

## Confidence Rubric

- `high`: multiple independent evidence paths and explicit cross-links
- `medium`: partial overlap with clear thematic bridge
- `low`: weak overlap or speculative mapping

## Output

Return top connections (default cap: 5), each with:

- connection title
- confidence
- evidence (`[[wikilinks]]` + short quote/snippet)
- why it matters (1 sentence)
- optional next action

## Constraints

- Do not force connections when evidence is weak.
- Distinguish obvious vs surprising links.
- Ground claims in specific notes.
- If one topic has no vault footprint, state that explicitly.
