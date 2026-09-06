# AGENTS.md

This repository contains multiple plugins. Use progressive disclosure.

## Plugin-Specific Instructions

- Vault plugin: see `vault/AGENTS.md`
- Development plugin: see `development/AGENTS.md`

## Skill Sync

- Skill copies are synced via `npm run sync`.
- Edit plugin-local skill sources first (for example `vault/skills/*/SKILL.md`).
- Do not manually duplicate edits into top-level `skills/` unless sync tooling is unavailable.

## Toolchain

- `mise.toml` pins the tool versions. CI resolves them with `jdx/mise-action`.
- Run `mise install` before `npm install` in a fresh checkout.
- Do not pin a Node version in a workflow file. Change `mise.toml` instead.
- CI runs `npm run format:check`, `npm run validate`, and `actionlint`. Run
  them locally before you push a change to workflows or plugin manifests.
