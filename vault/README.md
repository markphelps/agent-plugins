# Vault Plugin

Raw-first vault workflows for Obsidian.

## What It Provides

- Raw capture pipeline (`raw/sources` inbox -> curated notes -> `raw/processed`
  archive)
- Source processing into linked notes
- Archive-aware curation with `archive/` for superseded notes and dead projects
- Concept-promotion workflow for recurring themes and durable synthesis
- Drift workflows that store durable outcomes in `notes/concepts/`
- Vault organization and compaction workflows
- Research-oriented note enrichment
- Index and operation-log maintenance helpers
- QMD-backed retrieval and publish-readiness helpers for hosted vaults
- End-of-session sync workflow for keeping project state current

## Skill Set

| Skill                     | What It Does                                                                                 | When to Invoke                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `vault-process`           | Turns `raw/sources/` captures into curated notes or project docs.                            | When new source material needs to be ingested.                       |
| `vault-organize`          | Reorganizes active curated files without touching raw evidence.                              | When notes/projects need cleanup, renaming, or grouping.             |
| `vault-compact`           | Compresses or consolidates verbose note content.                                             | When notes are too long or repetitive and need shrinking.            |
| `vault-cleanup`           | Audits `raw/processed/` integrity and optional safe hygiene fixes.                           | When checking archive health without deleting evidence.              |
| `vault-index`             | Refreshes `index.md` from durable active content.                                            | When navigation drifts or new durable pages appear.                  |
| `vault-log`               | Appends a structured entry to `log.md`.                                                      | After any material vault operation.                                  |
| `vault-session-sync`      | Syncs session outcomes into tracker/index/log from recent work context.                      | At the end of a coding or research session.                          |
| `vault-qmd`               | Uses `qmd` for retrieval, inspect, preflight, and index-update flows for hosted vaults.      | When searching, validating, or refreshing hosted-vault index health. |
| `vault-lint`              | Audits the active vault for contradictions, stale pages, weak linking, and missing concepts. | On regular hygiene passes or before larger cleanup sessions.         |
| `vault-ideas`             | Extracts promising ideas and patterns from notes.                                            | When looking for product, writing, or synthesis opportunities.       |
| `vault-connect`           | Finds and explains meaningful links between notes or themes.                                 | When strengthening the wiki graph or exploring relationships.        |
| `vault-drift`             | Detects recurring themes across unrelated notes and promotes them toward concepts.           | When scanning for emerging durable patterns.                         |
| `vault-challenge`         | Pressure-tests an idea, thesis, or concept.                                                  | When you want critique or stronger thinking around a topic.          |
| `vault-research`          | Produces research-oriented notes with sourcing and synthesis.                                | When capturing or structuring research output.                       |
| `vault-project-tracker`   | Maintains `projects/project-tracker.md` and manages lifecycle transitions.                   | When project state changes or tracker drift needs fixing.            |
| `vault-concept-promoter`  | Updates or creates canonical concept pages from repeated themes.                             | When recurring patterns should become durable synthesis.             |
| `vault-archive-audit`     | Identifies and optionally archives dead or superseded notes/projects.                        | When shrinking the active surface safely.                            |
| `vault-weekly-maintainer` | Orchestrates tracker audit, concept audit, archive audit, index refresh, and logging.        | For recurring weekly maintenance runs.                               |

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
  remaining only in reports.
- Keep user note content intact unless explicit deletion is requested.
