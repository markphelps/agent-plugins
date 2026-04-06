# Declaudify Standards Map

This mapping keeps behavior while removing Claude lock-in and aligns with Codex
plugin conventions.

## Instruction files

- Source: `CLAUDE.md`
- Target: `AGENTS.md`
- Rule: `AGENTS.md` becomes canonical; keep `CLAUDE.md` only as temporary legacy
  during migration.

## Commands

- Source: `.claude/commands/*` or plugin `commands/*.md`
- Target:
  - `.agents/commands/*` for neutral command docs
  - plugin `skills/<skill-name>/SKILL.md` stubs for Codex plugin compatibility
- Rule: for Codex plugins, prefer `skills/` + `SKILL.md` over command-only
  layouts.

## Hooks

- Source: `.claude/hooks/*`
- Target options:
  - `.githooks/*` + `git config core.hooksPath .githooks`
  - `.husky/*` (if Husky)
  - `lefthook.yml` + hook scripts (if Lefthook)
- Rule: attach automation to git/tool-native hook systems.

## Skills

- Source: `.claude/skills/<name>/...`
- Target: `skills/<name>/SKILL.md` or `.agents/skills/<name>/SKILL.md`
- Rule: each skill has a required `SKILL.md` with YAML frontmatter (`name`,
  `description`) and optional `scripts/`, `references/`, `assets/`.

## Plugin manifest migration

- Source: `*/.claude-plugin/plugin.json`
- Target: `*/.codex-plugin/plugin.json`
- Rule: preserve existing metadata and add `"skills": "./skills/"` when missing.

## Marketplace migration

- Source: `.claude-plugin/marketplace.json`
- Target: `.agents/plugins/marketplace.json`
- Rule: emit Codex marketplace schema:
  - `name`
  - `interface.displayName`
  - `plugins[].source = { source: "local", path: "..." }`
  - `plugins[].policy.installation`
  - `plugins[].policy.authentication`
  - `plugins[].category`

## Terminology normalization

Replace user-facing Claude-specific terms where safe:

- "Claude Code command" -> "agent command"
- "Claude hook" -> "git hook" or "automation hook"
- "Claude skill" -> "agent skill"

Avoid changing historical/changelog references unless requested.
