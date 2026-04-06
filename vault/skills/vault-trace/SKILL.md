---
name: vault-trace
description: Track how an idea evolved over time across your vault
---

# Trace

Track how a specific idea or topic has evolved over time across your vault.
Shows when it first appeared, how your thinking changed, and what it's connected
to now.

## Arguments

`arguments` - The topic to trace, plus optional path and flags.

**Topic:** Required. The idea, concept, or theme to trace.

**Flags:**

- `--path PATH` - Vault path (default: current directory)

**Examples:**

```
vault-trace voice apps
vault-trace "personal knowledge management"
vault-trace AI agents --path ./notes
```

## Process

### Step 1: Search for the topic

Cast a wide net across the vault:

1. **Filename matches** — Glob for files containing the topic words
2. **Content matches** — Grep for the topic and related phrases in file bodies
3. **Tag matches** — Search frontmatter tags for related terms
4. **Wikilink matches** — Search for `[[links]]` that reference the topic

Skip hidden folders, `raw/inbox/`, `raw/processed/`, `raw/sources/`,
`raw/assets/`.

Collect all matching files with their `updated` (and `created` if present)
dates.

### Step 2: Build a timeline

For each matching note, extract:

- **Date** — `created` frontmatter field, or `updated`, or file modification
  date as fallback
- **What was said** — The relevant paragraph(s) mentioning the topic
- **Context** — What other topics appear in the same note
- **Sentiment/stance** — Is this exploratory, committed, skeptical, excited?

Sort chronologically (oldest first).

### Step 3: Trace the evolution

Analyze the timeline for:

- **First appearance** — When and where the idea first showed up
- **Key shifts** — Moments where your thinking changed direction
- **Deepening** — When the idea went from passing mention to dedicated note
- **Connections gained** — What other ideas it became linked to over time
- **Current state** — Where the idea stands now (active, dormant, evolved into
  something else)

### Step 4: Map connections

Show what the idea is connected to now:

1. Follow `[[wikilinks]]` from topic-related notes
2. Find notes that share tags with topic-related notes
3. Build a connection map (1 level deep)

### Step 5: Present the trace

```markdown
# Trace: [Topic]

**Traced:** YYYY-MM-DD **First seen:** YYYY-MM-DD in [[first-note]] **Latest:**
YYYY-MM-DD in [[latest-note]] **Total mentions:** N notes

## Timeline

### YYYY-MM-DD — First Appearance

> "Relevant quote from the note" — [[note-name]] Context: Appeared alongside
> thoughts on [other topic]

### YYYY-MM-DD — Key Shift

> "Quote showing the change" — [[note-name]] Shift: Moved from [old stance] to
> [new stance]

### YYYY-MM-DD — Current State

> "Most recent thinking" — [[note-name]]

## Evolution Summary

[2-3 sentence narrative of how the idea evolved]

## Current Connections

- [[connected-note-1]] — How it relates
- [[connected-note-2]] — How it relates

## Observations

- [Pattern or insight about the evolution]
- [Something surprising about the timeline]
```

### Step 6: Offer next actions

- "Want me to create a synthesis note capturing this evolution?"
- "Want me to run `vault-connect` between this and [related topic]?"
- "Want me to run `vault-challenge` to pressure-test your current thinking?"

## Subagent Strategy

| Task                  | Model                 | Why                           |
| --------------------- | --------------------- | ----------------------------- |
| File searching        | small model           | Simple grep/glob              |
| Content extraction    | small model           | Pull relevant paragraphs      |
| Timeline construction | high-capability model | Needs chronological reasoning |
| Evolution narrative   | high-capability model | Nuanced analysis              |

## Constraints

- Only include notes that genuinely mention the topic (not tangential matches)
- Quote directly from notes — don't paraphrase
- If fewer than 3 mentions found, say so and suggest broadening the search term
- Keep the timeline readable — summarize, don't dump every mention
