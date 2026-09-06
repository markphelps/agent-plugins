# Development Plugin

Developer workflow skills for repo-facing agent context, GitHub PR follow-up,
command-line interface design, open source release preparation, audits of your
own agent session logs, and GitHub Actions self-hosted runners.

## Skill Set

| Skill                       | What It Does                                                                                             | When to Invoke                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `cli-design`                | Designs and reviews command-line interfaces using clig.dev guidance.                                     | When creating CLI commands, flags, help text, output contracts, error messages, or destructive workflows. |
| `context-file-tuneup`       | Audits, rewrites, and tightens `CLAUDE.md` / `AGENTS.md` context files.                                  | When reviewing, shrinking, restructuring, or improving agent context.                                     |
| `github-pr-fixup`           | Addresses unresolved GitHub PR review comments and failing CI on the existing source branch.             | When a user gives you an existing PR URL and wants review feedback or CI failures fixed without a new PR. |
| `github-self-hosted-runner` | Installs, registers, verifies, or removes namespaced GitHub Actions self-hosted runners on a Linux host. | When a user gives a repository or organization URL and wants a persistent runner managed by systemd.      |
| `oss-marketing`             | Sharpens README and public-doc positioning for first-time visitors.                                      | When a repo needs launch copy, clearer positioning, or a README that explains what the project is.        |
| `oss-repo-readiness`        | Audits and prepares a repo for open source release, focused on developer experience.                     | When making a repo public, writing CONTRIBUTING or issue templates, or running a pre-launch checklist.    |
| `session-log-audit`         | Mines local agent session logs for papercuts and produces a ranked fix list.                             | When the user wants to know what is annoying about their own tool, or why they work around it.            |

## Notes

- Skill source of truth lives in `development/skills/*/SKILL.md`.
- Top-level mirror under `skills/` is maintained by `npm run sync`.
- Removed skills should disappear from the mirror after sync; do not re-create
  them directly under top-level `skills/`.
- CLI design work should stay grounded in clig.dev principles: human-first
  defaults, scriptable I/O contracts, helpful errors, and safe destructive
  actions.
- Context-file tune-ups should be grounded in repo evidence and, for target
  projects, applied only after the user approves the proposed rewrite.
- GitHub PR fixups should stay scoped to active unresolved review threads and
  failed CI for the PR head commit. Push fixes to the existing PR branch instead
  of opening a new PR.
- OSS readiness and OSS marketing are separate concerns. Readiness covers
  contribution mechanics; marketing covers first-visit clarity and conversion.
- Session log audits need a project the user built with agents and used
  recently. Every finding must carry a dated receipt from a real session.
- Self-hosted runner work is destructive on a live machine. Create one instance
  per registration target, never print or persist the token, and check for
  running jobs before you stop, replace, or remove a runner.
