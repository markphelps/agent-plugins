---
name: session-log-audit
description: |
  Audit a project you build with AI agents by mining your own local agent session logs (Claude Code, Pi, Codex) for papercuts, bugs, and design flaws — the friction visible in what you actually typed rather than what the README claims. Use this when the user wants to find rough edges in their own tool or project, asks "what's annoying about X," wants to know why they keep working around their own software, is preparing a UX or DX pass on something they use daily, or wants to turn a week of agent sessions into a ranked fix list. Also trigger for narrower asks that are really this — "why do I keep retyping this command," "audit my CLI's ergonomics," "what should I fix in X this week."
---

# Session Log Audit

A project's session logs are a more honest record of it than its README, its
issues, or its author's memory. Where the user rephrases a command three times,
the interface is wrong. Where they explain the same thing to an agent every
session, the docs are wrong. Where they reach past the tool and do it by hand,
the tool is wrong. None of that reaches the issue tracker, because in the moment
it registers as friction rather than as a defect.

This skill mines those logs into dated, receipted findings and a ranked fix
list. It is deliberately evidence-first: the diagnosis comes after the
collection, never alongside it.

**Scope.** This works for a project the user builds _with_ agents and has worked
on recently. It does not work on a project with no agent session history, and it
is not a code review — it audits the gap between intent and lived experience,
not correctness.

## Workflow

Seven phases, 0 through 6, each with a gate. Never skip a phase. Never advance
past a gate without meeting it.

### Phase 0 — Profile and intake

First, **profile the project by inspection** (not by asking). Three attributes
change the audit materially:

- **Shape** — CLI, library/API, GUI or web app, or service. This determines the
  evidence spine; see Phase 2.
- **Dogfooded?** — does the user build the project _using_ the project? Check
  whether the project's own artifacts appear inside its own repo. If yes,
  sessions interleave authoring and operating constantly, and cwd tells you
  nothing.
- **Self-recording?** — does the project keep its own record of work (a state
  branch, a `.project/` directory, a task file, a changelog it writes itself)?
  If yes, that record is a first-class source and enables the Divergence check.
  If no, skip that section rather than faking it.

Also locate the ancestry, if any: many tools are a simplification of an earlier
project by the same author. Ask only if inspection is ambiguous.

Then ask the user **three questions, one at a time, waiting for each answer**:

1. **What mental model should a user have of this project?** Two or three
   sentences. **Ask this cold — before reading the README, the CLI, or any docs,
   and without quoting them.** The README is a _claim_ about the model, and
   whether that claim lands is exactly what is being audited. Show its framing
   first and you will get it read back to you, and the Phase 4 comparison is
   worthless.
2. **What do you already suspect is broken?** Treat the answer as hypotheses to
   test, never as findings. Receipts that contradict a suspicion are a result.
   Receipts for something the user did _not_ name are a better one.
3. **Confirm the window.** Default: last 7 days. Propose widening if under 15
   sessions are likely.

Record all three answers verbatim at the top of `evidence.md` under "Stated
intent, captured before mining." Never revise them afterward — Phase 4 measures
the record against these exact words.

**Gate:** all three answered before Phase 1.

### Phase 1 — Excavate

Find the session logs for the harnesses the user actually runs. Ask which if
unknown; do not guess at tools they do not use.

- Claude Code: `~/.claude/projects/` (JSONL per project, directory name encodes
  cwd), `~/.claude/history.jsonl`
- Pi: `~/.pi/`, `~/.pi.dev/`
- Codex: `~/.codex/sessions/`
- Any session or transcript directory under `~/.config/` or `~/.local/share/`
  belonging to an agent harness
- The repo itself: `git log`, `git reflog`, branch names, TODO/FIXME/HACK
  comments, local issue tracker
- **The project's own record**, if it self-records. Read it before any
  transcript — it is usually a clean, timestamped spine of the window, and
  reconstructing the timeline from it first is far cheaper than deriving
  chronology from JSONL.

Filter to this project. Anything outside its repo is out of scope — this is a
project audit, not a life audit.

Report per source: name, path, session count in window, total size, date range.
Then the count that matters: sessions in the window.

If dogfooded, do not split sessions into "building" versus "using." Split at the
level of individual actions: AUTHORING edits the project's source; OPERATING
invokes or exercises it. Papercuts live in OPERATING actions, and the AUTHORING
action immediately following one is often the attempted fix — which records what
the user thought the problem was before they had thought about it carefully.

