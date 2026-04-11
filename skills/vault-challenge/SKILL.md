---
name: vault-challenge
description:
  Pressure-test a topic by finding contradictions, weak assumptions, and blind
  spots across your vault notes.
---

# Challenge

Pressure-test your beliefs on a topic by analyzing your vault for
contradictions, weak assumptions, and blind spots. Acts as a critical thinking
partner.

## Arguments

`arguments` - The topic to challenge, plus optional flags.

**Topic:** Required. A topic, belief, or decision to pressure-test.

**Flags:**

- `--path PATH` - Vault path (default: current directory)

**Examples:**

```
vault-challenge "building in public is always good"
vault-challenge voice notes app
vault-challenge my approach to hiring
```

## Process

### Step 1: Gather your stated position

Search the vault for everything related to the topic:

1. Find all notes mentioning the topic (content, tags, filenames)
2. Extract your stated beliefs, assumptions, and conclusions
3. Note the dates — has your position changed over time?
4. Identify any decisions you've made based on these beliefs

Build a summary of "what you currently believe about [topic]" grounded entirely
in your notes.

### Step 2: Find internal contradictions

Search for conflicts within your own vault:

- **Direct contradictions** — Notes where you say opposite things about the same
  topic
- **Shifting positions** — Beliefs that changed without acknowledgment
- **Inconsistent actions** — Decisions that don't align with stated beliefs
- **Cherry-picking** — Notes that only consider evidence supporting one side

Present each contradiction with direct quotes from the conflicting notes.

### Step 3: Identify weak assumptions

For each key belief or assumption in your notes:

- Is it stated as fact or opinion?
- Is there evidence cited, or is it asserted without support?
- Is it based on a single data point or anecdote?
- Could it be survivorship bias, recency bias, or confirmation bias?
- Is there a time-dependency (was this true when written but maybe not now)?

### Step 4: Find blind spots

Look for what's **missing** from your thinking:

- **Perspectives not considered** — Whose viewpoint is absent?
- **Risks not addressed** — What could go wrong that you haven't mentioned?
- **Counter-evidence** — Use WebSearch to find arguments against your position
- **Failure cases** — Has this approach failed for others?

For the WebSearch step, search for:

- `"[topic]" criticism OR problems OR downsides`
- `"[topic]" failed OR mistake`
- Counter-arguments to your specific claims

### Step 5: Present the challenge

```markdown
# Challenge: [Topic]

**Challenged:** YYYY-MM-DD **Notes analyzed:** N

## Your Current Position

Based on your notes, you believe:

1. [Belief 1] — from [[note]]
2. [Belief 2] — from [[note]]
3. [Belief 3] — from [[note]]

## Contradictions Found

### [Contradiction Title]

In [[note-a]] (YYYY-MM-DD):

> "Quote supporting position X"

But in [[note-b]] (YYYY-MM-DD):

> "Quote supporting opposite position"

**What to resolve:** [1 sentence framing the tension]

## Weak Assumptions

1. **[Assumption]** — from [[note]] Weakness: [Why this might not hold]

2. **[Assumption]** — from [[note]] Weakness: [Why this might not hold]

## Blind Spots

1. **[Missing perspective]** — Your notes don't consider [X]
2. **[Unaddressed risk]** — What if [Y]?
3. **[Counter-evidence]** — [External source] argues [Z]

## Strongest Challenge

[The single most important thing to reconsider, in 2-3 sentences. This should be
the one that, if wrong, would change the most.]

## Questions to Sit With

- [Question that doesn't have an easy answer]
- [Question that might change your approach]
```

### Step 6: Offer next actions

- "Want me to create a note capturing these tensions?"
- "Want me to run `vault-research` to investigate [blind spot]?"
- "Want me to run `vault-trace` to see how your position evolved?"

## Subagent Strategy

| Task                  | Model                 | Why                              |
| --------------------- | --------------------- | -------------------------------- |
| Note searching        | small model           | Simple content search            |
| Position extraction   | high-capability model | Needs accurate belief extraction |
| Contradiction finding | high-capability model | Nuanced comparison               |
| Counter-research      | small model           | Web searches for opposing views  |
| Synthesis             | high-capability model | Critical, balanced analysis      |

## Constraints

- Be genuinely challenging, not softly agreeable
- Always ground challenges in evidence (from vault or web)
- Quote directly from notes — don't put words in the user's mouth
- Present tensions neutrally — don't declare which side is "right"
- If the position seems well-considered with few gaps, say so honestly
- Don't be nihilistic — the goal is to strengthen thinking, not undermine it
