# Vault Plugin

Zettelkasten-style vault workflows for Obsidian.

## What It Provides

- Inbox processing into linked notes
- Vault organization and compaction workflows
- Daily review workflows
- Research-oriented note enrichment

## Skill Set

- `vault-init`
- `vault-process`
- `vault-organize`
- `vault-compact`
- `vault-cleanup`
- `vault-ideas`
- `vault-trace`
- `vault-connect`
- `vault-drift`
- `vault-challenge`
- `vault-review`
- `vault-research`
- `vault-workflows`

## Subagents

- `vault_researcher` in `.codex/agents/vault-researcher.toml` for deep research
  delegation

## Structure

- `.codex-plugin/plugin.json`
- `skills/*/SKILL.md`
- `.codex/agents/*.toml`
- `AGENTS.md`

## Notes

- Skills are the runtime source of truth.
- Workflows should be non-destructive by default.
- Keep user note content intact unless explicit deletion is requested.
