---
name: oss-marketing
description:
  Run a marketing/positioning pass on an open source repo's README and
  public-facing docs so a developer landing on it for the first time immediately
  understands what it is, why it exists, and how to use it. Use this whenever
  the user wants to improve a repo's README, write launch copy for an OSS
  project, sharpen positioning ("does this README explain what the project
  does"), prep a repo for a Show HN / Hacker News / Product Hunt / Twitter
  launch, or asks for an "OSS marketing pass," "README audit," or similar. This
  is about clarity and conversion (visitor → user → star), not contribution
  mechanics — for CONTRIBUTING.md, issue templates, CODEOWNERS, or governance
  docs, that's a different concern.
---

# Open Source Marketing Pass

A README is a landing page, not documentation. Most visitors give it about ten
seconds before deciding to scroll past, star it, or actually try it. The job of
this pass is to make sure that in those ten seconds, a developer who has never
heard of the project understands three things — **what is this, why does it
exist, how do I try it** — and can act on the third one immediately. Everything
else is secondary.

This draws on patterns from repos that consistently convert well: Vite,
shadcn/ui, tRPC, Excalidraw, Supabase, Caddy, the Rust CLI trio
(bat/ripgrep/fd), and Sentry.

## Workflow

1. **Read the current README and skim the repo** (package manifest,
   screenshots/demo assets already in the repo, existing docs site if any) to
   understand what the project actually does and who it's for. Don't invent
   positioning — extract it from the code and existing docs, then sharpen it.
2. **Diagnose against the checklist below.** For each section, name what's
   there, what's missing, and — this matters more than presence/absence — what's
   _unclear_. A comparison table that exists but doesn't actually differentiate
   the project is a bigger problem than a missing one.
3. **Ask about anything you can't infer**: who's the target user (this changes
   vocabulary — "developers building X" vs "teams running Y in production" read
   very differently), what's the honest comparison set, whether there's a
   hosted/demo version to link to.
4. **Rewrite in priority order** — the hook and quickstart first, since those
   are what most visitors will actually read. Don't restructure a whole README
   when the ask is just "sharpen the one-liner."
5. **Show before/after** for the hook and description specifically — these are
   the highest-leverage, most opinion-laden lines, and the user should see the
   tradeoff being made, not just receive a rewrite.

## The ten-second test

Before anything else, apply this to the current README: if someone read only the
project name, the first paragraph, and looked at the first image, could they
answer —

- What does this do?
- Who is it for / what problem does it solve that they'd recognize having?
- What do I do right now if I want to try it?

If the answer to any of these is "not really," that's the priority fix, full
stop — ahead of badges, ahead of a table of contents, ahead of everything in
Tier 2 below.

## Tier 1 — the hook (first screen, no scrolling)

- **The name and tagline.** The tagline should describe the _outcome_, not the
  tech stack. "A fast, reactive framework built with Rust and WASM" tells a
  visitor what it's made of, not what it's for. Compare Vite's positioning
  around dev-server speed and instant HMR versus a generic "a build tool" — the
  former gives a visitor an immediate reason to care.
- **The first paragraph answers "why does this exist."** The strongest pattern
  here is naming the specific pain the project removes, ideally one the reader
  has personally felt. If the project exists because an alternative is slow,
  expensive, closed, or awkward to use, say that plainly — that's the actual
  value prop, not a feature list. Don't bury it under a wall of badges.
- **A visual, if the project has a UI or visible output.** A GIF or screenshot
  placed right after the hook communicates in one glance what would take several
  sentences — this is the single highest-leverage addition for anything with a
  visual component (a CLI's terminal output counts). For a pure library/API with
  nothing to look at, a short code sample does the same job — show the _smallest
  possible usage_, not a kitchen-sink example.
- **Quickstart within the first screen or two.** One command to install, one
  command to run, in that order, copy-pasteable, no preamble. If it takes more
  than 3-4 commands to get to "I see it working," that's a positioning problem
  even if the software itself is fine — consider whether a hosted demo,
  playground link, or `npx`-style zero-install path can shortcut this.

## Tier 2 — establishing trust and differentiation

- **"How is this different from X"** — if there's an obvious alternative a
  visitor is already thinking of, address it head-on rather than making them
  guess. A short comparison table or a paragraph of honest positioning ("X is
  great for Y, this project trades that for Z") reads as confident, not
  defensive. Silence on an obvious comparison reads as either unawareness or
  evasiveness, both bad.
- **Social proof, used sparingly and honestly.** Star count, "used by" logos, or
  a star-history chart signal momentum, but only add these once they're actually
  flattering — an empty "used by" section or a flat star-history chart is worse
  than omitting it. Don't fabricate or imply adoption that isn't real.
- **Feature list, if included, should read as benefits not a spec sheet.**
  "Zero-config" beats "no configuration file required" — same fact, one is
  written for a skimming reader. Keep it short; a wall of feature bullets loses
  the reader faster than it convinces them. A brief table works better than long
  bullets when there are more than ~5 items.
- **Badges that answer a real question**, not decoration: build status (does it
  still work), license (can I use this), version (is it maintained), maybe a
  chat/community link. Skip anything a visitor wouldn't actually wonder about.

## Tier 3 — depth, kept out of the way

- **Everything past "how do I use this" belongs below a fold or in linked
  docs**, not inline in the README: full API reference, architecture
  explanation, advanced configuration, FAQ. Link out with a one-line description
  of what's there rather than dumping it in-page — a README that keeps scrolling
  past the quickstart dilutes the hook.
- **A docs site vs. a long README** — once the project has more than one
  audience (e.g. end users and plugin authors) or more than ~1500 words of real
  content, a dedicated docs site (even just a `/docs` folder rendered via GitHub
  Pages) usually serves both the skimming visitor and the deep reader better
  than one increasingly long README trying to be both.
- **Changelog / release notes**, linked not inlined — relevant to someone
  deciding whether the project is actively maintained, but not to the
  first-ten-seconds read.

## Writing the actual copy

- Lead with outcomes and pain points, not implementation. Mention the tech stack
  (language, framework) after the pitch, not instead of it — it's a secondary
  signal for the reader who's already interested, not the hook.
- Write the tagline and first paragraph for someone who has never heard of the
  project and doesn't yet know they need it — not for someone who already
  searched for this exact solution.
- Prefer specific claims over vague ones: "parses a 10k-line file in under
  200ms" beats "blazing fast"; "one binary, no dependencies" beats "easy to
  use." Specificity reads as credible; adjectives read as marketing.
- Match voice to audience — a CLI dev-tool for other developers can be terse and
  code-forward; a project aimed at less technical users needs more scaffolding
  and fewer assumptions.
- Don't inflate. Overclaiming ("the only," "the best") erodes trust with the
  exact audience (developers) who are quickest to spot it and least forgiving of
  it.

## Output

Show the current hook/tagline/first-paragraph alongside the proposed rewrite so
the user can see the actual positioning decision, not just accept a diff. For
the rest of the README, either propose a restructured version inline or write
directly to `README.md` depending on scope — ask if it's ambiguous whether this
is a light copy pass or a full restructure. Flag anywhere you had to guess at
positioning (target user, honest competitive set, what to claim about
performance/adoption) rather than asserting it as fact.
