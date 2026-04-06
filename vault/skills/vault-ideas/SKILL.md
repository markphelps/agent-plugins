---
name: vault-ideas
description: Scan vault for patterns and generate actionable ideas
---

# Ideas

Scan the vault for emerging patterns across notes and generate a structured idea
report — things to build, write, explore, or act on.

## Arguments

`arguments` - Optional path to vault root and flags.

**Path:** Defaults to current working directory.

**Flags:**

- `--focus AREA` - Focus on a specific area (e.g., `--focus projects`,
  `--focus writing`)

**Examples:**

```
vault-ideas                       # Scan entire vault
vault-ideas ./notes               # Scan specific folder
vault-ideas --focus projects      # Focus on project ideas
```

## Process

### Step 1: Build vault map

Scan the vault to understand what's there:

1. Use Glob to find all `.md` files (skip hidden folders, `inbox/`,
   `_processed/`, `._meta/`)
2. Read each file's frontmatter (tags, status, updated date)
3. Build a topic index from tags and filenames
4. Note which topics have the most notes (clusters)
5. Note which notes are most recently updated (active thinking)

For large vaults (20+ files), use small model subagents to parallelize reading:

```
Task(
  subagent_type: "general-purpose",
  prompt: "Read these files and extract: title, tags, key concepts, status...",
  parallel: true
)
```

### Step 2: Identify patterns

Look for:

- **Recurring themes** — Topics or tags that appear across 3+ unrelated notes
- **Active clusters** — Groups of notes on the same topic with recent updates
- **Stalled projects** — Notes with `status: active` but old `updated` dates
- **Orphan ideas** — Notes with few or no links to other notes
- **Convergence** — Two separate topic clusters that share concepts

### Step 3: Generate ideas

Produce ideas in these categories:

**Things to build:**

- Look for pain points, product ideas, or tools mentioned across notes
- Look for workflows described in notes that could be automated
- Combine concepts from different clusters into new product ideas

**Things to write:**

- Topics where you have 3+ notes but no synthesis/essay
- Contrarian takes implied by your notes
- Connections between domains that others might not see

**Things to explore:**

- Topics referenced but with no dedicated note
- Questions raised in notes but never answered
- Domains adjacent to your clusters that you haven't touched

**People to reach out to:**

- Names mentioned across notes
- People working in your active areas (based on research notes)
- Potential collaborators implied by overlapping interests

**Things to revisit:**

- Stalled projects worth restarting
- Old ideas that now have new context
- Notes that contradict each other (tension = opportunity)

### Step 4: Rank and present

For each idea, provide:

- **The idea** (1-2 sentences)
- **Evidence** — Which notes support it (as `[[wikilinks]]`)
- **Strength** — Strong / Medium / Emerging (based on how many notes support it)

Present as a structured report:

```markdown
# Idea Report

**Generated:** YYYY-MM-DD **Vault size:** N notes across M topics

## Build

1. **[Idea title]** — Brief description Evidence: [[note-1]], [[note-2]],
   [[note-3]] Strength: Strong

2. **[Idea title]** — Brief description Evidence: [[note-1]] Strength: Emerging

## Write

1. **[Essay/post idea]** — What angle to take Evidence: [[note-1]], [[note-2]]
   Strength: Medium

## Explore

1. **[Topic to investigate]** — Why it's interesting Evidence: [[note-1]]
   Strength: Emerging

## Revisit

1. **[Stalled project]** — Why now might be the time Last updated: YYYY-MM-DD
   Evidence: [[note-1]]
```

### Step 5: Offer next actions

After presenting the report, suggest:

- "Want me to create a note for any of these ideas?"
- "Want me to run `vault-research` on any of these?"
- "Want me to run `vault-connect` to explore a connection deeper?"

## Subagent Strategy

| Task              | Model                 | Why                              |
| ----------------- | --------------------- | -------------------------------- |
| File reading      | small model           | Simple extraction                |
| Tag/concept index | small model           | Straightforward aggregation      |
| Pattern detection | high-capability model | Needs nuanced cross-note reading |
| Idea generation   | high-capability model | Creative reasoning               |

## Constraints

- Ground every idea in actual notes — no pure speculation
- Cite specific notes as evidence
- Limit to ~5 ideas per category (quality over quantity)
- Don't repeat ideas already captured as notes with `status: active`
