# AGENTS.md

This repository hosts reusable agent plugins and skills.

## Repository layout

- `.agents/plugins/marketplace.json`: Codex-compatible local plugin marketplace
- `development/`: development workflow plugin
- `vault/`: vault workflow plugin
- `*/.codex-plugin/plugin.json`: plugin manifest
- `*/skills/*/SKILL.md`: skill definitions
- `.codex/agents/*.toml`: project-scoped Codex subagents

## Conventions

- Keep behavior in `skills/<skill-name>/SKILL.md`.
- Prefer deterministic logic in helper scripts when needed.
- Avoid vendor-locked paths and wording unless explicitly required.
- Use AGENTS/skills conventions first; plugin manifests are packaging metadata.

## Validation

- `npm run validate` validates plugin manifests.
- `npm run format` formats Markdown and JSON.
