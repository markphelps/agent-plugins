---
name: codebase-landing-copy
description:
  Write or improve landing-page marketing copy for a product by reading its
  codebase, so every claim is backed by code that actually ships. Produces a
  scannable page (hero, how it works, features, who it's for) that lets a
  first-time visitor understand the product in under 10 seconds, plus an
  evidence table mapping each claim to the file that proves it. Use this
  whenever the user wants landing page copy, homepage copy, a product pitch, a
  hero section, feature bullets, a "what is this" blurb, or App Store / Product
  Hunt listing copy, or asks to rewrite, tighten, or fact-check existing
  marketing copy for an app, CLI, library, or SaaS whose source code is
  available, even if they don't say "landing page." Also use when the user asks
  "is my site overselling?" or "what does this product actually do?" for a repo.
  For an open source repo's README positioning, use oss-marketing instead.
---

# Codebase → Landing Page Copy

Landing copy fails in two opposite ways: it's vague ("the modern platform for
teams") so nobody gets what the product is, or it's aspirational ("AI-powered
insights") and promises things the code doesn't do. This skill avoids both by
treating the codebase as the source of truth and the visitor's first 10 seconds
as the target. The code decides _what_ can be said; marketing craft decides
_how_ it's said.

## The one hard rule

**Every product claim must trace to code that ships to users.** You can
rephrase, compress, reorder, and dramatize — you cannot add capabilities. If you
can't point to the file, function, route, config option, or UI string that makes
a claim true, the claim doesn't go on the page.

This matters because a landing page is a promise. An invented feature costs the
maintainer a trust hit (or a refund, or an angry issue) the first time a user
looks for it. Being precise here is what makes the copy safe to publish without
a second review pass.

What counts as evidence, and what doesn't — see `references/evidence.md` before
starting the audit. The short version:

- ✅ Shipped: reachable code paths, registered routes/commands/menu items, UI
  strings, public API exports, documented config options wired into behavior,
  integrations with real client code.
- ❌ Not shipped: TODO/FIXME, stubs that throw "not implemented", code behind a
  flag that defaults off, test-only fixtures, dead code with no caller, roadmap
  sections in the README, open issues, branch names, commented-out code.
- ⚠️ Ambiguous (ask the user): beta flags, experimental modules, features gated
  to a paid tier, anything that's wired up but looks unfinished.

## Scope

This skill writes copy for a product's own landing page, homepage, or store
listing. For positioning an open source repo's README (Show HN launch, star
conversion, comparison tables), use `oss-marketing`. The evidence ledger below
still applies if you are asked to fact-check README claims.

## Workflow

### 1. Orient (read, don't write yet)

Figure out what kind of product this is and who uses it. Look at, roughly in
this order:

1. README, package manifest (`package.json`, `Cargo.toml`, `go.mod`,
   `pyproject.toml`, `Package.swift`, `*.xcodeproj`), and any existing landing
   page / marketing site in the repo (`site/`, `www/`, `docs/`, `landing/`).
2. **Entry points** — what a user actually touches: CLI command definitions,
   HTTP routes, UI views/screens, menu items, public exports, onboarding flow.
3. **User-facing strings** — button labels, empty states, onboarding copy,
   settings labels, error messages. These are gold: they're already written in
   the product's voice and they prove the feature exists.
4. Integrations — HTTP clients, SDK imports, auth providers, file formats
   read/written.
5. Config/settings schema — each user-facing option is a capability.

Don't read the whole repo. Follow entry points outward until you can answer:
_what does a user do with this, and what happens?_

If the user supplied existing copy to improve, read it now too — you'll
fact-check it in step 2.

### 2. Build the evidence ledger

Write a working list of candidate claims, each with its proof. This is the
backbone; the copy is written from it, not from memory.

```
| Claim (plain language)                  | Evidence                                   | Status   |
|-----------------------------------------|--------------------------------------------|----------|
| Summarizes articles with a local model  | Sources/Summarizer.swift: summarize()      | shipped  |
| Imports OPML                            | Sources/Import/OPMLImporter.swift          | shipped  |
| Syncs across devices                    | README roadmap only                        | NOT SHIPPED |
| Team workspaces                         | flag `teams_enabled` defaults false        | ASK      |
```

For **improving existing copy**: add every claim from the current page to the
ledger and mark it. Unbacked claims in existing copy are the most valuable thing
you'll find — surface them prominently rather than silently dropping them.

Also note concrete, countable facts the code supports (number of integrations,
supported formats, platforms, "no account required" if there's genuinely no
auth). Specifics beat adjectives. Only use numbers you counted; never estimate
performance, speed, or scale unless there's a benchmark in the repo — and cite
it.

