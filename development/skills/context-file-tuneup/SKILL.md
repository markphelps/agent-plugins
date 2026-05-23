---
name: context-file-tuneup
description:
  Audit, rewrite, and tighten a CLAUDE.md / AGENTS.md file so it actually helps
  a coding agent instead of bloating its context. Handles repos that use either
  file name, both names, nested AGENTS.md files, or one file symlinked/aliased
  to the other. Use this skill whenever the user wants to review, clean up, fix,
  shrink, restructure, or improve a CLAUDE.md / AGENTS.md file
---

# Context File Tune-up

A `CLAUDE.md` or `AGENTS.md` file is loaded into an agent's context on every
task. Different agents and repos use different filenames, and some repos keep
one as a symlink or compatibility alias to the other. Treat them as the same
class of file: high-leverage repo instructions for coding agents. A good one
silently prevents whole classes of mistakes; a bloated or vague one wastes the
context budget and gets ignored. This skill audits the target context file
against a known-good structure, derives what it _should_ contain by inspecting
the repo, proposes a full rewrite, and applies it only after the user confirms.

The core loop is **inspect → audit → propose → confirm → apply**. Never skip the
confirm step — this file encodes human judgment about a codebase, so the user
gets the final say before anything is written.

## What "good" looks like

Internalize this target before auditing anything. A great context file is
**short, specific, and verifiable**. The enemy is generic advice the model
already knows ("write clean code", "follow best practices") — it costs tokens
and teaches nothing.

**Hard length budget: ~300 lines.** If the content genuinely needs more, that is
a signal to extract a `rules/` directory and leave behind a _router_ — a few
lines in the main file telling the agent which rule file to read for which task
(see "The rules-router pattern" below). A 1,000-line CLAUDE.md is worse than
useless; the agent skims it.

**Ideal section order** (omit any section that has nothing real to say — empty
scaffolding is noise):

1. **One-liner** — what the project is and its motivation/direction, in a
   sentence or two. Orients everything else.
2. **Non-obvious tooling / settings / version quirks** — the package manager
   that isn't the default, the required env var, the Node version that breaks
   the build, the lockfile that must not be regenerated.
3. **Concise architectural map** — only what isn't obvious and would otherwise
   take reading several files to discover. Where the entry point is, how the
   major pieces talk, where the surprising boundary sits. Not a file-by-file
   tour.
4. **Rules with verifiable instructions** — each rule should be checkable.
   "Parameterize all SQL" not "write safe database code". "Run `pnpm typecheck`
   before committing" not "make sure types are correct".
5. **Hard constraints / anti-patterns** — the bright lines. "Never edit files in
   `generated/`." "Do not add dependencies without asking." "Never call the prod
   API from tests."
6. **Pointers to deeper docs** — link out instead of inlining.
   `See docs/deployment.md for the release process.`
7. **Gotchas / tribal knowledge** — the load-bearing weirdness. "The retry logic
   looks broken but is intentional — see PR #123." "`utils/legacy.ts` is dead
   code we can't delete yet because of X." This is the highest-value,
   hardest-to-recover content and almost never lives in the code itself.

A line earns its place only if it changes what the agent does. If removing a
line would not cause a single mistake, it is probably noise.

## Workflow

### Step 1 — Locate, classify, and read the target

Find the target context file before auditing. If the user named a path, use that
path. Otherwise check the repo root and common locations:

- `AGENTS.md`
- `CLAUDE.md`
- `.claude/CLAUDE.md`
- nested `AGENTS.md` files when the user is asking about a subproject or
  directory-specific context

When more than one candidate exists, identify the relationship instead of
guessing:

- Run a symlink-aware check such as `ls -l <path>` or `test -L <path>` for each
  candidate.
- If one file is a symlink to the other, treat the real target as the source of
  truth. Say so in the audit and avoid editing both paths separately.
- If both files are regular files, compare their purpose. `AGENTS.md` is often
  repo-agent routing while `CLAUDE.md` may be Claude-specific compatibility, but
  do not assume that without reading them.
- If a nested `AGENTS.md` applies to the user's requested subdirectory, audit it
  together with the nearest parent/root context file so the rewrite preserves
  the routing relationship.

Read the full target file after resolving symlinks and hierarchy. Count its
lines — you will reference the number in the audit. Also note the target type in
your audit: `AGENTS.md`, `CLAUDE.md`, nested `AGENTS.md`, symlinked alias, or
multiple independent context files.

### Step 2 — Inspect the repo for ground truth

Do not audit in a vacuum. Spend a few minutes deriving what the file _should_
contain so you can spot what's missing, stale, or wrong. Cheap, high-signal
things to check:

- **Manifests / lockfiles** — `package.json`, `pyproject.toml`, `Cargo.toml`,
  `go.mod`, `Gemfile`. Reveal the real package manager, scripts
  (test/lint/build/typecheck), language version, and key dependencies.
- **Tooling config** — `Makefile`, `justfile`, `.tool-versions`, `.nvmrc`, CI
  workflows in `.github/workflows/`. CI is gold: it shows the _actually
  enforced_ checks, which are the rules worth stating.
- **Structure** — top-level directory layout (2 levels deep is plenty). Identify
  the entry point and the major modules.
- **Existing docs** — a `docs/` folder, `README.md`, `CONTRIBUTING.md`. These
  are pointer targets, and sometimes content has been duplicated into the
  context file that should just be a link.
- **Tribal-knowledge signals** — gotchas usually aren't in the manifest, but
  they leave fingerprints in the repo. Grep code comments for markers like
  `HACK`, `XXX`, `FIXME`, `do not remove`, `do not edit`, `load-bearing`,
  `intentional`, `workaround`, `gotcha`. Skim recent git history
  (`git log --oneline -50`) and look for commit messages or PR references that
  explain surprising decisions ("revert", "actually needed", "fixes flaky").
  These are candidates for the gotchas section — surface them in the audit
  rather than inventing gotchas from nothing.

