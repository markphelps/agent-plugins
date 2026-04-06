---
name: vault-log
description: Append structured entries to log.md for vault operations
---

# Append Vault Log

Append a structured operation entry to `log.md`.

## Entry Format

- heading: `## [YYYY-MM-DD] <operation> | <summary>`
- bullets: key actions
- touched list: changed file paths

## Process

1. Parse requested operation details.
2. Append one new entry at end of `log.md`.
3. Avoid rewriting historical entries.

## Safety

- Append-only behavior.
- Never delete or reorder existing log history.
