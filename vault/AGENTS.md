# AGENTS.md

This plugin contains vault-focused skills for the Karpathy Wiki + Idea Lifecycle workflow.

## Structure

- `.codex-plugin/plugin.json`: plugin manifest
- `skills/*/SKILL.md`: vault workflows and task-specific skills

## Core Skills (4)

| Skill | Purpose | Replaces |
|-------|---------|----------|
| `vault-ingest` | Process `raw/sources/` → curated notes/projects | vault-process + vault-cleanup |
| `vault-lint` | Hygiene: orphans, stale, contradictions, weak links | vault-lint (tightened) |
| `vault-tracker` | Project lifecycle + tracker maintenance | vault-project-tracker + vault-archive-audit + vault-organize |
| `vault-maintain` | Weekly orchestrator running all checks | vault-weekly-maintainer + vault-index + vault-log + vault-qmd |

## Optional Skills (2)

| Skill | Purpose | Replaces |
|-------|---------|----------|
| `vault-concepts` | Promote themes → canonical concept pages | vault-concept-promoter + vault-drift |
| `vault-research` | External research → append to note | vault-research (unchanged) |

## Removed Skills

The following 12 skills are deprecated and removed:

- vault-archive-audit → merged into vault-tracker
- vault-challenge → workflow now explicit
- vault-cleanup → merged into vault-ingest
- vault-compact → manual workflow
- vault-concept-promoter → renamed vault-concepts
- vault-connect → manual cross-linking
- vault-drift → merged into vault-concepts
- vault-ideas → explicit ideas/ directory
- vault-index → merged into vault-maintain
- vault-log → merged into vault-maintain
- vault-process → merged into vault-ingest
- vault-project-tracker → merged into vault-tracker
- vault-qmd → merged into vault-maintain
- vault-session-sync → manual tracker workflow
- vault-organize → merged into vault-tracker
- vault-weekly-maintainer → merged into vault-maintain

## Usage Patterns

**Daily ingest:**
```
vault-ingest --mode report    # see pending
vault-ingest --mode apply     # process and archive
```

**Weekly maintenance:**
```
vault-maintain --mode report  # full audit
vault-maintain --mode apply   # apply safe fixes
```

**Project transitions:**
```
vault-tracker --project stay --mode report   # see status
vault-tracker --project stay shipped         # ship project
```

**Concept work (when needed):**
```
vault-concepts --mode report  # see theme candidates
vault-concepts --mode apply   # create/update concepts
```

## Conventions

- **Mode convention:** `--mode report|apply-safe|apply` (default `report`)
- **Safety first:** All skills are non-destructive by default
- **Manual lifecycle:** Explicit directory structure replaces automation
- **Raw protection:** Never delete from `raw/sources/` or `raw/processed/`