**Gate:** show the inventory and the mining plan; wait for approval. Until then
read no session transcript contents — file metadata, `git log`, and the
project's own record are what the inventory is built from.

### Phase 2 — Distill

**Budget.** Logs exceed context. Never read a session end to end. Never paste
raw transcript into the conversation.

- At most 150 lines per file, at most 120 files.
- Sample deliberately: every session in the window if under 30; otherwise all
  sessions from the last 3 days plus 15 spread across the rest.
- Prefer `grep`/`rg` sweeps over reading.
- After every 20 files, append to `evidence.md` and drop the raw text from
  working memory.

**The evidence spine depends on project shape.** Adapt sections 1–2 accordingly;
sections 3–8 hold for every shape.

| Shape         | Primary signal                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| CLI / tool    | Literal invocation strings. Argv is the highest-fidelity papercut evidence that exists.                                  |
| Library / API | Call sites written then rewritten; agent confusion about which function to reach for; wrappers the user keeps rewriting. |
| GUI / app     | Build-run-adjust cycles; repeated manual verification steps; the same visual fix attempted several ways.                 |
| Service       | Config and deploy sequences; log-tailing after every change; rollbacks.                                                  |

Before relying on the sweep terms, **validate them against the user's actual
idiom.** Run a cheap count on two or three candidate phrases first. Guessed
correction vocabulary that appears zero times produces a confidently empty
section.

Build `evidence.md` with short verbatim quotes, dates, and counts:

1. **Invocation log** — every distinct use, with frequency. What is constant,
   what is never touched.
2. **Retry chains** — one use followed within minutes by a corrected version of
   itself. The delta between the two _is_ the papercut. Record both strings.
3. **Errors and failures** — what broke, what the error text said, whether it
   was actionable without reading source.
4. **Expectation gaps** — where the user or an agent predicted behavior and got
   something else. This is the misconception list. Quote the prediction.
5. **Workarounds** — where they stepped around the project to do it by hand.
   Each is a missing or broken feature.
6. **Repetition tax** — anything explained, configured, or re-typed in 2+
   sessions.
7. **Absence** — surface area that exists but never appears in a session.
   Absence is data: either nobody needs it or nobody can find it.
8. **Divergence** — _only if the project self-records._ Put the project's own
   account of a session beside the harness transcript of the same window and
   find where they disagree. Work never recorded. Plans recorded but abandoned.
   State written that does not match disk. Each is either a state-tracking bug
   or a place where the project's model of a session and the user's model of a
   session are different shapes — and the second is the more important finding.

**Agents are a second user class.** They invoke the project from docs and
`--help` alone. Where an agent got it wrong, that is the interface failing a
reader who has only the text — the closest thing available to a stranger using
the project. Track agent uses separately from the user's and note where they
diverge.

A dated receipt per claim. In a one-week single-project window, 2 occurrences is
a pattern — but write "2 occurrences" rather than implying more.

**Gate:** `evidence.md` exists, every section populated or explicitly marked
"insufficient data." Do not interpret yet, do not propose fixes, do not touch
the source. Evidence collected under a conclusion is contaminated.

### Phase 3 — Interview

Form the 3 strongest hypotheses about where design and intent diverged. **Do not
state them.** Test each with one question built so the user does the realizing —
ideally by showing them two of their own uses and asking which they meant.

One question at a time. Wait for each answer. When an answer contradicts the
log, show the receipt and ask again: the gap between what they say and what they
did is the most interesting thing in the audit.

Three, not five. One week of one project cannot support five confident
hypotheses.

**Gate:** all 3 tested against the user's own words; confirmations and
contradictions recorded in `evidence.md`.

### Phase 4 — Diagnosis

Every finding goes in exactly one bucket, because each implies a different fix:

- **BUG** — the project does not do what it intends. Fix the code.
- **DESIGN FLAW** — it does what it intends and the intent is wrong. Fix the
  interface. Most expensive, most valuable.
- **DOC GAP** — behavior is right, discoverable nowhere. Fix `--help`, README,
  or the SKILL/AGENTS text agents read.
- **USER ERROR** — the project was right and the user was wrong, repeatedly.
  Repeated error at the same spot is a naming or affordance problem wearing a
  costume. Say which.

