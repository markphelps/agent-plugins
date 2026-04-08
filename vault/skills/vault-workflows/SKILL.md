---
name: vault-workflows
description:
  Operate an Obsidian-style vault with a raw-first pipeline, curated notes, and
  index/log maintenance.
---

# Vault Workflows

Use this skill to maintain a raw-first Obsidian vault.

This is the top-level orientation skill for the vault. Load it first when an
agent needs the overall operating model, structural rules, or the relationship
between vault skills.

For concrete actions, prefer the narrower specialized skills instead of doing
everything through this one.

Examples:

- use `vault-process` for ingest
- use `vault-project-tracker` for lifecycle state changes
- use `vault-concept-promoter` for canonical synthesis updates
- use `vault-archive-audit` for shrinking the active surface
- use `vault-index` and `vault-log` for navigation/history maintenance

## Supported workflows

- Initialize vault structure (`raw/*`, `notes/`, `projects/`, `archive/`,
  `resources/`, `index.md`, `log.md`)
- Process `raw/sources/` captures into curated linked notes/projects
- Preserve provenance by moving processed captures into
  `raw/processed/YYYY-MM-DD/`
- Treat `raw/processed/` as canonical immutable source evidence
- Reorganize curated files without touching `raw/*`
- Move superseded curated pages into `archive/` while keeping wikilinks intact
- Promote recurring patterns into canonical concept pages under
  `notes/concepts/`
- Append operation history to `log.md`

## Operating rules

- Default to non-destructive edits.
- Never delete user content unless explicitly requested.
- Treat `raw/sources/` as an unprocessed capture inbox.
- Treat `raw/processed/` as immutable evidence.
- Preserve existing note content and frontmatter keys when possible.
- For research additions, include sources and confidence.
- Prefer durable synthesis over one-off digests when a topic repeats.
- Keep `archive/` out of the active wiki surface except through
  `archive/index.md`.
- Treat drift reports and traces as intermediate synthesis artifacts; concept
  pages should become the durable endpoints.

## Frontmatter baseline

```yaml
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [topic, concept]
source: raw-sources | url | manual | compacted
status: active | someday | done | archived
---
```

## Typical outputs

- Created/updated curated pages
- Created/updated concept pages under `notes/concepts/`
- Processed source files moved from `raw/sources/` to
  `raw/processed/YYYY-MM-DD/`
- Archived curated pages under `archive/`
- `index.md` updates and appended `log.md` entry
