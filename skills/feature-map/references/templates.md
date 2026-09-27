# Generated skill templates

Templates for the files the builder writes into the repo. Fill every
placeholder; delete optional lines that don't apply.

## Contents

- Generated `SKILL.md`
- Feature entry
- Status markers

## Generated `SKILL.md`

The description must trigger when an agent in this repo is about to verify a
change, not on every question about the app.

```markdown
---
name: verify-<app>
description:
  Feature map for <App>: how to reach, drive, and check each user-facing
  feature. Use whenever you're verifying a change to <App> — before calling a
  task done, after editing UI, commands, or endpoints, or when asked to test
  or QA a feature — so you drive the real behavior instead of guessing.
---

# Verify <App>

<One or two sentences: what the app is and how to start it for verification.>

## Environment

- Start: `<command>` (ready when <signal>)
- Base: <URL | binary path | app bundle>
- Auth: <how to sign in, env var names only>
- Seed data: <command or "none needed">
- Drivers: <web | cli | api | macos>

## Verifying a change

1. Find entries whose `paths` overlap your diff:
   `git diff --name-only <base>...HEAD`, then match against each entry's `paths`
   below.
2. Read those feature files and drive them, following the steps exactly.
3. Update each entry you drove, and only those:
   - it worked → set `verified: <sha> <date>`, fix any step you had to adjust,
     and record what you actually observed;
   - it failed because of your change → fix your change, not the entry;
   - it failed because the entry is out of date → correct the steps from what
     you observed, or set `unverified: failed at step <N> on <sha>`.
4. If your change added a feature, add an entry for it using the same format.
5. If you needed a feature with no entry, say that the feature map could be
   updated for it.

Record what you observed, never what the code implies.

## Features

| Feature | File                                     | Paths    | Status                 |
| ------- | ---------------------------------------- | -------- | ---------------------- |
| <Name>  | [features/<slug>.md](features/<slug>.md) | `<glob>` | verified `<short sha>` |

Verified: <N>/<M>

## Findings

- <What blocks reliable driving, and the smallest code change that fixes it>
  (`<receipt>`)
```

## Feature entry

`features/<slug>.md`:

```markdown
---
feature: <slug>
title: <Name a user would use>
platform: <web | cli | api | macos>
paths: [<glob>, ...]
regions: [<whiteboard region slug>, ...] # optional
status: 'verified: <full sha> <YYYY-MM-DD>' # quoted: the value contains a colon
---

# <Name>

<One sentence: what a user can do here.>

## Reach

<How a user gets here from the app's starting point, as steps.>

## Drive

1. <step in the driver's vocabulary>
2. ...

## Expect

- <observable result: text shown, response shape, exit code and output>

## Gotchas

- <loading waits, auth redirects, feature flags, ordering, flaky elements>
```

## Status markers

| Marker                                  | Meaning                                         |
| --------------------------------------- | ----------------------------------------------- |
| `verified: <sha> <date>`                | Every step was driven and the result observed   |
| `unverified: <reason>`                  | Not driven: credentials, data, or no driver     |
| `unverified: failed at step N on <sha>` | Was verified; a later drive failed at that step |

In frontmatter, always quote the status value, since every marker contains a
colon.

An entry is **stale** when its `paths` changed since its verified SHA. Stale
entries keep their marker; the index and refresh treat them as due.
