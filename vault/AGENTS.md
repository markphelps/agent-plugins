# AGENTS.md

This plugin contains vault-focused skills for the Karpathy Wiki + Idea Lifecycle workflow.

## Structure

- `.codex-plugin/plugin.json`: plugin manifest
- `skills/*/SKILL.md`: vault workflows and task-specific skills

## Core Skills (4)

| Skill            | Purpose                                                |
| ---------------- | ------------------------------------------------------ |
| `vault-ingest`   | Categorize `raw/sources/` → correct vault locations    |
| `vault-lint`     | Hygiene: orphans, stale, contradictions, weak links    |
| `vault-tracker`  | Project lifecycle + tracker maintenance                |
| `vault-maintain` | Weekly orchestrator running all checks                 |

## Optional Skills (3)

| Skill               | Purpose                                                  |
| ------------------- | -------------------------------------------------------- |
| `vault-concepts`    | Promote themes → canonical concept pages                 |
| `vault-research`    | External research → source records and optional synthesis |
| `vault-x-bookmarks` | Capture and prune X bookmark source records              |

## Usage Patterns

**Daily ingest:**
```
vault-ingest --mode report    # see pending
vault-ingest --mode apply     # categorize and move sources
```

**X bookmark capture:**
```bash
vault-x-bookmarks --limit 15
vault-x-bookmarks --limit 75 --max-pages 25 --head-pages 2
vault-ingest --mode report
```

**X bookmark prune:**
```
vault-x-bookmarks prune --mode report  # LLM-judge bookmark source value
vault-x-bookmarks prune --mode apply   # delete only clearly low-value records
```

**Weekly maintenance:**
```
vault-maintain --mode report  # full audit
vault-maintain --mode apply-safe  # apply safe fixes
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

- **Mode convention:** Mode-based skills use
  `--mode report|apply-safe|apply` (default `report`).
- **Capture exception:** `vault-x-bookmarks` capture mode has no report mode; it
  only runs when explicitly invoked and captures bounded bookmark slices into
  `raw/sources/`.
- **Safety first:** Mode-based skills are non-destructive by default.
- **Manual lifecycle:** Explicit directory structure replaces automation
- **Raw protection:** Never delete from `raw/sources/` or `raw/processed/`,
  except `vault-x-bookmarks` prune apply mode may delete clearly low-value
  `raw/sources/*x-bookmark*.md` files while preserving all
  `raw/state/x-bookmarks/` entries so they are not refetched.
- **README maintenance:** Keep `vault/README.md` current for every vault plugin
  change, including prose and the Mermaid diagram; never keep references to
  deprecated skills or workflows.
