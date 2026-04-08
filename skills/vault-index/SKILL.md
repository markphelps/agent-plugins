---
name: vault-index
description: Build or refresh index.md from curated vault content
---

# Refresh Index

Update `index.md` so it remains the top-level navigation page.

## Process

1. Scan active curated areas (`notes/`, `projects/`, `resources/`).
2. Prefer a dedicated concepts section sourced from durable pages such as
   `notes/concepts/`.
3. Keep sections concise and durable (avoid ephemeral entries).
4. Add new durable pages and remove dead links.
5. Preserve hand-written context where present.
6. Report exactly what changed.

## Safety

- Only edit `index.md` unless explicitly requested otherwise.
- Do not index raw evidence files from `raw/sources/` or `raw/processed/`
  directly as topic pages.
- Prefer durable concept pages, trackers, and active project pages over
  transient notes.
- Keep archived material out of the main index except for a single
  `archive/index.md` entry.
- If concept pages exist, treat them as the primary top-level note entry points.
