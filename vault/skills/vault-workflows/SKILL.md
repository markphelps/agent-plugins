---
name: vault-workflows
description:
  Operate an Obsidian-style vault by initializing structure, processing inbox
  content into linked notes, organizing files, and appending sourced research.
---

# Vault Workflows

Use this skill to help users maintain a Zettelkasten-style Obsidian vault.

## Supported workflows

- Initialize vault structure (`inbox/`, `daily/`, `_templates/`,
  `._meta/plans/`)
- Process inbox content into notes with links and related sections
- Reorganize naming/frontmatter conventions
- Research a topic and append findings with sources

## Operating rules

- Default to non-destructive edits.
- Never delete user content unless explicitly requested.
- Preserve existing note content and frontmatter keys.
- When uncertain about taxonomy, prefer minimal safe edits and explain choices.
- For research, include sources and a confidence level.

## Frontmatter baseline

```yaml
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [topic, concept]
source: inbox | url | manual | compacted
status: active | someday | done | archived
---
```

## Typical outputs

- A clear list of created/updated files
- A summary of linking decisions
- Next recommended vault action (for example: process -> organize -> review)
