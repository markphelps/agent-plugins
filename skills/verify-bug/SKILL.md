---
name: verify-bug
description:
  Decide whether claimed bugs are real by running an adversarial hearing on each
  claim — a Prover argues it's reachable, a Skeptic hunts for what prevents it,
  and an independent Referee rules confirmed, refuted, or unclear — with an
  isolated repro test when that's cheap. Use when the user asks whether a bug is
  real, wants findings or review comments verified, asks if a reported issue
  reproduces, or points at suspected bugs from a codebase map. Accepts pasted
  claims, code-review comments, GitHub issues, or `suspected-bug` entries in
  `docs/map/`. Does not hunt for new bugs, and never fixes code; don't use it
  for ordinary debugging of a known failure or for general code review.
---

# Verify bug

Turn claimed bugs into verdicts you can act on. A claim is a lead, not a fact:
code that looks wrong is often protected by validation in another file, a
framework guarantee, a lock, a type, or configuration. And real bugs described
vaguely get dismissed. This skill gives every claim a fair hearing with an
advocate on each side, then records the verdict with its evidence.

## Hard rules

- **Never modify the user's working tree.** Reads happen anywhere; repro tests
  happen only in a throwaway `git worktree` (see "Reproduction").
- **Never fix bugs, open issues, or post comments on your own.** Posting a
  verdict back to GitHub requires the user's explicit confirmation for that
  specific post.
- **No verdict without receipts.** Every argument must point at code
  (`path:line` or `path:Symbol`). Arguments without receipts are discounted.

## Workflow

1. **Collect claims** from the source the user gave (see "Sources").
2. **Normalize** each into a claim record (below).
3. **Dedupe:** merge claims that point at the same code path with the same
   trigger. Agents often report one root cause several ways; keep the clearest
   scenario and list the merged sources.
4. **Rank** by severity _if true_: data loss or corruption, security, silent
   wrong results, crashes or outages, degraded behavior, cosmetic. Don't try to
   judge likelihood here; that's what the hearing is for.
5. **Cap:** verify the top 10 by default. If more remain, say how many and let
   the user pick or raise the cap. Unverified claims keep an `unverified`
   verdict; nothing is silently dropped.
6. **Hear** each claim (see "The hearing").
7. **Record** verdicts (see "Output") and summarize in chat.

### Claim record

```markdown
- id: <short slug>
- source: <map path | issue URL | review comment URL | pasted>
- claim: <one-line statement of what goes wrong>
- scenario: <the concrete trigger: input, interleaving, config, or sequence>
- receipt: <path:line or path:Symbol where it supposedly goes wrong>
- severity-if-true: <data | security | silent-wrong | crash | degraded |
  cosmetic>
- verdict: unverified
```

If a claim has no concrete scenario ("this might be racy"), ask the Prover to
construct one as its first job. If it can't, the verdict is
`unclear: no concrete trigger`.

## Sources

| Source                         | How to read it                                         | Where the verdict goes                    |
| ------------------------------ | ------------------------------------------------------ | ----------------------------------------- |
| `docs/map/*.md` friction lists | `suspected-bug` entries in "Open questions & friction" | In place, replacing `verdict: unverified` |
| GitHub issue or PR comment     | `gh issue view`, `gh pr view --comments`, or the API   | Report file; draft reply on request       |
| Pasted list or review output   | The conversation                                       | Report file                               |

For map entries, keep the entry's wording and replace only the verdict slot.
Preserve any existing verdict unless the code at its receipt has changed since
it was recorded.

## The hearing

Run three roles per claim. When the harness supports subagents, run each role in
its own isolated context, because an agent that has read the claim's framing, or
another role's reasoning, anchors on it. Pass only what each role needs. Role
briefs, including exact output formats, are in `references/roles.md`; read it
before the first hearing.

1. **Prover** — gets the claim record and repo access. Builds the strongest case
   that the bug is reachable: the entry point, the path through the code, the
   state at the failure point, and the observable effect. May attempt a repro
   (see "Reproduction").
