# AGENTS.md

This plugin contains vault-focused skills.

## Structure

- `.codex-plugin/plugin.json`: plugin manifest
- `skills/*/SKILL.md`: vault workflows and task-specific skills

## Source Of Truth

- The `skills/` directory is the source of truth for vault runtime behavior.
- Repository-wide skill copies are synced via `npm run sync`.
- Do not manually duplicate vault skill edits into top-level `skills/` unless sync tooling is unavailable.

## Consolidation Policy

- Keep the reduced skill surface; do not reintroduce deleted overlap skills.
- Use `vault-maintenance` for orchestration workflows.
- Use `vault-synthesis` for ideas/drift/trace/connect/challenge/research analysis.
- Extend existing consolidated skills before creating new narrow variants.

## Flag Contract

- Operation level uses: `--mode report|apply-safe|apply` (default `report`).
- Domain/variant selectors use: `--kind ...` when needed.
- Keep argument naming consistent across skills.

## Safety

- Keep skills non-destructive by default.
- Preserve user notes and only delete content with explicit approval.
- Never treat `raw/*` as editable content outside allowed ingest movement rules.
