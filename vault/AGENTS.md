# AGENTS.md

This plugin contains vault-focused skills.

## Structure

- `.codex-plugin/plugin.json`: plugin manifest
- `skills/*/SKILL.md`: vault workflows and task-specific skills

## Notes

- The `skills/` directory is the source of truth for runtime behavior.
- For end-of-session vault maintenance, prefer `vault-session-sync` as the
  default entrypoint.
- Keep skills non-destructive by default.
- Preserve user notes and only delete content with explicit approval.
- For hosted-vault retrieval/preflight/update flows, prefer `vault-qmd` instead
  of duplicating qmd command logic across other skills.
- Mode convention for action-oriented skills:
  - `--mode report|apply-safe|apply` (default `report`)
  - keep domain selectors (`morning/evening`, topic kind, etc.) separate from
    operation mode
