# AGENTS.md

This repository contains multiple plugins. Use progressive disclosure.

## Plugin-Specific Instructions

- Vault plugin: see `vault/AGENTS.md`
- Development plugin: see `development/AGENTS.md` (if present)

## Skill Sync

- Skill copies are synced via `npm run sync`.
- Edit plugin-local skill sources first (for example `vault/skills/*/SKILL.md`).
- Do not manually duplicate edits into top-level `skills/` unless sync tooling is unavailable.
