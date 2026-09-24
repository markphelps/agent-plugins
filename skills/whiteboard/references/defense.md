# Defense sessions

The standard comes from Mitchell Hashimoto's whiteboard defense: the user should
be able to explain any system they ship, and defend the decisions in it, without
line-level familiarity. Exact function names don't matter. Knowing why X was
chosen over Y, where it fails, and what a malicious actor could do does.

## Contents

- Question types
- Core questions and passing
- Running a session
- Grading
- Hints
- Inferred and unexplained decisions
- Write-backs
- Ending a session

## Question types

Every question belongs to one of four types, taken from the whiteboard defense
itself. Balance them across a session.

| Type          | Shape                                         | Example                                                              |
| ------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| `trade-off`   | Why X instead of Y?                           | Why does evaluation read from a cache instead of the store directly? |
| `adversarial` | What happens if this actor behaves badly?     | A client sends a context with 10,000 attributes. What happens?       |
| `data`        | What structure was used here, and why?        | How are rules ordered, and why not by insertion?                     |
| `failure`     | Where does this break, and what happens then? | The store is unreachable for five minutes. What do clients see?      |

Ask about behavior and reasoning, never recall trivia ("what's the function
called that..."). If the user could answer it by grepping, it's the wrong
question.

## Core questions and passing

When a region is first defended (or its `mapped_at` differs from `derived_from`
in the defense file), derive its core questions from the map: one or two per
major decision and per failure mode or trust boundary in the region file,
typically four to eight total. Each must be answerable from the map, and each is
tagged with its type. Core questions need ground truth to grade against:
questions about _why_ need `documented`, `historical`, or `stated` evidence, and
questions about _behavior_ (most failure, adversarial, and data questions) need
a file receipt showing what the code actually does. Inferred rationale never
becomes a core question.

A region is **passed** when every core question has been answered correctly at
least once without a hint. Answers given after a hint count as progress in the
log but don't pass the question.

After a refresh, re-derive. A question whose underlying decision and code didn't
change keeps its pass mark; a changed one resets.

## Running a session

1. Read the region file and its defense file. If the defense file doesn't exist,
   create it with derived core questions.
2. Tell the user in one line which region, how many core questions remain, and
   that they can say "stop" anytime.
3. Ask **one question at a time** and wait for the answer. Start with unpassed
   core questions, prioritizing gaps from the last session, then follow-ups.
4. After each answer, grade it (below), give short feedback with receipts, and
   choose the next question from the frontier: if the answer revealed a gap,
   drill into that branch with a narrower question before moving on; if it was
   solid, move to the next core question.

Don't show the map during the session. The point is recall. Link files in
feedback only after the user has answered.

## Grading

Grade each answer as one of:

- **Correct:** captures the real reason or behavior, even loosely worded.
- **Partial:** right direction, missing a load-bearing piece. Name the piece.
- **Wrong:** contradicts the code or the evidence. Say what's actually true,
  with the receipt.
- **Don't know:** offer a hint (below).

Be generous about wording and strict about substance. "It caches so the store
isn't a bottleneck" is correct even if the evidence says "to keep p99 latency
flat under load." "It caches because the store is slow" when the store is fast
and the reason is availability is wrong.

After a partial or wrong answer, decide whether the user misunderstood or the
code misled them. If a reasonable reader of the code would reach the same wrong
answer (misleading name, stale comment, surprising indirection), add a
`defense-exposed` friction entry to the region file describing what misled them.
That's a finding about the code, not a mark against the user.

## Hints

When the user is stuck, offer a multiple-choice hint rather than the answer:
three or four options, exactly one correct, with distractors that are plausible
designs someone could have chosen (not jokes). An answer chosen from a hint is
logged but doesn't pass the question. If they're still stuck after the hint,
explain the answer briefly with receipts and log it as a gap.

## Inferred and unexplained decisions

Decisions tagged `[inferred]` or logged as `unexplained` have no ground truth,
so don't grade them. Frame them as a defense instead: "The code does X. I can't
find a recorded reason. Defend it, or tell me why it's wrong." Then engage with
their answer on its merits: does it hold up against the code, what would break
it, what would the alternative have cost.

These are optional extras in a session, after core questions, and are often the
most valuable part for repos the user owns.

Suspected bugs with a `refuted` verdict make excellent `adversarial` questions,
because the code looks wrong and isn't: "Two `Sync` calls can overlap here. Why
isn't that a race?" The verdict's evidence is the ground truth, so these can be
core questions. Entries still `unverified` or `unclear` are framed like inferred
decisions: ask the user whether it's a real bug and why, and don't grade.

## Write-backs

When the user gives a rationale for an inferred or unexplained decision that
holds up, ask before saving: "Save this as the recorded reason in the map?" Only
on a clear yes:

- replace the `[inferred]` tag (or remove the `unexplained` friction entry) with
  the rationale and `[stated: <date>]`,
- note it in the defense log.

If they're unsure, don't save; a guess recorded as `stated` is worse than an
honest gap. Never write stated rationale for a correct answer to a core
question, since that decision already has evidence.

## Ending a session

End after about ten questions, when the user says stop, or when every core
question is passed. Then:

1. Update the defense file: pass marks, gaps, a dated log entry, and `status`.
2. Add any `defense-exposed` friction to the region file.
3. Summarize in chat in a few lines: questions asked, passed so far out of the
   total, the one or two concepts worth revisiting, and whether the region is
   passed. If it is, suggest the next region or an Unexplored zoom.
