# AGENTS.md

This plugin contains vault-focused skills.

## Structure

- `.codex-plugin/plugin.json`: plugin manifest
- `skills/*/SKILL.md`: vault workflows and task-specific skills

## Notes

- The `skills/` directory is the source of truth for runtime behavior.
- Keep skills non-destructive by default.
- Preserve user notes and only delete content with explicit approval.
