# Development Plugin

Developer workflow skills for maintaining repo-facing agent context and GitHub
PR follow-up work.

## Skill Set

| Skill                 | What It Does                                                                                 | When to Invoke                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `context-file-tuneup` | Audits, rewrites, and tightens `CLAUDE.md` / `AGENTS.md` context files.                      | When reviewing, shrinking, restructuring, or improving agent context.                                     |
| `github-pr-fixup`     | Addresses unresolved GitHub PR review comments and failing CI on the existing source branch. | When a user gives you an existing PR URL and wants review feedback or CI failures fixed without a new PR. |

## Notes

- Skill source of truth lives in `development/skills/*/SKILL.md`.
- Top-level mirror under `skills/` is maintained by `npm run sync`.
- Removed skills should disappear from the mirror after sync; do not re-create
  them directly under top-level `skills/`.
- Context-file tune-ups should be grounded in repo evidence and, for target
  projects, applied only after the user approves the proposed rewrite.
- GitHub PR fixups should stay scoped to active unresolved review threads and
  failed CI for the PR head commit. Push fixes to the existing PR branch instead
  of opening a new PR.
