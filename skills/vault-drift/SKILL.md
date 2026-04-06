---
name: vault-drift
description: Surface recurring themes and unconscious patterns across your vault
---

# Drift

Surface ideas, themes, and phrases that keep appearing across unrelated notes
without a clear thread. Reveals what your thinking is gravitating toward — even
if you haven't noticed it yet.

## Arguments

`arguments` - Optional path and flags.

**Flags:**

- `--path PATH` - Vault path (default: current directory)
- `--since DAYS` - Only look at notes updated in the last N days (default: all)

**Examples:**

```
vault-drift                    # Scan entire vault
vault-drift --since 30         # Only recent notes
vault-drift --path ./notes     # Specific folder
```

## Process

### Step 1: Load the vault

Scan all `.md` files (skip hidden folders, `inbox/`, `_processed/`, `._meta/`).

For large vaults (20+ files), use small model subagents to parallelize reading.

For each file, extract:

- Full text content (below frontmatter)
- Tags
- Wikilinks
- Updated/created dates

### Step 2: Extract recurring signals

Look for patterns that appear across **unrelated** notes (different folders,
different tags, different time periods):

**Recurring phrases:**

- Exact or near-exact phrases used in 3+ notes
- Distinctive word combinations (not common filler)
- Metaphors or analogies reused across contexts

**Recurring concepts:**

- Abstract ideas that surface in different domains
- Problems described in similar terms across different notes
- Values or principles stated in different contexts

**Recurring questions:**

- Questions asked (explicitly or implicitly) in multiple notes
- Unresolved tensions that keep appearing

**Recurring references:**

- People, books, tools, or frameworks cited across unrelated notes
- External sources that keep showing up

### Step 3: Filter for genuine drift

Not everything recurring is interesting. Filter out:

- Tags you deliberately applied (those are conscious, not drift)
- Common words and phrases ("I think", "need to", etc.)
- Project-specific repetition (same concept in same project is expected)

Keep only signals that cross domain boundaries — themes that appear in notes
about different topics, from different time periods.

### Step 4: Cluster the drifts

Group related signals into drift clusters. Each cluster is an emerging theme you
may not have named yet.

For each cluster:

- Give it a tentative name (what would this note be called?)
- List the evidence (notes where it appears)
- Note the time span (how long has this been drifting?)
- Assess momentum (appearing more or less recently?)

### Step 5: Present findings

```markdown
# Drift Report

**Scanned:** YYYY-MM-DD **Notes analyzed:** N **Drifts detected:** M

## Active Drifts

### 1. [Tentative Theme Name]

**Momentum:** Accelerating | Steady | Fading **First seen:** ~YYYY-MM-DD
**Latest:** YYYY-MM-DD **Appearances:** N notes

You keep returning to this idea:

> "Quote from note 1" — [[note-1]] "Quote from note 2" — [[note-2]] "Quote from
> note 3" — [[note-3]]

**What this might mean:** [1-2 sentence interpretation]

---

### 2. [Tentative Theme Name]

[Same structure]

---

## Unresolved Questions

Questions that keep surfacing across your notes:

1. "[Question]" — appears in [[note-1]], [[note-2]]
2. "[Question]" — appears in [[note-3]], [[note-4]]

## Observations

- [Meta-pattern about the drifts themselves]
- [What these drifts suggest about where your thinking is heading]
```

### Step 6: Offer next actions

- "Want me to create a dedicated note for [drift theme]?"
- "Want me to run `vault-trace` on [strongest drift]?"
- "Want me to run `vault-ideas` to generate ideas from these patterns?"

## Subagent Strategy

| Task                | Model                 | Why                           |
| ------------------- | --------------------- | ----------------------------- |
| File reading        | small model           | Simple extraction             |
| Phrase extraction   | small model           | Text processing               |
| Cross-note analysis | high-capability model | Nuanced pattern detection     |
| Interpretation      | high-capability model | Creative/reflective reasoning |

## Constraints

- Only surface patterns that cross domain boundaries
- Quote directly from notes — don't fabricate patterns
- Minimum 3 notes to qualify as a drift (2 could be coincidence)
- Limit to ~5 drifts (focus on strongest signals)
- Be honest when the vault is too small or uniform to detect drift
- Don't psychoanalyze — present patterns, let the user interpret