Note discrepancies as you go: scripts the file mentions that don't exist, a Node
version that disagrees with `.nvmrc`, rules that contradict the CI config.

Keep this proportional. A quick scan is the goal, not an exhaustive code review.
If the repo is huge, sample the most relevant areas rather than reading
everything.

### Step 3 — Produce the audit

Present a structured audit before proposing any change. Lead with the headline
numbers, then go section by section. Use this shape:

```
## Audit: <context-file-path> (<N> lines)

**Verdict:** <one line — e.g. "Solid bones, ~40% is generic filler, missing the gotchas section.">

**Target:** <AGENTS.md / CLAUDE.md / nested AGENTS.md / symlink relationship / multiple files reviewed.>

**Length:** <N> lines vs ~300 target. <If over: what to cut or extract.>

**Section coverage:**
- ✅ One-liner — present and clear
- ⚠️ Tooling — mentions pnpm but omits the required NODE_OPTIONS env var (found in CI)
- ❌ Architectural map — absent; the worker/api split would take 4 files to discover
- ⚠️ Rules — present but vague ("write good tests" → unverifiable)
- ❌ Gotchas — absent

**Specific problems:**
1. Lines 12–28: generic advice the model already knows. Cut.
2. Line 34: references `npm run build`, but package.json uses pnpm and the script is `build:prod`. Stale.
3. ...
```

Be concrete and cite line numbers and evidence (especially repo evidence — "CI
runs `ruff check`, but the file says nothing about linting"). Praise what's
good; don't rewrite working sections for the sake of it. The point is signal,
not a full demolition.

### Step 4 — Derive the gotchas section from the repo

Tribal knowledge — the _why_ behind load-bearing weirdness — is the
highest-value content and the hardest to recover. Don't ask the user for it;
derive it from the signals gathered in Step 2 (comment markers, git history, PR
references). For each candidate, write a gotcha note that states the surprising
thing, why it exists, and a pointer to the evidence — e.g. "The retry logic in
`dispatch.ts` swallows the first failure on purpose; see commit a1b2c3d / PR
#123."

If the repo yields no real tribal-knowledge signal, leave the gotchas section
out entirely rather than padding it with guesses. An empty section is worse than
no section. (If the user volunteers a gotcha in conversation, fold it in — just
don't interrogate them for it.)

### Step 5 — Propose the full rewrite

Show the complete rewritten target file in a code block — the whole file, ready
to drop in, not a diff or a partial. Use the actual filename in the heading and
summary (`AGENTS.md`, `CLAUDE.md`, `.claude/CLAUDE.md`, or the nested path).
Precede it with a short summary (a few lines) of the major moves you made so the
user can orient quickly: what you cut, what you added, the new line count, and
whether symlink or multi-file behavior changes.

```
Here's the rewrite. Major moves:
- Cut the generic-advice and React paragraphs (filler the model already knows)
- Fixed the stale commands (npm → pnpm, build → build:prod)
- Added an architectural map (api ↔ worker via Redis queue) and the enforced CI checks
- Added a gotchas section from the "do not remove" notes in dispatch.ts
- Preserved `CLAUDE.md` as a symlink to `AGENTS.md` instead of duplicating content
- 142 → 96 lines

<full rewritten file in a code block>
```

For a file being split into a `rules/` directory, show the rewritten main file
(with the router) plus each new `rules/*.md` file in full.

End by asking for confirmation: approve as-is, or tell you what to change. Treat
any pushback as input for another pass — re-propose, don't argue.

### Step 6 — Apply on confirmation

Only after explicit approval, write the rewritten file to disk. If the approved
target is symlinked, write through the real target path and leave the symlink
intact unless the user explicitly asks to change the relationship. If two
independent files intentionally coexist, update only the approved file unless
the user approves a coordinated rewrite for both. If splitting into a `rules/`
directory, create it and write the router into the main file. Confirm what was
written, whether any symlink was preserved, and the final line count. If the
user asked for feedback instead of approval, fold it in and re-present — back to
Step 5.

## The rules-router pattern

When content legitimately exceeds ~300 lines, don't cram. Extract topic files
and leave a router. The main file stays a fast index; the agent reads a rule
file only when the task calls for it.

```
AGENTS.md or CLAUDE.md
                     ← stays lean; one-liner, tooling, map, hard constraints, + the router
rules/
  testing.md         ← detailed testing conventions
  database.md        ← schema rules, migration process, SQL conventions
  frontend.md        ← component patterns, styling system
```

The router lives in the main file and reads like:

```markdown
## Detailed rules — read the relevant file before working in that area

- Writing or changing tests → read `rules/testing.md`
- Touching the database, schema, or migrations → read `rules/database.md`
- Frontend components or styling → read `rules/frontend.md`
```

The trigger condition ("when working on X") is the important part — without it
the agent doesn't know when to pull the file in. Each extracted file should
itself respect the spirit of the budget: focused and verifiable.

## Creating from scratch

If no file exists and the user wants one, run Step 2 (inspect) and Step 4
(derive gotchas from the repo) to gather material, then draft directly into the
ideal structure and confirm before writing. Start minimal — it is far better to
ship a tight 60-line file the team will extend than a speculative 300-line one
full of guesses. Only include sections you have real content for.

## Reference

For a richer set of before/after examples — vague rules rewritten as verifiable
ones, filler that should be cut, good gotcha notes — read
`references/examples.md`. Pull it in when you want concrete patterns to model
the rewrite on or to show the user.
