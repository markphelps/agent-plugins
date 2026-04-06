---
name: handoff
description:
  Generate a timestamped handoff document so the next session has complete
  project context.
---

# Handoff

Create a concise handoff document for the next agent session.

## When to Use

- User is ending a session
- User asks to save context
- Switching to a different major task or branch

## Process

1. Gather current repo state:

- active branch
- recent commits
- working tree status
- diff summary against default branch

2. Read project context files when present:

- `AGENTS.md`
- `README.md`
- `DESIGN.md`
- `TODO.md` or `TODOS.md`
- active plan docs

3. Write a timestamped handoff document with:

- session summary
- current state
- what changed
- key decisions
- gotchas
- prioritized next steps
- open questions

4. Keep it short and concrete.

## Rules

- Never overwrite older handoff files.
- Prefer explicit file paths and branch names.
- Capture gotchas that save future debugging time.
