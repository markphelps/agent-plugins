---
name: feature-map
description:
  Build and maintain a feature map for an app — short markdown files that tell
  agents what each user-facing feature is, how a user reaches it, how to drive
  it (selectors, commands, requests, accessibility identifiers), what result to
  observe, and the gotchas — packaged as a repo-local verification skill that
  agents load automatically when checking their changes. Drives each feature
  live so recorded steps are verified, marks what it couldn't drive, and keeps
  entries current through use. Supports web, CLI, HTTP API, and macOS apps. Only
  run when the user invokes `/feature-map` by name.
disable-model-invocation: true
---

# Feature map

Give agents a sitemap of the app they're changing, so they can verify their work
without rediscovering how to reach and drive each feature every time. The idea
comes from Lauren Tan's (@poteto) workflow: a set of short markdown files inside
a verification skill, one per feature, each saying what exists, how a user gets
there, how to drive it, and what trips people up.

This skill is the **builder**. It writes a **generated skill** into the repo,
and that generated skill is what agents use day to day. Anyone working in the
repo gets the map without installing this skill.

## Hard rules

- **Only record steps you saw work.** A drive step is `verified` only if you
  performed it and observed the expected result in this run. Everything else is
  `unverified` with a reason. A wrong selector is worse than none, because
  agents will trust it.
- **Drive local or development environments only.** Never drive production. If
  the only reachable environment looks like production (real domain, real
  customer data), stop and ask.
- **Ask before destructive or external actions:** deleting data, sending email
  or messages, charging money, calling third-party APIs. Prefer read-only paths,
  test accounts, and seeded data.
- **Never write secrets.** Credentials appear only as environment-variable names
  (`$APP_TEST_PASSWORD`), never values, in any file.
- **Never modify source code.** The builder writes only inside the generated
  skill directory. Gaps that need code changes (a missing test id, an unlabeled
  control) go in the findings list.

## Commands

| Invocation               | Action                                                                |
| ------------------------ | --------------------------------------------------------------------- |
| `/feature-map`           | No map yet: build it. Map exists: report status and propose next step |
| `/feature-map refresh`   | Re-drive stale and failed entries, add features with no entry yet     |
| `/feature-map <feature>` | Map or re-map one feature ("checkout", "the export command")          |

Bare `/feature-map` on an existing map reports, in chat: entries by status
(verified, unverified, stale), features found in code with no entry, and the
open findings, then recommends one next step.

## Where the generated skill lives

Detect the repo's harness and write to the matching project-skill path:

- `.claude/` exists or CLAUDE.md is present → `.claude/skills/verify-<app>/`
- `.agents/` exists or AGENTS.md is present with Codex-style config →
  `.agents/skills/verify-<app>/`
- Both or neither → ask once which to use.

`<app>` is a short slug of the app's name, so generated skills from different
repos stay distinct if someone installs them globally. Layout:

```text
verify-<app>/
├── SKILL.md          # index + verification loop (template in references/templates.md)
└── features/
    ├── <feature>.md  # one per feature
    └── ...
```

The generated files are ordinary markdown in the repo. The user decides whether
to commit them; say so in the report, and recommend committing, since the map
only helps other agents if it's shared.

## Build

### 1. Discover features (static)

A feature is something a user or caller can do and observe: a page or flow, a
CLI command, an API operation, a menu or window in a native app. Find them from
the edges inward, the same way you would scout an architecture:

- **Web:** router config, page and route files, navigation components, forms.
- **CLI:** the command tree (cobra, clap, click, commander, argparse), help
  output (`<bin> --help`, recursively).
- **HTTP API:** route registrations, OpenAPI/proto definitions.
- **macOS:** menus (`CommandMenu`, `NSMenu`), windows and scenes, menu bar
  extras (`MenuBarExtra`, `NSStatusItem`), settings panes, App Intents.

Group fine-grained operations into features a user would name ("manage flags",
not "PUT /flags/:key"). Aim for entries a person could list from the product's
own navigation. If a `whiteboard` map exists in `docs/map/`, use its entry
points and regions as a head start and record the links (see below).

Before driving anything, show the user the discovered feature list and the
environment you plan to drive (URL, binary, simulator), and confirm.

### 2. Drive each feature (live)

Read the driver reference for each platform involved before driving it:
`references/drivers/web.md`, `cli.md`, `api.md`, or `macos.md`. A repo can mix
platforms (a CLI plus a web UI); load only the drivers you use.

For each feature:

1. Reach it the way a user would, from the app's starting point.
2. Drive the main path and record each step in the driver's vocabulary.
3. Observe and record the result: what appears, what's returned, what exit code
   and output a command gives.
4. Note gotchas you hit: loading delays, auth redirects, flags that hide the
   feature, ordering dependencies, flaky elements.

If you can't drive it (needs credentials you don't have, seeded data, a paid
account, an unsupported control), write the entry from what the code suggests
and mark it `unverified: <reason>`. Don't guess selectors; write "no stable
selector found" instead.

Run features in parallel with subagents when the harness supports it and the
features don't share mutable state; otherwise drive them one at a time.

### 3. Write the generated skill

Use `references/templates.md` for the generated `SKILL.md` and for feature
entries. Keep each feature file short, roughly 20–60 lines. If one grows past
that, split it into sub-features.

### 4. Report

In chat: where the skill was written, entry counts by status, the findings list
(gaps that need code changes to be drivable), and a recommendation to commit the
generated skill. Don't restate the entries.

## Findings

Some features can't be driven reliably without a small code change: a web
control with no stable selector, a macOS view with no `accessibilityIdentifier`,
a CLI that only prints human-formatted output. Record these in the generated
`SKILL.md` under **Findings**, one line each with a receipt. Don't fix them.
They're the to-do list for making the app agent-verifiable.

## Refresh

1. For each entry, check staleness:
   `git log --oneline <verified_sha>..HEAD -- <paths...>`. Changed paths,
   `unverified: failed ...` entries, and entries whose SHA is no longer an
   ancestor of HEAD are due for a re-drive.
2. Re-scan for features with no entry.
3. Re-drive what's due, map what's new, and update the index.
4. Remove entries whose feature no longer exists, after confirming with the
   user; note removals in the report.

## Links to `whiteboard`

If the repo has a `whiteboard` map, add `regions:` to each feature entry naming
the map regions that implement it. Don't edit the map from here; tell the user
the map's region files can list the features they power. Neither skill depends
on the other.
