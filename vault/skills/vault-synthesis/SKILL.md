---
name: vault-synthesis
description:
  Unified synthesis skill for ideas, drifts, traces, topic connections, and
  pressure-testing from vault notes.
---

# Vault Synthesis

Unified insight engine for pattern-finding and reasoning across the vault.

## Arguments

`arguments` may include:

- `--kind ideas|drift|trace|connect|challenge|research` (required)
- `--topic "..."` for `trace|challenge|research`
- `--a "..." --b "..."` for `connect`
- `--focus AREA` optional
- `--since DAYS` optional recency window
- `--mode report|apply-safe|apply` (default: `report`)

## Process

1. Scan active notes/projects relevant to the requested kind.
2. Extract evidence and citations.
3. Run selected synthesis analysis.
4. In `report`, return findings only.
5. In `apply-safe`, update existing destination notes/concepts additively.
6. In `apply`, create new durable notes/concepts when evidence is strong.
7. Append `log.md` entry when material changes are applied.

## Constraints

- Ground claims in vault evidence.
- Prefer canonical concept pages over one-off report files.

## Output

Return:

- findings
- evidence links
- confidence
- applied/proposed updates
- touched files
