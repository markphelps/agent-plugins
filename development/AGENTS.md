# AGENTS.md

This plugin contains development workflow skills.

## Structure

- `.codex-plugin/plugin.json`: plugin manifest
- `skills/*/SKILL.md`: development workflow skills

## Source Of Truth

- `development/skills/` is the source of truth for this plugin.
- Repository-wide mirrored `skills/` copies are synced via `npm run sync`.
- Do not manually duplicate edits into top-level `skills/` unless sync tooling is unavailable.

## Current Skill Surface

- `handoff`: create end-of-session handoff docs
- `ship-pr`: branch, smart commit scope, push, and PR creation
- `declaudify`: migrate Claude-specific repo artifacts to neutral standards

## Workflow Policy

- Prefer narrow, reviewable commits over large mixed commits.
- `ship-pr` must ask whether the PR should be draft before opening.
- Avoid destructive git/history operations unless explicitly requested.
