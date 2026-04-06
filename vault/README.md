# Vault Plugin

Raw-first vault workflows for Obsidian.

## What It Provides

- Raw capture pipeline
  (`raw/inbox -> raw/sources -> curated notes -> raw/processed`)
- Inbox processing into linked notes
- Vault organization and compaction workflows
- Daily review workflows
- Research-oriented note enrichment
- Index and operation-log maintenance helpers

## Skill Set

- `vault-init`
- `vault-process`
- `vault-organize`
- `vault-compact`
- `vault-cleanup`
- `vault-index`
- `vault-log`
- `vault-lint`
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
- `raw/sources/` is immutable evidence; curated interpretation belongs in notes.
- Keep user note content intact unless explicit deletion is requested.