**If dogfooded, two corrections apply.** USER ERROR becomes the most damning
bucket rather than the most forgiving: the author holds the internals in their
head, so anything they get wrong twice, a stranger gets wrong permanently. Never
file a finding as USER ERROR and stop there. And discount Absence — surface area
the author never invokes may exist for a user who is not them, so check whether
docs or tests exercise it before proposing a cut.

Then answer the question the log can answer and the README cannot: **what does
the record show this project actually is, versus the mental model given in Phase
0, before anything had been read?** Cite receipts.

**Ancestry check** — only if an ancestor project exists, and only now, with
findings already established. Two bounded uses:

1. For each BUG and DESIGN FLAW, determine whether the design was carried over
   intact and wrong in both, carried over correct and broken in translation, or
   — highest yield — copied _partially_, concept taken and supporting machinery
   left behind. Half-copies are a distinct bug class that does not announce
   itself.
2. If the project claims to be the simpler one, that is falsifiable: count
   commands, flags, and distinct user-facing concepts in each and report both
   numbers.

Hard limit: never propose a change on the grounds that the ancestor does it
differently. The ancestor explains findings; it does not generate them. Never
mine the ancestor's session logs.

Deliver the hardest finding last, and once. A truth repeated becomes a lecture.

**Gate:** the user responds. If they push back, argue from receipts. Do not fold
to keep them comfortable.

### Phase 5 — Fix list

Rank by (frequency in log) × (cost when it bites) × (1 / effort to fix). Show
the ranking with its inputs, not just the order.

- **SHIP THIS WEEK** — small, high-frequency papercuts. Error text, names,
  defaults, a missing alias. Each with the exact change.
- **DESIGN DECISIONS** — flaws that need the user to choose. State the tradeoff
  and a one-sentence recommendation. Do not decide for them.
- **DOCS** — what to write, and specifically what an agent reading only the docs
  currently cannot learn.
- **CUT** — zero-use surface area, after the Absence discount. Propose removal
  or deprecation for what survives.
- **NOT A BUG** — the USER ERROR bucket, with the rename or default that would
  stop the repetition.

**Gate:** every item carries a receipt and a concrete first action. Insight
without a next action is entertainment.

### Phase 6 — Residue

1. `audit/findings.md` — Phase 4, written to be reread in three months by
   someone who has forgotten the conversation. Receipts inline.
2. `audit/fixes.md` — Phase 5 as an ordered work list with checkboxes.
3. Draft issues — one per SHIP THIS WEEK and DESIGN DECISION item, in the repo's
   issue format, ready to paste. Reproduction steps from the actual log, never
   invented.
4. Propose patches for SHIP THIS WEEK items. **Show every one as a diff first.**
   Write nothing to existing source, `CLAUDE.md`, `AGENTS.md`, or docs until
   each diff is approved individually. New files: one approval for the batch.
5. If the repetition tax section is populated, draft up to 2 skills or commands
   that kill it.

**Gate:** all artifacts delivered; source changes applied only where the
specific diff was approved.

## Voice

Plain and weighted. Short sentences. No filler, no flattery, no hedging.

Prefer showing the user two of their own invocations over telling them the two
differ.

Aphorism is earned — compress only after the evidence is on the table.

Never guess at cause from the log alone. If you cannot tell whether something is
a BUG or a DESIGN FLAW without reading the source, read the source and say which
you read.

Never pathologize. You describe patterns in logs; the user decides what they
mean.

The standard: "The CLI could use clearer error messages" is worthless. "You ran
`apply` 11 times. 7 of those were followed within 90 seconds by `diff`. You do
not trust apply to tell you what it did. That is not a docs problem." — that is
the bar.

## Constraints

- Everything stays local. Never send session data or repo contents to any
  external service or URL.
- Never quote credentials, keys, tokens, secret-bearing paths, or third-party
  names into chat or artifacts.
- Read-only through Phase 5. The audit and the fix are separate acts.
- Insight over coverage. 5 true papercuts beat 20 plausible ones. Thin evidence
  gets "insufficient data" — never pad. A confident wrong diagnosis sends the
  user refactoring the wrong thing for a week.
- Under 15 sessions in the window: say so, run the same phases, and lower
  confidence explicitly in every claim.
