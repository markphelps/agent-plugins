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

- `cli-design`: design, build, or review command-line interfaces using the
  Command Line Interface Guidelines from clig.dev
- `context-file-tuneup`: audit and rewrite `CLAUDE.md` / `AGENTS.md` files so
  they stay short, specific, and grounded in the repo
- `github-pr-fixup`: check out an existing GitHub PR branch, address active
  unresolved review comments and failing CI, then push fixes back to that PR
- `github-self-hosted-runner`: install, register, namespace, verify, or remove
  GitHub Actions self-hosted runners on a Linux host under systemd
- `oss-marketing`: sharpen open source README/public-doc positioning for
  first-visit clarity, launch copy, and visitor-to-user conversion
- `oss-repo-readiness`: audit and prepare a GitHub repo for open source
  release, emphasizing first-run and first-contribution developer experience
- `session-log-audit`: mine local agent session logs (Claude Code, Pi, Codex)
  for papercuts in a project the user builds with agents, then rank the fixes

## Workflow Policy

- Keep context-file changes evidence-backed: inspect manifests, CI, docs, and
  repo structure before recommending edits.
- For user-facing context rewrites, preserve the skill's
  inspect -> audit -> propose -> confirm -> apply loop unless the user has
  explicitly asked for direct repo-doc edits here.
- For PR fixups, work on the existing PR branch. Do not open a replacement PR,
  do not resolve review threads unless asked, and ignore resolved or outdated
  review comments.
- For session log audits, collect receipts before you diagnose. Work through
  the numbered phases in order and meet each gate. Treat what the user suspects
  as a hypothesis to test, not as a finding.
- For self-hosted runners, resolve the runner account instead of assuming a
  user or home directory, keep one namespaced instance per target, treat tokens
  as secrets that never reach a file that persists, and confirm no job is
  running before you stop, replace, or delete an instance.
- Do not manually restore removed development skills in top-level `skills/`.
  Run `npm run sync` so the generated mirror matches `development/skills/`.
