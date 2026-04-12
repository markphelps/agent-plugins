---
name: vault-log
description: Append structured entries to log.md for vault operations
---

# Vault Log

Append one structured operation entry to `log.md`.

## Parameters

- `--mode report|apply` (default: `apply`)
- Required operation context:
  - operation name
  - short summary
  - key actions
  - touched files

## Workflow

1. Normalize to one entry shape:
   - heading: `## [YYYY-MM-DD] <operation> | <summary>`
   - bullet list: key actions
   - `Touched:` list with relative file paths
2. Execute by mode:
   - `report`: preview exact entry text, no write
   - `apply`: append entry to end of `log.md`
3. Keep entry concise and factual.

## Safety

- Append-only.
- Never delete, reorder, or rewrite historical entries.

## Output

Return:

- rendered entry text
- append status
