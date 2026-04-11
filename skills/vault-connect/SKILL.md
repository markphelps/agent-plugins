---
name: vault-connect
description: Find unexpected connections between two topics in your vault
---

# Connect

Find bridges between two topics in your vault. Discovers unexpected connections,
shared concepts, and linking paths between domains that seem unrelated.

## Arguments

`arguments` - Two topics to connect, plus optional flags.

**Format:** `topic A` and `topic B` separated by `+`, `and`, or `&`.

**Flags:**

- `--path PATH` - Vault path (default: current directory)
- `--depth N` - Link depth to explore (default: 2, max: 3)

**Examples:**

```
vault-connect filmmaking + AI agents
vault-connect "personal finance" and "habit tracking"
vault-connect cooking & machine learning --depth 3
```

## Process

### Step 1: Map both topics

For each topic (A and B):

1. Find all notes that directly mention the topic (filename, content, tags)
2. Find all notes linked from those notes (1 hop)
3. If `--depth 3`, find notes linked from the second set (2 hops)
4. Extract key concepts, tags, and themes from each set

Build two concept clouds — one for each topic.

### Step 2: Find intersection

Look for connections between the two clouds:

**Direct connections:**

- Notes that mention both topics
- Notes linked to by both topic clusters

**Concept bridges:**

- Tags shared between the two clusters
- Key phrases or concepts that appear in both
- Notes that sit between the two clusters in the link graph

**Thematic bridges:**

- Abstract patterns shared by both domains (e.g., both involve "iteration" or
  "feedback loops")
- Similar problems described in different contexts
- Analogies that map from one domain to the other

### Step 3: Rank connections

For each connection found, assess:

- **Strength** — How many signals support it (shared tags, shared links, shared
  concepts)
- **Surprise** — How unexpected is this connection (same-domain = low,
  cross-domain = high)
- **Usefulness** — Could this lead to an insight or action

Rank by a combination of surprise and usefulness — the best connections are ones
that are unexpected AND actionable.

### Step 4: Present findings

```markdown
# Connections: [Topic A] ↔ [Topic B]

**Explored:** YYYY-MM-DD **Notes scanned:** N **Connections found:** M

## Bridge Notes

Notes that connect both topics:

1. **[[bridge-note]]** — How it connects A and B Mentions A: "relevant quote"
   Mentions B: "relevant quote"

## Shared Concepts

Themes that appear in both topic clusters:

- **[Concept]** — In A: [how it shows up]. In B: [how it shows up]
- **[Concept]** — In A: [context]. In B: [context]

## Surprising Links

Unexpected connections worth exploring:

1. **[Connection title]** — Brief explanation Path: [[note-a]] → [[bridge]] →
   [[note-b]] Why it matters: [1 sentence]

2. **[Connection title]** — Brief explanation Evidence: [[note-1]], [[note-2]]
   Why it matters: [1 sentence]

## Possible Syntheses

Ideas that emerge from combining these domains:

- [Idea 1] — How A and B inform each other
- [Idea 2] — A concept from A applied to B (or vice versa)
```

### Step 5: Offer next actions

- "Want me to create a note exploring [strongest connection]?"
- "Want me to run `vault-ideas` focused on this intersection?"
- "Want me to run `vault-trace` on [shared concept]?"

## Subagent Strategy

| Task                 | Model                 | Why                            |
| -------------------- | --------------------- | ------------------------------ |
| Topic search         | small model           | Simple file/content search     |
| Concept extraction   | small model           | Pull themes from notes         |
| Intersection finding | high-capability model | Nuanced cross-domain reasoning |
| Synthesis            | high-capability model | Creative connection-making     |

## Constraints

- Don't force connections that aren't there — if the topics don't connect, say
  so
- Always cite specific notes as evidence
- Limit to top 5 connections (quality over quantity)
- Distinguish between obvious connections and genuine surprises
- If one topic has no notes in the vault, say so and suggest creating a seed
  note
