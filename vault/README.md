# Vault Plugin

Raw-first vault workflows for Obsidian.

## What It Provides

- Raw capture pipeline (`raw/sources` inbox -> curated notes -> `raw/processed`
  archive)
- Source processing into linked notes
- Archive-aware curation with `archive/` for superseded notes and dead projects
- Concept-promotion workflow for recurring themes and durable synthesis
- Vault organization and compaction workflows
- Daily review workflows
- Unified synthesis workflows (ideas, drift, trace, connect, challenge,
  research)
- Unified maintenance orchestration (session + weekly)
- Index and operation-log maintenance helpers

## Skill Set

| Skill                    | What It Does                                                                                 | When to Invoke                                               |
| ------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `vault-init`             | Creates the base raw-first vault structure.                                                  | When bootstrapping a new vault.                              |
| `vault-process`          | Turns `raw/sources/` captures into curated notes or project docs.                            | When new source material needs to be ingested.               |
| `vault-organize`         | Reorganizes active curated files without touching raw evidence.                              | When notes/projects need cleanup, renaming, or grouping.     |
| `vault-compact`          | Compresses or consolidates verbose note content.                                             | When notes are too long or repetitive and need shrinking.    |
| `vault-cleanup`          | Audits `raw/processed/` integrity and optional safe hygiene fixes.                           | When checking archive health without deleting evidence.      |
| `vault-index`            | Refreshes `index.md` from durable active content.                                            | When navigation drifts or new durable pages appear.          |
| `vault-log`              | Appends a structured entry to `log.md`.                                                      | After any material vault operation.                          |
| `vault-lint`             | Audits the active vault for contradictions, stale pages, weak linking, and missing concepts. | On regular hygiene passes or before larger cleanup sessions. |
| `vault-review`           | Reviews recent activity and current state of the vault.                                      | During regular review or session startup.                    |
| `vault-project-tracker`  | Maintains `projects/project-tracker.md` and manages lifecycle transitions.                   | When project state changes or tracker drift needs fixing.    |
| `vault-concept-promoter` | Updates or creates canonical concept pages from repeated themes.                             | When recurring patterns should become durable synthesis.     |
| `vault-archive-audit`    | Identifies and optionally archives dead or superseded notes/projects.                        | When shrinking the active surface safely.                    |
| `vault-synthesis`        | Unified analysis for ideas, drift, trace, connect, challenge, and research.                  | When extracting insight or running topic analysis.           |
| `vault-maintenance`      | Unified orchestration for session-end and weekly vault maintenance loops.                    | At session end or on recurring hygiene runs.                 |

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
- `raw/sources/` is an unprocessed inbox for new captures.
- `raw/processed/` is the canonical immutable archive for processed sources.
- `archive/` is for archived curated material and is excluded from active
  navigation by default.
- Repeated patterns should graduate into canonical concept pages instead of
  remaining only in one-off reports.
- Keep user note content intact unless explicit deletion is requested.
- Standard flag contract: `--mode report|apply-safe|apply` for operation level;
  use `--kind` for domain variants (for example review or synthesis kinds).
