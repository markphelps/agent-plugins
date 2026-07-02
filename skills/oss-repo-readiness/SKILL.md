---
name: oss-repo-readiness
description:
  Audit and prepare a GitHub repo for open source release, with a focus on
  developer experience (DevEx) — the things that determine whether a stranger
  can go from "found this repo" to "opened a PR" without friction. Use this
  whenever the user wants to open-source a repo, make a private repo public, do
  a "pre-launch checklist" or "OSS readiness audit," improve their
  README/CONTRIBUTING/issue templates, or asks something like "is this repo
  ready for people to use/contribute to." Also trigger for narrower asks that
  are really pieces of this — "write a CONTRIBUTING.md," "set up issue
  templates," "add a CODEOWNERS file" — since those are almost always better
  done as part of the full readiness pass rather than in isolation.
---

# Open Source Repo Readiness

Getting a repo "open source ready" isn't about the license — that's a
five-minute checkbox. It's about DevEx: whether a developer who has never talked
to the maintainer can understand the project, run it, and land a contribution
without having to ask a question first. Every piece of friction you remove here
is a contributor you don't lose. This skill audits a repo against that bar,
using patterns pulled from repos that are genuinely good at this (Vite,
shadcn/ui, tRPC, Sentry, Supabase, Rust, Excalidraw, Caddy) rather than generic
checklist advice.

## Workflow

1. **Inspect the repo.** Read the root directory listing, README, package
   manifest (package.json / Cargo.toml / go.mod / pyproject.toml), CI config,
   and any existing docs. Figure out the language/ecosystem and how big the
   project is — a 200-star CLI and a framework with a plugin ecosystem need
   different amounts of ceremony. Don't assume; look.
2. **Run the audit** using the checklist below. Produce a short gap report: what
   exists, what's missing, what exists but is weak (e.g. a README with no
   quickstart, a CONTRIBUTING.md that's just a boilerplate stub).
3. **Propose, don't dump.** Share the gap report and ask which pieces to tackle
   — or if the user says "just do it," proceed through the checklist in priority
   order (Tier 1 first). Don't generate all nine files unprompted for a repo
   that only asked about its README.
4. **Write files that reflect the actual repo**, not placeholders. Pull the real
   install command from the manifest, the real test command from CI config or
   package scripts, the real license the user wants, the real project name. A
   generated CONTRIBUTING.md that says `npm test` in a Go repo is worse than no
   CONTRIBUTING.md.
5. **Flag what you can't decide for them**: license choice (MIT vs Apache-2.0 vs
   GPL has real implications — explain the tradeoff, don't just pick one),
   whether to enable Discussions, whether to add a CLA. Ask rather than assume
   for anything with legal or governance weight.

## The audit, in priority order

### Tier 1 — the first five minutes of a stranger's visit

These are what someone sees before they've run a single command. Weak here, and
nothing else matters.

- **README.md** — this is the actual product page, not a formality. It needs, in
  order: a one-line description that says what problem this solves (not what
  it's built with), a quickstart that gets someone running something in under 60
  seconds, and only then everything else. The Vite and shadcn/ui READMEs both
  lead with "what is this" before any badge or table of contents. If there's a
  UI, a screenshot or short GIF above the fold does more than three paragraphs
  of description — this is the single highest-leverage thing you can add to a
  README with a visual component. Cut anything that belongs in `/docs` instead:
  full API reference, architecture deep-dives, and changelog entries don't
  belong in the README — link to them.
- **LICENSE** — no license file means the code is not legally usable by anyone,
  full stop, regardless of what the README says. If the user hasn't chosen one,
  ask: MIT/Apache-2.0/BSD for "I want maximum adoption, don't care much what
  people do with it" (most dev-tool repos, including basically all of the ones
  referenced in this skill); Apache-2.0 specifically if patent grant language
  matters (common for anything that touches larger companies' legal review, e.g.
  Kubernetes-ecosystem projects); GPL/AGPL for "I want derivative works to stay
  open" (used deliberately by projects like Grafana pre-relicense, or
  database/infra tools wary of cloud providers repackaging them).
- **Quickstart that actually works** — the single most common OSS-readiness
  failure is a copy-pasted install command that's stale. Before treating the
  README as done, mentally (or actually) walk it as a first-time user would:
  clone, install, run — does the first command in the doc actually work against
  the current repo state?

### Tier 2 — the first contribution

Everything a person needs to go from "I found a bug" or "I want to add X" to a
merged PR without a synchronous conversation.

- **CONTRIBUTING.md** — dev environment setup, how to run tests, branch/commit
  conventions if any, and what the PR review process looks like (response-time
  expectations help — tRPC and Sentry both state roughly how fast maintainers
  respond). If the project uses a specific commit format (Conventional Commits
  is the common one, used by Vite/Vue/Angular-descended projects because it
  drives automated changelogs/semver), say so explicitly with an example, not
  just a link to the spec.
