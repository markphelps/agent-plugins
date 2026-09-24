# File templates

Four files: the overview, region files, scout notes, and defense records. The
first two are committed documentation; the last two are local-only in `.map/`.

## Contents

- `docs/map/index.md`
- `docs/map/<region>.md`
- `.map/scout.md`
- `.map/defense/<region>.md`

## `docs/map/index.md`

```markdown
---
region: index
title: <Project> architecture map
altitude: 1
mapped_at: <full commit sha>
mapped_on: <YYYY-MM-DD>
paths: ['**']
entry_points: [<path>, ...]
---

# <Project> architecture map

<Two or three sentences: what this system is, who or what talks to it, and the
single most important thing to understand about how it's built.>

## Shape

<Component and boundary diagram, then a short paragraph per component:
responsibility, and a link to its region file if mapped.>

## Key flows

<One or two sequence diagrams or call trees for the flows that define the
system.>

## System-wide decisions

- **<Decision in a few words>.** <What was chosen over what, and why.>
  <evidence tag>
- ...

## Trust boundaries and failure modes

<Where untrusted input enters, what happens when each external dependency is
down or slow, and where the system is known to be fragile. Receipts inline.>

## Regions

| Region                        | Covers             | Mapped at     |
| ----------------------------- | ------------------ | ------------- |
| [Sync engine](sync-engine.md) | `internal/sync/**` | `<short sha>` |

## Unexplored

- **<Component>** (`<paths>`, ~<N> lines): <why it might matter>

## Open questions & friction

- `unexplained` <Cross-cutting decision with no recorded why> (`<receipt>`)
- ...
```

Keep pass status and defense results out of this file. It's shared.

## `docs/map/<region>.md`

```markdown
---
region: <slug>
title: <Human name>
altitude: <parent altitude + 1>
parent: <parent slug, usually index>
mapped_at: <full commit sha>
mapped_on: <YYYY-MM-DD>
paths: [<glob>, ...]
entry_points: [<path or path:Symbol>, ...]
---

# <Human name>

<Two or three sentences: responsibility, who calls it, what it depends on.>

## Shape

<File tree or component diagram for this region.>

## How it works

<The key flows as sequence diagrams, call trees, or pseudocode, each with a
short paragraph. State machines for anything with a lifecycle.>

## Data

<The structures the region is built around, with design-weight annotations.>

## Decisions

- **<Decision>.** <Chosen over what; why.> <evidence tag>
- ...

## Trust boundaries and failure modes

- **<Scenario>:** <what happens, and whether it's handled> (`<receipt>`)

If a scenario looks unhandled, also log it as a `suspected-bug` below.

## Open questions & friction

- `<type>` <one line> (`<receipt>`)
- `suspected-bug` <triggering scenario> (`<receipt>`) — verdict: unverified
- `stale-doc` <doc path> says <claim>; code does <behavior> (`<receipt>`)

A verification pass may later replace `unverified` with `confirmed: <evidence>`,
`refuted: <why it isn't a bug>`, or `unclear: <what's missing>`. Preserve
whatever verdict is there when refreshing.

`/whiteboard docs` appends `proposed: <branch>` to entries it includes in a
write-back branch; the entry is removed once the change reaches HEAD.

## Zoom candidates

- **<Sub-area>** (`<paths>`): <why it might deserve its own layer>
```

`paths` must be precise enough for staleness checks to be meaningful: list the
directories and files this region actually describes, not its whole parent
directory.

## `.map/scout.md`

```markdown
# Scout notes

- Map location: docs/map/ (or the chosen alternative, and why)
- Docs write-back: <map included in PRs | self-contained docs>, chosen
  <YYYY-MM-DD>

## Evidence sources

- Records: <path to ADRs/decision records, or "none found">
- PR search: <labels or terms that surface design discussion>
- Docs: <useful design docs, wiki links referenced from the repo>

## Ignore

- <generated, vendored, or fixture paths>

## Dead ends

- <things that looked relevant and weren't, so the next scout skips them>

## Leads

- <things noticed but not followed yet>
```

## `.map/defense/<region>.md`

```markdown
---
region: <slug>
derived_from: <mapped_at sha of the region when core questions were derived>
status: in-progress | passed
---

# Defense: <Human name>

## Core questions

- [x] CQ1 (trade-off) <question> — passed <YYYY-MM-DD>
- [ ] CQ2 (failure) <question>
- [ ] CQ3 (adversarial) <question>
- [ ] CQ4 (data) <question>

## Gaps

- <Concept the user missed and hasn't yet recovered, with the file that explains
  it>

## Log

### <YYYY-MM-DD>

- CQ2 missed: <what they said vs what the code does>; drilled into <topic>
- CQ1 passed without hint
- Stated: <rationale the user gave for an inferred decision>, saved to map
```

Remove a gap once the user answers the related question correctly in a later
session. The log is append-only; keep entries to one line each.
