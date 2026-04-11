---
name: vault-qmd
description:
  Use qmd for fast vault retrieval, publish-readiness checks, and hosted-vault
  update workflows
---

# Vault QMD

Use local `qmd` as the canonical retrieval and publish helper for this vault.

## Parameters

- operation intent: `search`, `inspect`, `preflight`, `update-index`
- `--mode report|apply-safe|apply` (default: `report`)
- optional query/target path flags passed through to qmd commands

## Workflow

1. Check index health before retrieval/publish:
   - `qmd status`
2. Choose operation:
   - `search`: use `qmd query` (preferred), `qmd search`, or `qmd vsearch`
   - `inspect`: use `qmd get` or `qmd multi-get` for cited note reads
   - `preflight`: run targeted checks:
     - `qmd query` for likely stale/broken navigation references
     - `qmd ls` for collection/path visibility
   - `update-index`: run `qmd update` (optionally `qmd update --pull` when
     requested)
3. Apply by mode:
   - `report`: show commands + findings only
   - `apply-safe`: run read-only commands plus safe refresh (`qmd update`)
   - `apply`: include heavier maintenance (for example `qmd embed`) when
     explicitly requested
4. If publish/navigation changed, delegate to:
   - `vault-index` to refresh `index.md`
   - `vault-log` to append operation history

## Safety

- Do not edit curated note content directly from this skill.
- Treat `qmd update --pull` and `qmd embed` as explicit operations.
- Keep retrieval evidence traceable to file paths and line ranges when
  available.

## Output

Return:

- commands run (or proposed)
- findings summary
- affected collections/paths
- follow-up skill calls (`vault-index`, `vault-log`) if needed
