---
name: vault-workflows
description:
  Operate an Obsidian-style vault with a raw-first pipeline, curated notes, and
  index/log maintenance.
---

# Vault Workflows

Use this skill to maintain a raw-first Obsidian vault.

## Supported workflows

- Initialize vault structure (`raw/*`, `daily/`, `_templates/`, `index.md`,
  `log.md`)
- Process `raw/inbox` captures into curated linked notes/projects
- Preserve provenance by storing canonical sources in `raw/sources`
- Archive processed originals into `raw/processed/YYYY-MM-DD/`
- Reorganize curated files without touching `raw/*`
- Append operation history to `log.md`

## Operating rules

- Default to non-destructive edits.
- Never delete user content unless explicitly requested.
- Treat `raw/sources/` as immutable evidence.
- Preserve existing note content and frontmatter keys when possible.
- For research additions, include sources and confidence.

## Frontmatter baseline

```yaml
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [topic, concept]
source: raw-inbox | url | manual | compacted
status: active | someday | done | archived
---
```

## Typical outputs

- Created/updated curated pages
- Stored source files under `raw/sources/`
- Archived originals under `raw/processed/YYYY-MM-DD/`
- `index.md` updates and appended `log.md` entry