- **Issue templates** (`.github/ISSUE_TEMPLATE/`) — GitHub's issue _forms_
  (YAML, not just markdown templates) are the current standard: structured
  fields for repro steps, environment, expected vs actual behavior. Bug report +
  feature request at minimum. A blank issue box gets you "it doesn't work" with
  no repro; a form gets you something actionable. Include a `config.yml` that
  points support questions to Discussions instead of Issues if Discussions is
  enabled — keeps the issue tracker from filling with questions.
- **Pull request template** (`.github/pull_request_template.md`) — a short
  checklist (tests added, docs updated, linked issue) catches the common gaps
  before review rather than after.
- **"Good first issue" labeling** — not a file, but worth flagging: GitHub's own
  research found repos where ~25% of open issues are labeled "good first issue"
  see meaningfully more first-time contributors than those without. If the repo
  has open issues and none are labeled, that's a cheap, high-leverage fix — ask
  the user if they want help identifying 3-5 candidates from the current issue
  list.
- **CODEOWNERS** (`.github/CODEOWNERS`) — only worth adding once there's more
  than one maintainer or the repo has distinct areas of ownership; skip for
  solo-maintainer projects, it's pure overhead there.

### Tier 3 — trust and governance signals

These matter more as the project grows past "a few people trying it" — don't
over-invest here for a brand-new repo, but flag them as the project matures.

- **CODE_OF_CONDUCT.md** — the Contributor Covenant is the de facto default;
  almost no project needs a custom one. Its main value isn't the document
  itself, it's signaling "this is a maintained, professional space" to a
  first-time contributor deciding whether to engage.
- **SECURITY.md** — even a few lines (how to report a vulnerability privately,
  e.g. a security@ email or GitHub's private vulnerability reporting) matters
  the moment the project has real users, because the alternative is someone
  disclosing a vulnerability in a public issue.
- **CHANGELOG.md** — Keep a Changelog format (or auto-generated from
  Conventional Commits via changesets/semantic-release) tells people what
  changed between versions without reading commit history. Auto-generated is far
  more sustainable than hand-maintained for anything with regular releases.
- **Governance / MAINTAINERS file** — only for projects with multiple
  maintainers or that want to signal a path from contributor to maintainer. Skip
  for solo projects.
- **FUNDING.yml** (`.github/FUNDING.yml`) — only if the maintainer actually
  wants funding/sponsorship; trivial to add (GitHub Sponsors, Open Collective,
  etc.) and shows up as a "Sponsor" button on the repo.

### Tier 4 — DevEx polish

The difference between "usable" and "a pleasure to contribute to." Higher
effort, worth it for projects expecting sustained outside contribution.

- **CI on every PR** — tests + lint + build running automatically and visibly (a
  status check on the PR, plus a badge in the README) is table stakes for trust;
  a contributor shouldn't have to wonder if their change broke something.
- **Devcontainer / one-command setup** (`.devcontainer/`, or a
  `Makefile`/`justfile`/npm script that does everything) — removes "what version
  of X do I need" as a source of friction entirely. Rust projects lean on
  `cargo` doing this for free; polyglot or C-dependency-heavy projects benefit
  the most from an explicit devcontainer.
- **Discussions enabled** — for Q&A and proposals that shouldn't live in the
  issue tracker. Worth enabling once the issue tracker starts accumulating "how
  do I..." questions.
- **Badges that mean something** — build status, license, latest version, and
  maybe a Discord/Slack invite if community chat exists. Skip decorative badge
  walls; each one should answer a real question a visitor has ("does this still
  work," "what license," "can I ask a question somewhere"). A star-history chart
  is a nice-to-have late addition, not a priority.
- **Repo topics + a real "About" description** — cheap, easy to forget, and is
  how people find the repo via GitHub search/topic browsing at all.

## Writing the actual content

When generating README/CONTRIBUTING/templates, don't reach for boilerplate. Base
every command on what's actually in the repo:

- Pull the run/build/test/lint commands from `package.json` scripts, `Makefile`
  targets, `Cargo.toml`, CI workflow files, or existing docs — don't guess at
  conventional command names.
- Match the project's actual tone. A terse, code-forward CLI dev-tool README
  (think ripgrep or fd) reads differently from a README for a broader
  application-facing OSS project (think Excalidraw or Supabase).
- If the repo has no tests yet, don't write a CONTRIBUTING.md section
  instructing contributors to run tests that don't exist — flag the gap instead
  and ask if they want a minimal test setup first.
- Keep the README's first screen (before any scroll) to: name, one-line pitch,
  and the quickstart. Everything else — full docs, architecture, FAQ — can live
  below the fold or in `/docs`, linked rather than inlined.

## Output

Default to writing the files directly into the repo at their conventional paths
(`README.md`, `CONTRIBUTING.md`, `.github/ISSUE_TEMPLATE/*.yml`, etc.) rather
than dumping content into chat — these are meant to be committed. Summarize what
was added/changed and call out anything that still needs a human decision
(license choice, whether to enable Discussions, who owns CODEOWNERS entries)
rather than silently picking for them.
