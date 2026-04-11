---
name: vault-research
description: Research a note - find competitors, discussions, and market signals
---

# Research

Research a target note/topic and append a concise research block to that note.

## Parameters

Target can be:

- note filename (`voice-notes-app` or `voice-notes-app.md`)
- relative path (`notes/car-search/prd.md`)
- absolute path

Optional flags:

- `--report-only` return findings without writing to the note

## Target Resolution

Resolve target in this order:

1. exact path
2. unique basename match
3. if ambiguous, ask one concise disambiguation question and stop

## Workflow

1. Load the target note and extract topic/problem and context.
2. Run three tracks in parallel:
   - competitor landscape
   - community discussions (Reddit/HN/forums)
   - market signals (funding/trends/news)
3. Synthesize findings into a compact structure:
   - competitors
   - discussion insights
   - market signals
   - assessment
   - next steps
4. Assign confidence (`high|medium|low`) for key claims.
5. If not `--report-only`, append the research block to the target note and
   refresh `updated` frontmatter.
6. Return summary of what was found and what was written.

## Evidence Policy

- Prefer primary sources when available.
- Mark uncertain claims explicitly instead of overstating.
- Keep findings actionable and traceable to sources.

## Constraints

- Default behavior is write-through (append to target note).
- If signal quality is weak, append findings with low confidence notes.
- If target note lacks enough context, ask for clarification before broad
  search.

## Output

Return:

- target note path
- findings summary
- confidence highlights
- whether note was updated
- suggested follow-up actions
