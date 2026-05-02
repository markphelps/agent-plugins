---
name: vault-research
description:
  Use when a vault note, idea, project, or topic needs external sources,
  competitor research, discussion evidence, or market signals
---

# Research

Research a target note, idea, project, or topic. Preserve external sources as
traceable source records by default; write summaries only when the user asks for
synthesis, assessment, or a concise research brief.

## Parameters

Target can be:

- note filename (`voice-notes-app` or `voice-notes-app.md`)
- relative path (`notes/car-search/prd.md`)
- absolute path

Optional flags:

- `--mode report|apply` (default: `report`)
- `--output sources|summary|both` (default: `sources`)

## Target Resolution

Resolve target in this order:

1. exact path
2. unique basename match
3. if ambiguous, ask one concise disambiguation question and stop

## Workflow

1. Load the target and extract topic/problem and context.
2. Run three tracks in parallel:
   - competitor landscape
   - community discussions (Reddit/HN/forums)
   - market signals (funding/trends/news)
3. Classify each external source by type, relevance, topic, and confidence.
4. Choose output behavior:
   - `sources`: create or update source records only
   - `summary`: write a concise synthesized research block with citations
   - `both`: preserve source records and write a concise synthesis
5. In `apply` mode, place source records in the closest durable location:
   - `projects/active/<project>/research/`
   - `ideas/<state>/<idea>/research/`
   - `resources/<topic>/`
6. Assign confidence (`high|medium|low`) for key claims.
7. If writing a summary, keep it clearly separate from owned notes and link back
   to source records.
8. Return what was found, where sources were placed, and what was written.

## Evidence Policy

- Prefer primary sources when available.
- Mark uncertain claims explicitly instead of overstating.
- Keep findings actionable and traceable to sources.
- Do not replace, compress, or rewrite owned project ideas or user-authored
  notes as a research side effect.

## Constraints

- Default behavior is report-only and source-first.
- Summary writing requires either `--output summary`, `--output both`, or an
  explicit user request for synthesis.
- If signal quality is weak, report low confidence and preserve sources without
  overstating conclusions.
- If target note lacks enough context, ask for clarification before broad
  search.

## Output

Return:

- target note path
- source records found/created and their destination paths
- findings summary if requested
- confidence highlights
- whether source records or target notes were updated
- suggested follow-up actions
