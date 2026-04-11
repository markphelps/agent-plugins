---
name: vault-research
description: Research a note - find competitors, discussions, and market signals
---

# Research

Conduct automated research on a note, gathering competitor information, relevant
discussions, and market signals. Append findings to the note.

## Arguments

`arguments` - The note to research.

**Target:** Can be:

- A note filename (e.g., `voice-notes-app` or `voice-notes-app.md`)
- A relative path (e.g., `notes/voice-notes-app.md`)
- An absolute path

**Examples:**

```
vault-research voice-notes-app
vault-research notes/car-search/prd.md
vault-research ./my-notes/cool-project.md
```

## Subagent Strategy

Research uses subagents to parallelize searches:

| Task                     | Model                 | Why                          |
| ------------------------ | --------------------- | ---------------------------- |
| Competitor search        | small model           | Simple web searches, fast    |
| Discussion skimming      | small model           | Reading Reddit/HN threads    |
| Deep competitor analysis | high-capability model | Nuanced positioning analysis |
| Market synthesis         | high-capability model | Combining multiple sources   |

**Parallel execution:** Launch competitor, discussion, and market searches
simultaneously as background tasks, then synthesize results.

## Process

### Step 1: Load the note

Read the specified note. Extract:

- The core topic/problem
- Target audience (if mentioned)
- Any existing research
- Current tags

If the note is too vague, ask for clarification before proceeding.

### Step 2: Launch parallel research

Launch 3 subagents in parallel:

```
Task(
  subagent_type: "search-specialist",
  prompt: "Find competitors for [topic]...",
  parallel: true
)

Task(
  subagent_type: "search-specialist",
  prompt: "Find Reddit/HN/forum discussions about [topic]...",
  parallel: true
)

Task(
  subagent_type: "search-specialist",
  prompt: "Find market size, funding news, trends for [topic]...",
  parallel: true
)
```

Wait for all to complete using TaskOutput.

### Step 3: Competitor research

Search for:

- Direct competitors (products solving the same problem)
- Adjacent products (related solutions)
- Failed attempts (products that tried and shut down)

Search queries:

- `"[core topic] app"` or `"[core topic] software"`
- `"[core topic] startup"`
- `"best [solution type] tools 2025"`
- Product Hunt search for the category

For each competitor found:

- Name and URL
- Brief description
- Pricing (if visible)
- Key differentiators

### Step 4: Discussion research

Search for community discussions:

- `site:reddit.com "[topic]"`
- `site:news.ycombinator.com "[topic]"`
- `"[topic]" forum OR discussion`

Look for:

- Pain points people express
- Solutions they've tried
- What's missing from current options
- Willingness to pay signals

Use WebFetch to read 2-3 most relevant discussions.

### Step 5: Market signals

Search for:

- `"[topic]" market size`
- `"[competitor]" funding OR acquired`
- Recent news in the space

Note:

- Growing/shrinking market
- Recent funding
- Acquisitions
- Regulatory changes

### Step 6: Synthesize findings

Create a research summary:

```markdown
## Research

**Researched:** YYYY-MM-DD

### Competitors

| Name         | URL | Pricing | Notes       |
| ------------ | --- | ------- | ----------- |
| Competitor 1 | url | $X/mo   | Brief notes |
| Competitor 2 | url | Free    | Brief notes |

### Discussion Insights

- Insight 1 (source: Reddit thread)
- Insight 2 (source: HN discussion)
- Pain point people express
- What's missing from current solutions

### Market Signals

- Signal 1
- Signal 2

### Assessment

Brief assessment:

- Is the problem real?
- How crowded is the market?
- Potential differentiation?
- Red flags?

### Next Steps

- [ ] Action 1
- [ ] Action 2
```

### Step 7: Update the note

Append the research summary to the note.

Update frontmatter:

```yaml
updated: YYYY-MM-DD
```

If the note is a project/idea, optionally add:

```yaml
status: active
```

### Step 8: Report completion

```
Research complete for "voice-notes-app"

Found:
- 5 competitors (2 direct, 3 adjacent)
- 3 relevant Reddit discussions
- 1 HN thread with 200+ comments

Key insight: Users frustrated with transcription accuracy.
Gap identified: No solution focuses on [specific niche].

Research appended to voice-notes-app.md
```

## Research Depth

Focus on breadth over depth:

- Find competitors (don't deep-dive each)
- Skim discussions for patterns
- Note market signals
- Keep it actionable

Target: 5-10 minutes per note, not hours.

## Error Handling

If searches return poor results:

- Note which searches didn't yield useful info
- Suggest alternative search terms
- Ask if user wants to refine the note

If the note is too vague:

- Ask clarifying questions before proceeding
- Don't waste searches on ambiguous queries
