---
name: vault-lint
description:
  Lint vault for contradictions, stale pages, orphans, and weak linking
---

# Lint Vault

Run a vault hygiene pass and propose/execute safe fixes.

## Checks

- Contradictions across related notes
- Orphan pages (no meaningful links in/out)
- Stale pages based on `updated` and topic activity
- Missing concept pages repeatedly referenced
- Broken/ambiguous wikilinks

## Process

1. Build issue list with file references.
2. Rank by severity/impact.
3. Propose fixes; apply when approved.
4. Summarize outcomes and append lint entry to `log.md`.

## Safety

- Default to report-first on ambiguous edits.
- Avoid destructive cleanup unless explicitly approved.
