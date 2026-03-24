---
name: handoff
description:
  Use when the user is ending a session, clearing context, or wants to prepare a
  handoff for the next agent. Also use when switching between major tasks or
  branches.
---

# /handoff — Session Handoff

Generate a timestamped handoff document so the next agent session has full
context.

## When to Use

- User says "let's wrap up", "clear context", "handoff", "save context for next
  time"
- Switching to a different major task or branch
- Before a long break where context will be lost

## Process

### Step 1: Gather State

Collect the current state of the working directory:

```bash
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
REPO=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null || echo "unknown")
DATETIME=$(date +%Y%m%d-%H%M%S)

echo "BRANCH: $BRANCH"
echo "REPO: $REPO"

# Recent commits on this branch
git log --oneline -10

# Uncommitted changes
git status -s

# Diff summary from the default branch
DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
git diff "origin/$DEFAULT_BRANCH" --stat 2>/dev/null || true

# Open PRs (if gh is available)
gh pr list --state open --limit 5 2>/dev/null || true
```

### Step 2: Read Project Context

Read these files if they exist — they provide conventions and open work:

- `CLAUDE.md` — project conventions
- `DESIGN.md` — design system
- `TODOS.md` or `TODO.md` — open work items
- Plan files in `docs/plans/`, `plans/`, or `notes/plans/`

### Step 3: Ask the User

Use AskUserQuestion:

> "I'll create a handoff for the next session. Anything specific you want
> captured? Decisions made verbally, gotchas discovered, or priorities not in
> the code?"

Options:

- A) Just capture what we did — nothing extra
- B) Let me add some notes

### Step 4: Write the Handoff

Write to the project memory directory:

```
~/.claude/projects/{project-slug}/memory/handoff-{YYYYMMDD-HHMMSS}-{branch}.md
```

Where `{project-slug}` is derived from the project path (e.g.,
`-Users-dev-myproject`). Check the `~/.claude/projects/` directory to find the
correct slug for the current working directory.

Example filename: `handoff-20260322-183000-feat-phase-1-foundation.md`

Structure:

```markdown
---
name: handoff-{YYYYMMDD}-{branch}
description: Session handoff from {date} on {branch} — {one-line summary}
type: project
---

## Session Summary

[1-2 sentences: what was accomplished]

## Current State

- **Branch**: {branch name}
- **PR**: {PR URL or "none"}
- **Last commit**: {short SHA + message}
- **Uncommitted changes**: {yes/no + summary}

## What Was Built

[Bullet list of concrete deliverables — files, features, configs]

## Key Decisions

[Decisions not obvious from code — architectural choices, tradeoffs, abandoned
approaches]

## Gotchas

[Non-obvious setup, workarounds, things that tripped us up. Highest-value
section — saves the next session from hitting the same walls.]

## What's Next

[Prioritized list of what to build next. Reference plan docs where they exist.]

## Open Questions

[Unresolved items the next session should address]
```

### Step 5: Update Memory Index

Read `MEMORY.md` in the memory directory. Add the new handoff file to the index.
Mark the previous handoff entry as `(superseded)` but don't delete it — history
is useful.

```markdown
# Memory Index

- [handoff-20260322-183000-feat-phase-1.md](handoff-20260322-183000-feat-phase-1.md)
  — Latest: Phase 1 foundation complete, Phase 2 next
- [handoff-20260321-140000-docs-planning.md](handoff-20260321-140000-docs-planning.md)
  — (superseded) Planning docs and reviews
```

Keep the index under 200 lines. If it gets long, archive old superseded entries
by removing them from the index (the files stay on disk).

### Step 6: Confirm

Tell the user:

- The file path where the handoff was saved
- Key points captured (2-3 bullet summary)
- "The next session will find this in memory automatically."

## Important Rules

- **Timestamp every handoff.** Never overwrite previous handoffs. History has
  value.
- **Branch in the filename.** Makes it easy to find context for a specific
  feature.
- **Be specific, not narrative.** File paths, branch names, PR URLs — not "we
  worked on stuff."
- **Gotchas are the highest-value section.** Concrete details that save hours of
  rediscovery.
- **Reference docs, don't repeat them.** Link to plan files and design docs
  rather than copying.
- **Keep each handoff under 150 lines.** The next session scans it fast, not
  reads a novel.
- **Latest entry goes at the top of MEMORY.md.** Most recent = most relevant.
- **Auto-detect the default branch.** Don't assume `main` — check `origin/HEAD`
  first.
