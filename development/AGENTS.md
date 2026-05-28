# AGENTS.md

This plugin contains development workflow skills for maintaining repo-facing
agent context.

## Structure

- `.codex-plugin/plugin.json`: plugin manifest
- `skills/*/SKILL.md`: development workflow skills

## Source Of Truth

- `development/skills/` is the source of truth for this plugin.
- Repository-wide mirrored `skills/` copies are synced via `npm run sync`.
- Do not manually duplicate edits into top-level `skills/` unless sync tooling is unavailable.

## Current Skill Surface

- `context-file-tuneup`: audit and rewrite `CLAUDE.md` / `AGENTS.md` files so
  they stay short, specific, and grounded in the repo
- `github-pr-fixup`: check out an existing GitHub PR branch, address active
  unresolved review comments and failing CI, then push fixes back to that PR

## Workflow Policy

- Keep context-file changes evidence-backed: inspect manifests, CI, docs, and
  repo structure before recommending edits.
- For user-facing context rewrites, preserve the skill's
  inspect -> audit -> propose -> confirm -> apply loop unless the user has
  explicitly asked for direct repo-doc edits here.
- For PR fixups, work on the existing PR branch. Do not open a replacement PR,
  do not resolve review threads unless asked, and ignore resolved or outdated
  review comments.
- Do not manually restore removed development skills in top-level `skills/`.
  Run `npm run sync` so the generated mirror matches `development/skills/`.
