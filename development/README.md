# Development Plugin

Developer workflow skills for repo-facing agent context, GitHub PR follow-up,
command-line interface design, codebase-grounded landing copy, architecture
mapping and whiteboard defense, open source release preparation, audits of your
own agent session logs, bug-claim verification, decision records, and GitHub
Actions self-hosted runners.

## Skill Set

| Skill                       | What It Does                                                                                             | When to Invoke                                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `cli-design`                | Designs and reviews command-line interfaces using clig.dev guidance.                                     | When creating CLI commands, flags, help text, output contracts, error messages, or destructive workflows.                                   |
| `codebase-landing-copy`     | Writes product landing-page copy grounded in shipped code and an evidence ledger.                        | When writing or fact-checking landing pages, homepages, product pitches, hero copy, or store listings for a repo-backed product.            |
| `context-file-tuneup`       | Audits, rewrites, and tightens `CLAUDE.md` / `AGENTS.md` context files.                                  | When reviewing, shrinking, restructuring, or improving agent context.                                                                       |
| `decision-records`          | Writes and maintains decision and plan records (ADRs) and their registry table, preserving history.      | When recording an architecture, product, design, or dependency decision, amending or superseding a record, or starting a records directory. |
| `github-pr-fixup`           | Addresses unresolved GitHub PR review comments and failing CI on the existing source branch.             | When a user gives you an existing PR URL and wants review feedback or CI failures fixed without a new PR.                                   |
| `github-self-hosted-runner` | Installs, registers, verifies, or removes namespaced GitHub Actions self-hosted runners on a Linux host. | When a user gives a repository or organization URL and wants a persistent runner managed by systemd.                                        |
| `whiteboard`                | Maps architecture and design rationale, then runs whiteboard-defense quizzes.                            | When the user explicitly invokes `/whiteboard` to map a codebase, explore a region, refresh a map, or defend their understanding.           |
| `verify-bug`                | Rules on whether claimed bugs are real via an isolated Prover/Skeptic/Referee hearing.                   | When the user asks whether a bug is real, wants findings or review comments verified, or points at suspected bugs from a map.               |
| `oss-marketing`             | Sharpens README and public-doc positioning for first-time visitors.                                      | When a repo needs launch copy, clearer positioning, or a README that explains what the project is.                                          |
| `oss-repo-readiness`        | Audits and prepares a repo for open source release, focused on developer experience.                     | When making a repo public, writing CONTRIBUTING or issue templates, or running a pre-launch checklist.                                      |
| `session-log-audit`         | Mines local agent session logs for papercuts and produces a ranked fix list.                             | When the user wants to know what is annoying about their own tool, or why they work around it.                                              |

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
- Whiteboard is explicit-invocation only, never modifies source code, and keeps
  personal defense records under `.map/` while committed maps live under
  `docs/map/`.
- Whiteboard logs `suspected-bug` leads without investigating them; `verify-bug`
  rules on them. Neither skill depends on the other.
- Bug verification never modifies the working tree. Repro tests run only in a
  throwaway `git worktree` under `.verify/`, and GitHub replies are posted only
  after the user confirms each one.
- Codebase landing copy is for a product's own landing page and must trace
  claims to shipped code; use OSS marketing for open-source README positioning.
- Session log audits need a project the user built with agents and used
  recently. Every finding must carry a dated receipt from a real session.
- Decision records are historical evidence. Preserve IDs, filenames, and past
  decisions; add amendments or superseding records rather than editing history.
- Self-hosted runner work is destructive on a live machine. Create one instance
  per registration target, never print or persist the token, and check for
  running jobs before you stop, replace, or remove a runner.
