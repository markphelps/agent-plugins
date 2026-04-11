# Development Plugin

Developer workflow skills for publishing work, handing off sessions, and
migrating repos to neutral agent standards.

## Skill Set

| Skill        | What It Does                                                               | When to Invoke                                       |
| ------------ | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| `handoff`    | Generates a timestamped handoff document for the next session.             | End of session or when switching major tasks.        |
| `ship-pr`    | Runs branch -> smart stage -> commit -> push -> PR flow with draft prompt. | When publishing local changes to GitHub.             |
| `declaudify` | Migrates Claude-specific config/artifacts to AGENTS/skills conventions.    | When normalizing legacy Claude-focused repositories. |

## Notes

- Skill source of truth lives in `development/skills/*/SKILL.md`.
- Top-level mirror under `skills/` is maintained by `npm run sync`.
- Keep workflows safe by default and avoid destructive git operations.