### 3. Find the one-sentence answer

Before writing sections, write the sentence a visitor should walk away with:

> **[Product] is a [category the visitor already knows] that [does the core job]
> for [who].**

Pick the core job by asking: if the product did only one thing, what would it
be? That's usually the path the entry points converge on. Everything else is a
supporting feature.

Use a category the visitor already has a mental slot for ("an RSS reader", "a
feature flag service", "a menu bar app") — novelty in category naming costs the
visitor seconds they won't spend.

### 4. Write the copy

Structure, top to bottom. Every section is optional except the hero; drop any
section you can't fill with backed claims rather than padding it.

**Hero (the 10-second zone)** — this alone must answer _what is it, who's it
for, why care_.

- **Headline** (≤ 10 words): the outcome or core job. Concrete verbs, no
  "revolutionize/supercharge/unlock/seamless/next-gen".
- **Subhead** (1 sentence, ≤ 25 words): the one-sentence answer from step 3,
  made specific.
- **Primary CTA**: the actual first action the product supports (Download for
  macOS / `brew install x` / Start free / Get the CLI). Pull the install command
  from the repo, don't invent one.
- Optional: 3 proof bullets directly under the subhead — the three strongest
  shipped capabilities.

**How it works** (3 steps max) — the real user flow from the entry points: e.g.
_Connect → Configure → Get X_. Each step is a short bold label + one line.

**Features** — 4–8 items. Each is:

- a bold benefit-first label (3–6 words), then
- one line saying what it does, concretely. Lead with the user's outcome, then
  the mechanism: "**Catch up in minutes** — Every article gets a short summary,
  generated on your Mac." Order by what a new visitor cares about most, not by
  code structure.

**Who it's for** — only if the code or README signals a clear audience. 2–3
bullets.

**Details / FAQ** — for real differentiators the code proves: open source
(license file), self-hosted, offline, privacy (no network calls / no telemetry —
verify!), platform support, pricing tier gating. Privacy and "no telemetry"
claims especially need a real check of network code.

**Closing CTA** — repeat the primary CTA.

### 5. Style rules for skimmability

- Short paragraphs: 1–2 sentences, never more than 3.
- Bullets over prose for anything list-shaped. Bold the first few words of each
  bullet so a skimmer reading only bold text still gets the pitch.
- Plain words over jargon; product-specific terms only if the visitor must learn
  them to use the product.
- Second person ("you"), active voice, present tense.
- Cut every sentence that would be equally true of a competitor.
- No superlatives you can't prove ("fastest", "best", "most secure").
- Match tone to the audience: dev tools are terse and code-forward (show a
  command); consumer apps are warmer and outcome-first.

### 6. Self-check before delivering

Run these checks and fix failures before showing the user:

1. **10-second test**: read only the headline + subhead. Could a stranger say
   what it is and who it's for? If not, rewrite them.
2. **Bold-only test**: read only the bolded text top to bottom. Does it tell the
   story?
3. **Evidence test**: every claim on the page has a row in the ledger marked
   shipped. Nothing marked NOT SHIPPED or ASK appears in the copy.
4. **Swap test**: replace the product name with a competitor's. Any sentence
   that still reads true is filler — sharpen or cut it.

## Output format

Deliver in this order:

1. **The copy** — as Markdown, ready to paste, using the section structure
   above. If the user has a site in the repo (HTML/JSX/MDX), offer to write it
   into their actual files, preserving their component structure.
2. **Evidence table** — every claim on the page → file/symbol that backs it.
   Keep it compact; this is what lets the user trust the copy without re-reading
   the code.
3. **Left out** — capabilities found but excluded, with the reason (not shipped
   / flagged off / ambiguous). For ASK items, ask the user to confirm in one
   list rather than one question at a time.
4. **Existing-copy corrections** (only when improving a page) — claims on the
   current page that the code doesn't support, with what the code actually does.
5. Optionally, 2–3 alternate headlines with a one-line note on the angle each
   takes.

## Example

Input: a Swift macOS RSS reader repo with OPML import, per-article AI summaries
via a local model, keyboard shortcuts, and a README "Roadmap: iCloud sync".

Good hero:

> # Read less. Know more.
>
> Cove is an RSS reader for Mac that summarizes every article with an AI model
> running on your machine.
>
> - **Summaries on every article**, generated locally
> - **Bring your feeds** — import any OPML file
> - **Keyboard-first** — triage your inbox without the mouse

Not allowed: "Sync across all your devices" (roadmap only), "Lightning-fast" (no
benchmark), "Smart recommendations" (no code).
