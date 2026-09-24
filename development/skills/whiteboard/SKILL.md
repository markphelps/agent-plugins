---
name: whiteboard
description:
  Map an existing codebase's architecture and the reasons behind its design,
  then quiz the user whiteboard-defense style until they can explain and defend
  it. Builds an evidence-tagged map in `docs/map/` (a high-altitude overview
  first, then one region at a time), logs open questions and friction, and runs
  short defense sessions on trade-offs, failure modes, data structures, and
  adversarial behavior. Only run when the user invokes `/whiteboard` by name.
disable-model-invocation: true
---

# Whiteboard

Help the user pass the whiteboard defense on a codebase: if someone pulls them
aside and asks how a system works, why it was built this way instead of another
way, where it fails, or what happens when an actor misbehaves, they can answer
confidently. Line-level recall is not the goal. A high-level, defensible mental
model is.

The skill has two halves that feed each other:

1. **Map.** Explore the repo and write a layered architecture map with receipts
   for every claim about _why_.
2. **Defend.** Quiz the user on the map, one question at a time, and record what
   they know, what they missed, and what the code failed to explain.

## Hard rules

- **Never modify source code.** The only files this skill writes are under
  `docs/map/` (or the repo's existing docs location, see below) and `.map/`.
  Cleanup ideas go in the friction log, not in edits. Understanding comes first;
  changing code mid-map corrupts the thing being mapped.
- **Never invent rationale.** Every claim about why something is the way it is
  carries an evidence tag. If there is no evidence, say so and log it as an open
  question. A fabricated "why" is worse than a missing one, because the defense
  will then grade the user against fiction.
- **Keep personal records out of shared files.** Defense logs and pass status
  live only in `.map/`, which stays untracked.

## Commands

Parse the argument after `/whiteboard`:

| Invocation                  | Action                                                         |
| --------------------------- | -------------------------------------------------------------- |
| `/whiteboard`               | Read state, report it, propose the next step (see below)       |
| `/whiteboard map`           | Build or rebuild the overview (`docs/map/index.md`)            |
| `/whiteboard zoom <region>` | Map one region in depth; works even with no overview yet       |
| `/whiteboard defend [reg]`  | Run a defense session; no region means pick one (see defense)  |
| `/whiteboard refresh`       | Check every mapped region for staleness and remap what changed |

A `<region>` can be an existing region slug, a name from the Unexplored list, or
a plain description ("the sync engine", "auth"). Resolve descriptions to paths
during scouting and confirm the boundary with the user in one line before
writing.

### Bare `/whiteboard`: read state, then propose

1. Find the map directory (see "Where the map lives"). If none exists, say so
   and propose `map`.
2. For each region file, compute staleness from its frontmatter:
   `git log --oneline <mapped_at>..HEAD -- <paths...> | wc -l`. Also note if
   `mapped_at` is no longer an ancestor of HEAD (rebased or force-pushed
   history), which makes the region stale by definition.
3. Read `.map/defense/*.md` for pass status.
4. Report in chat, compactly: regions with staleness counts and pass status, the
   Unexplored list, and one recommended next step with a one-line reason.
   Example: "Sync engine is 38 commits stale; refresh it before defending."
   Report pass status only in chat, never in a committed file.

## Where the map lives

- **Committed:** `docs/map/`. Before creating it, check for an existing
  architecture or design-docs convention (`docs/architecture/`, `docs/design/`,
  `ARCHITECTURE.md`, `architecture/`). If one exists, ask the user once whether
  to put the map there instead, and record the choice in `.map/scout.md`.
- **Local only:** `.map/` at the repo root, holding `scout.md` and
  `defense/<region>.md`. On first run, add `.map/` to `.git/info/exclude` rather
  than `.gitignore`, so nothing personal or tool-specific touches the repo's
  tracked files. This matters most on repos the user doesn't own.

File templates are in `references/templates.md`. Read it before writing any map
file.

## Evidence tiers

Tag every claim about rationale (why, not what) with one of these, inline:

| Tag                         | Meaning                                                     |
| --------------------------- | ----------------------------------------------------------- |
| `[documented: <link/path>]` | An ADR, design doc, README, or PR/issue description says so |
| `[historical: <sha>]`       | A commit message or clear pattern of changes shows it       |
| `[inferred]`                | Your reading of the code; plausible but unconfirmed         |
| `[stated: <date>]`          | The user explained it during a defense and confirmed saving |

Descriptions of _what_ the code does need a file receipt (`path/to/file.go`,
optionally a symbol) but no tier. Prefer the strongest tier available, and when
sources disagree (the ADR says one thing, the code does another), record both
and log the mismatch as friction.

## Map phase

### Scouting order

Scout cheaply before reading implementation code. Most architecture is visible
from the edges of a repo, and reading function bodies first fills the context
with detail before the shape is known. Work through these in order, stopping
early on small repos:

1. **Prior state:** existing `docs/map/`, `.map/scout.md` (known evidence
   sources, dead ends, leads from last time).
2. **Manifests and build:** `go.mod`, `package.json`, `Cargo.toml`,
   `pyproject.toml`, `Package.swift`, Dockerfiles, Makefiles, CI config,
   workspace/monorepo config. These reveal languages, major dependencies,
   deployables, and module boundaries.
3. **Entry points:** `main` packages, `cmd/`, server bootstraps, CLI roots, app
   delegates, exported library surfaces.
4. **Directory tree:** two or three levels deep, excluding vendored and
   generated code.
5. **Prose:** README, CONTRIBUTING, AGENTS.md/CLAUDE.md, `docs/`, and any
   records directory (`docs/records/`, `docs/adr/`, `docs/decisions/`, `adr/`).
6. **Git signals:**
   - hot files:
     `git log --since="1 year ago" --name-only --format= | sort | uniq -c | sort -rn | head -30`
   - big structural commits:
     `git log --date=short --format='%h %ad %s' --shortstat | grep -B2 -E '[0-9]{2,} files? changed'`
     (large refactors, moves, and rewrites often mark a decision)
   - when a component appeared:
     `git log --diff-filter=A --format='%h %ad %s' -- <path> | tail -1`
   - where a decision came from: `git log -S '<identifier>' --format='%h %s'`
7. **PR and issue history (if `gh` is available):** search merged PRs and issues
   for design discussion on the components found so far. Note useful labels or
   search terms in `scout.md` for next time.

Only after this, read implementation code, and only enough to confirm the
boundaries and flows you're about to draw.

### Delegation

If the harness can delegate to subagents, do the first scout pass yourself,
identify the major components, then give each component to a subagent with: its
paths, the evidence sources found, and instructions to return a compact summary
(responsibility, key flows, key decisions with evidence tags and receipts,
friction found) rather than raw file contents. This keeps the main context free
for writing the map and running the defense. Without subagents, work component
by component and write each section before moving on.

### Overview (`map`)

Write `docs/map/index.md` at high altitude: the major components and their
responsibilities, the boundaries between them (process, network, trust,
package), the one or two flows that matter most, and the decisions that shape
the whole system. Aim for something a person could redraw on a whiteboard from
memory after reading it twice. If a detail wouldn't survive that test, it
belongs in a region file, not the overview.

End `index.md` with an **Unexplored** list: components noticed but not mapped,
each with its paths, rough size, and one line on why it might matter. This is
the menu for zooms.

### Zoom (`zoom <region>`)

Write `docs/map/<region-slug>.md` one layer deeper than its parent: internal
structure, the key flows through it, data structures and state, its decisions
with evidence, trust boundaries, and failure modes. Link it from `index.md` and
remove it from Unexplored.

If no overview exists yet, do a light scout (steps 2–5) just to bound the region
and understand its neighbors, write a minimal `index.md` containing only this
region's place in the system plus an Unexplored list, then zoom.

Regions can nest. A zoom into part of a region gets its own file with `parent:`
pointing at the containing region. Don't go deeper than the user asked; the
altitude model only works if each layer stays readable.

### Choosing views

Pick the smallest view that makes each point clear, and place it next to the
short text it supports. Read `references/views.md` for the catalog (component
diagrams, sequence diagrams, call trees, shallow file trees, data shapes, state
machines, pseudocode). Use an HTML file only for a single concept too dense for
Mermaid, never as a second copy of the map.

### Friction log

Every region file (and `index.md`, for cross-cutting items) has an **Open
questions & friction** section. Add to it during scouting, zooming, and defense.
Each entry is typed:

| Type              | What it captures                                                   | Usually found in |
| ----------------- | ------------------------------------------------------------------ | ---------------- |
| `unexplained`     | A significant decision with no recorded why                        | scout, zoom      |
| `confusing`       | Misleading names, surprising indirection, comment contradicts code | zoom             |
| `inconsistent`    | Two patterns doing the same job; docs disagree with code           | scout            |
| `cleanup`         | Dead code, abandoned dependency, ancient TODO                      | any              |
| `defense-exposed` | The user missed a question because the code misled them            | defense          |

The signal here is simple: if an agent with full read access struggled to
understand something, a new contributor will too. Keep entries to one line plus
a receipt. Don't fix anything.

When `unexplained` items accumulate, tell the user they are good candidates for
decision records (ADRs) documenting the rationale. Use that plain wording and
nothing more; this skill has no dependency on any records tooling.

### Scout notes

Update `.map/scout.md` at the end of every map, zoom, or refresh: evidence
sources found (records directory, useful PR labels or search terms), dead ends
to skip, generated or vendored paths to ignore, and leads not yet followed.
Store distilled findings only, never raw logs; the region frontmatter and the
Unexplored list carry the rest.

## Refresh

For each stale region, read `git log <mapped_at>..HEAD -- <paths>` and the diff
stat. Small changes: update the affected sections in place and bump `mapped_at`.
Large or structural changes: remap the region. Either way:

- Keep `[stated]` evidence unless the change contradicts it; if it does, move it
  to friction as `inconsistent` and flag it for the user.
- Re-derive the region's core questions (see `references/defense.md`); keep pass
  status for any question whose underlying decision didn't change.
- If `paths` no longer match anything, the region was moved or deleted; find
  where it went via `git log --follow` or rename detection, and ask before
  rewriting the boundary.

## Defense phase

Read `references/defense.md` before starting a session. It covers question
types, grading, hints, core questions, pass rules, and write-backs. In short:

- **Pick a region.** If none is given, prefer unpassed regions with the fewest
  passed core questions, skipping stale ones. If the chosen region is stale,
  offer to refresh first; defending against a stale map teaches the wrong
  system.
- **One question at a time.** Open-ended first. If the user is stuck or says
  they don't know, offer a multiple-choice hint rather than the answer.
- **Grade against the map's receipts**, and tell the user what they got right,
  missed, or got wrong, with file links. Drill deeper on misses before moving
  on.
- **Inferred and unexplained decisions** are framed as "defend this or tell me
  why it's wrong," not graded. A good answer can become `[stated]` evidence, but
  only after asking the user to confirm it should be saved.
- **Stop** around ten questions or when the user says so. Summarize, update
  `.map/defense/<region>.md`, add any `defense-exposed` friction to the region
  file, and say what's left to pass.

## Reporting

After a map, zoom, or refresh, reply briefly in chat: what was written or
updated (file links), the two or three most important things the map shows, the
count of friction items by type, and the recommended next step. Don't restate
the map; the user can read it.