2. **Skeptic** — gets the claim record and repo access, _not_ the Prover's
   output. Hunts for anything that prevents the bug: upstream validation,
   framework or language guarantees, locks and ordering, types, config defaults,
   dead code paths, or the claim simply misreading the code.
3. **Referee** — gets the claim record, both structured outputs, and repo
   access. Checks each receipt, weighs the arguments, and rules.

Run hearings for different claims in parallel when possible; the three roles for
one claim run Prover and Skeptic in parallel, then Referee.

**Without subagents**, run the roles sequentially yourself: write the Prover
case, then deliberately set it aside and write the Skeptic case from the claim
alone, then referee. Tell the Referee step to discount any argument without a
receipt, since sequential roles bleed into each other.

### Verdicts

| Verdict                     | Meaning                                                              |
| --------------------------- | -------------------------------------------------------------------- |
| `confirmed (reproduced)`    | A failing test in an isolated worktree demonstrates it               |
| `confirmed (static)`        | A complete trigger path with receipts, and no valid prevention found |
| `refuted: <why>`            | Something concrete prevents it, with a receipt                       |
| `unclear: <what's missing>` | Neither side made its case; say what would settle it                 |

Prefer `unclear` over a forced call. A wrong `refuted` buries a real bug, and a
wrong `confirmed` wastes someone's afternoon; `unclear` with a precise "what's
missing" is useful.

## Reproduction

A failing test is the strongest evidence and the start of a fix, so the Prover
should attempt one when it's cheap: the repo has a working test command, the
trigger can be expressed as a unit or integration test, and no external services
are needed.

1. Create an isolated worktree on a scratch branch inside the excluded
   `.verify/` directory:
   `git worktree add -b verify-bug/<id> .verify/worktrees/<id> HEAD`
2. Write the smallest test that should fail if the bug is real, and run only
   that test with the repo's own test command, from inside the worktree.
3. Save the test as a patch. New files are untracked, so stage first:
   `git -C .verify/worktrees/<id> add -A && git -C .verify/worktrees/<id> diff --cached > .verify/patches/<id>.patch`
4. Remove the worktree and branch:
   `git worktree remove --force .verify/worktrees/<id> && git branch -D verify-bug/<id>`

A test that fails for an unrelated reason (compile error, missing fixture)
proves nothing; fix the test or fall back to a static argument.

**Ask the user once before** installing dependencies, starting services or
containers, making network calls, or running anything other than the repo's own
test command. Concurrency bugs, external-service bugs, and UI bugs are usually
not cheap to reproduce; don't force it.

## Output

Every run writes a local report, plus in-place verdicts for map sources.

- **Report:** `.verify/<YYYY-MM-DD>-<slug>.md`, with patches in
  `.verify/patches/`. On first run, before creating any worktree, add `.verify/`
  to `.git/info/exclude` so nothing lands in the repo's tracked files. The
  report lists every claim (including capped, unverified ones) with its verdict,
  the Prover's trigger path, the Skeptic's prevention argument, the Referee's
  reasoning, and any patch link. Use the template in `references/roles.md`.
- **Map sources:** replace `verdict: unverified` with the verdict and a one-line
  reason, plus a link to the report. For example:

  ```text
  verdict: refuted: Sync holds mu across the check (sync/engine.go:88); see .verify/2026-09-24-sync.md
  ```

  The report path is local, so keep the one-line reason self-sufficient.

- **GitHub sources:** after the summary, offer to draft a reply for each
  verified issue or comment. Show the draft; post only after the user confirms
  that post. Keep replies factual: verdict, trigger path or prevention, and the
  repro test inline if one exists.

### Chat summary

Keep it short: counts by verdict, then one line per confirmed bug (claim,
severity, reproduced or static, patch link), then refuted and unclear claims in
a compact list. Mention how many claims were capped. When confirmed bugs exist,
say they're ready to fix and that the repro patch is the first half of the fix.
Don't restate the report.
