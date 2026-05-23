# Development Plugin

Developer workflow skills for maintaining repo-facing agent context.

## Skill Set

| Skill                 | What It Does                                                            | When to Invoke                                                        |
| --------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `context-file-tuneup` | Audits, rewrites, and tightens `CLAUDE.md` / `AGENTS.md` context files. | When reviewing, shrinking, restructuring, or improving agent context. |

## Notes

- Skill source of truth lives in `development/skills/*/SKILL.md`.
- Top-level mirror under `skills/` is maintained by `npm run sync`.
- Removed skills should disappear from the mirror after sync; do not re-create
  them directly under top-level `skills/`.
- Context-file tune-ups should be grounded in repo evidence and, for target
  projects, applied only after the user approves the proposed rewrite.
