---
name: vault-review
description:
  Run a daily morning/evening review workflow and maintain structured daily
  notes.
---

# Review

Daily review workflow. Morning mode builds a plan from your vault context.
Evening mode captures what happened, what you learned, and what carries forward.
Creates or updates daily notes using a consistent template.

## Arguments

`arguments` - Mode and optional flags.

**Mode:**

- `morning` or `am` — Morning planning
- `evening` or `pm` — Evening reflection
- (no mode) — Auto-detect based on time of day (before 2pm = morning)

**Flags:**

- `--path PATH` - Vault path (default: current directory)
- `--date YYYY-MM-DD` - Override date (default: today)
- `--folder NAME` - Daily notes folder name (default: `daily/`)

**Examples:**

```
vault-review                       # Auto-detect mode
vault-review morning               # Morning planning
vault-review pm                    # Evening reflection
vault-review morning --folder journal/
```

## Daily Note Template

If today's daily note doesn't exist, create it:

**Path:** `{folder}/YYYY-MM-DD.md`

```markdown
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [daily]
---

# YYYY-MM-DD

## Plan

-

## Log

-

## Ideas

-

## Carry Forward

-
```

If the daily note already exists, work with what's there.

## Morning Mode

### Step 1: Gather context

Read from the vault to understand current state:

1. **Yesterday's daily note** — Check for carry-forward items
2. **Active projects** — Find notes with `status: active`, sorted by `updated`
3. **Recent notes** — Notes updated in the last 3 days
4. **Inbox status** — How many items are in `raw/inbox/`?

### Step 2: Build the plan

Present a suggested plan:

```markdown
## Morning Review — YYYY-MM-DD

**Carry forward from yesterday:**

- [ ] Item from yesterday's carry-forward section

**Active projects:**

- [[project-a]] — Last updated X days ago
- [[project-b]] — Last updated Y days ago

**Raw Inbox:** N items waiting to be processed

**Suggested focus:** Based on your recent activity, consider:

1. [Suggested priority 1] — Why
2. [Suggested priority 2] — Why
3. [Suggested priority 3] — Why
```

### Step 3: Update daily note

Ask the user if they want to update the daily note's `## Plan` section with the
suggested items, or let them edit it themselves.

## Evening Mode

### Step 1: Review the day

Read today's daily note and recent vault activity:

1. **Today's plan** — What was planned?
2. **Files modified today** — What notes were created or updated?
3. **Raw inbox additions** — Anything captured today?

### Step 2: Prompt reflection

Ask focused questions:

- "What did you make progress on today?"
- "Anything you want to capture before it fades?"
- "Anything unfinished that should carry forward?"

Or, if the user just wants an automated summary, generate one from vault
activity.

### Step 3: Update daily note

Update the daily note with:

**`## Log` section** — Summary of what happened:

```markdown
## Log

- Worked on [[project-a]] — updated research section
- Created [[new-note]] from inbox processing
- Added 3 items to raw/inbox
```

**`## Ideas` section** — Any new thoughts captured during review:

```markdown
## Ideas

- Interesting connection between [[note-a]] and [[note-b]]
- Should research [new topic] further
```

**`## Carry Forward` section** — Unfinished items:

```markdown
## Carry Forward

- [ ] Finish research on [[project-b]]
- [ ] Process raw inbox (5 items waiting)
```

Update the `updated` field in frontmatter.

### Step 4: Report

```
Evening review complete for YYYY-MM-DD

Updated:
  - daily/YYYY-MM-DD.md

Activity today:
  - 3 notes modified
  - 1 note created
  - 2 items added to carry forward

Tomorrow's starting point saved.
```

## Setting Up Daily Notes in Obsidian

If the user asks about Obsidian integration, suggest this setup:

1. **Enable the Daily Notes core plugin** in Obsidian Settings → Core Plugins
2. **Set the template:**
   - Create `_templates/daily.md` with the template from above
   - In Daily Notes settings, set "Template file location" to `_templates/daily`
3. **Set the folder:**
   - In Daily Notes settings, set "New file location" to `daily`
4. **Date format:** `YYYY-MM-DD` (default)

This way, pressing the Daily Notes button in Obsidian creates the same format
that `vault-review` expects.

## Init Support

When running `vault-init`, create the daily notes template:

**`_templates/daily.md`:**

```markdown
---
created: { { date } }
updated: { { date } }
tags: [daily]
---

# {{date}}

## Plan

-

## Log

-

## Ideas

-

## Carry Forward

-
```

The `{{date}}` placeholders are replaced by Obsidian's Templater or core
Templates plugin.

## Subagent Strategy

| Task                 | Model                 | Why                        |
| -------------------- | --------------------- | -------------------------- |
| File reading         | small model           | Simple extraction          |
| Activity scanning    | small model           | Find modified files        |
| Plan generation      | high-capability model | Needs prioritization logic |
| Reflection synthesis | high-capability model | Nuanced summarization      |

## Constraints

- Don't overwrite user-written content in the daily note
- Append to sections, don't replace them
- Keep the plan to 3-5 items max (focused, not overwhelming)
- If no vault activity to summarize, say so — don't fabricate
- Morning mode should take <2 minutes
- Evening mode should take <3 minutes
