---
name: vault-challenge
description:
  Pressure-test a topic by finding contradictions, weak assumptions, and blind
  spots across your vault notes.
---

# Challenge

Pressure-test a thesis/topic using vault evidence and targeted counterpoints.

## Parameters

- topic (required)
- `--path PATH` vault path (default: current directory)
- `--mode report|apply-safe|apply` (default: `report`)

## Workflow

1. Resolve notes that express the target position.
2. Extract claims, assumptions, and implied constraints.
3. Identify challenge vectors:
   - contradictions in vault notes
   - missing assumptions
   - execution/failure risks
   - counter-evidence or alternative interpretations
4. Rank challenges by impact (what would change decisions most).
5. Execute by mode:
   - `report`: return challenge findings only
   - `apply-safe`: append challenge section to an explicitly specified target
     note
   - `apply`: create/update a dedicated challenge note when requested

## Confidence Rubric

- `high`: multiple direct contradictions or strong counter-evidence
- `medium`: partial conflicts or plausible untested assumptions
- `low`: speculative challenges with limited support

## Output

Return top challenges (default cap: 5), each with:

- challenge statement
- confidence
- evidence (`[[wikilinks]]` + short quote/snippet)
- impact if true
- suggested next test or decision

## Constraints

- Be rigorous, not performative.
- Ground claims in evidence; do not invent positions.
- Present challenges neutrally.
- If the topic appears well-supported with few gaps, say so.
