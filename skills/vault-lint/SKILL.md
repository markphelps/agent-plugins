---
name: vault-lint
description:
  Lint vault for contradictions, stale pages, orphans, and weak linking
---

# Lint Vault

Run a vault hygiene pass and propose safe fixes.

## Parameters

- optional target path/scope
- `--mode report|apply-safe|apply` (default: `report`)

## Checks

- Contradictions across related notes
- Orphan pages (no meaningful links in/out)
- Stale pages based on `updated` and topic activity
- Missing concept pages repeatedly referenced
- Broken/ambiguous wikilinks
- Duplicate concepts split across multiple pages
- Dead project cruft that should be archived or removed from navigation
- Active notes that should move to `archive/` because they are superseded or
  purely historical
- Repeated patterns that still live only in drift reports or dated notes but
  deserve a canonical concept page

## Workflow

1. Build issue list with file references, focusing on the active vault surface
   by default.
2. Rank by severity/impact.
3. Call out concept-promotion candidates explicitly when the same idea recurs
   across multiple files.
4. In `report`, propose fixes only.
5. In `apply-safe`, apply only low-risk direct fixes when approved.
6. In `apply`, route archival/concept execution to specialized skills:
   `vault-archive-audit --mode apply-safe` and
   `vault-concept-promoter --mode apply-safe`.
7. For publish-facing lint runs, call `vault-qmd --mode report` to validate
   retrieval/index health.
8. Summarize outcomes and append lint entry to `log.md`.

## Safety

- Default to report-first on ambiguous edits.
- Avoid destructive cleanup unless explicitly approved.
- Exclude `archive/` from active lint checks unless the user asks for an archive
  audit.
- Keep `vault-lint` diagnostic-first; use `vault-archive-audit` for archive
  execution.

## Output

Return:

- issue list with severity
- proposed/applied fixes by mode
- archive/concept promotions delegated
- touched files and log entry status
