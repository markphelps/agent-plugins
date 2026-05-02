---
name: vault-research
description:
  Use when a vault note, idea, project, or topic needs external sources,
  competitor research, discussion evidence, or market signals
---

# Research

Research a target note, idea, project, or topic. Preserve external sources as
traceable source records by default; write summaries only when the user asks for
synthesis, assessment, or a concise research brief. Any source used in a summary
keeps a complete immutable copy in `raw/processed/YYYY-MM-DD/`.

Notes tagged `external` are treated as clipped/imported external sources and are
eligible for synthesis while preserving the complete source record.

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
2. Check whether target/source notes carry an `external` tag.
3. Run three tracks in parallel:
   - competitor landscape
   - community discussions (Reddit/HN/forums)
   - market signals (funding/trends/news)
4. Classify each external source by type, relevance, topic, and confidence.
5. Choose output behavior:
   - `sources`: create or update source records only
   - `summary`: write a concise synthesized research block with citations
   - `both`: preserve source records and write a concise synthesis
6. In `apply` mode, archive every external source used for synthesis to
   `raw/processed/YYYY-MM-DD/` before writing the synthesis.
7. Place working source records in the closest durable location:
   - `projects/active/<project>/research/`
   - `ideas/<state>/<idea>/research/`
   - `resources/<topic>/`
8. Merge source records into an existing research/source note when they cover
   the same external source or same research thread.
9. Assign confidence (`high|medium|low`) for key claims.
10. If writing a summary, keep it clearly separate from owned notes and link
    back to archived complete source records.
11. Return what was found, where sources were placed, and what was written.

## Copy vs Synthesize Decision

Default to `--output sources` for untagged material. Notes tagged `external` may
use `summary` or `both` during processing because the tag explicitly marks them
as external clipped sources.

- Use `sources` for collecting, categorizing, moving, linking, or preserving
  external records without interpretation.
- Use `summary` when the user wants an answer or brief and does not need
  separate working source notes.
- Use `both` when the user wants synthesis and the sources should remain useful
  as organized research material.

Never summarize user-authored ideas, project drafts, plans, or notes as part of
research unless the user explicitly asks for that specific note to be
summarized. Link external findings to those owned notes instead.

## Evidence Policy

- Prefer primary sources when available.
- Mark uncertain claims explicitly instead of overstating.
- Keep findings actionable and traceable to sources.
- Do not replace, compress, or rewrite owned project ideas or user-authored
  notes as a research side effect.
- Treat `external` as the source-origin signal for synthesis eligibility.
- Merge duplicate external-source records when URL/source identity matches;
  otherwise link related sources instead of collapsing them.
- Cite archived complete source records from `raw/processed/YYYY-MM-DD/` for
  every synthesized claim or source summary.

## Constraints

- Default behavior is report-only and source-first.
- Summary writing requires `external`, `--output summary`, `--output both`, or
  an explicit user request for synthesis.
- In `apply` mode, do not write a summary until complete source records have
  been archived.
- If signal quality is weak, report low confidence and preserve sources without
  overstating conclusions.
- If target note lacks enough context, ask for clarification before broad
  search.

## Output

Return:

- target note path
- source records found/created and their destination paths
- archived complete source paths under `raw/processed/YYYY-MM-DD/`
- source records merged and canonical destinations
- findings summary if requested
- confidence highlights
- whether source records or target notes were updated
- suggested follow-up actions
