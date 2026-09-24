# Docs write-back

`/whiteboard docs` turns what the map learned into a reviewable branch of doc
and comment fixes. The user's working tree is never touched, nothing is written
before the user picks changes, and nothing is pushed without an explicit yes.

## Contents

- Inputs and targets
- Is the map shared?
- The proposal
- The branch and the comment check
- Content rules
- The PR
- After the PR

## Inputs and targets

| Map input                                     | Usual target                                               |
| --------------------------------------------- | ---------------------------------------------------------- |
| `stale-doc`                                   | The doc that makes the claim, corrected in place           |
| `undocumented`                                | README, ARCHITECTURE.md, CONTRIBUTING, or `docs/`          |
| `confusing` (misleading comment or name)      | The comment or docstring at the receipt                    |
| `refuted` suspected bug                       | A comment at the line that looks wrong, explaining why not |
| `[stated]` rationale, `unexplained` decisions | Decision records (ADRs), handed off by wording             |
| The map itself, when shared                   | A pointer in AGENTS.md / CLAUDE.md                         |

Follow the repo's conventions over these defaults: if it already maintains
`docs/architecture.md` or a design-docs folder, update that rather than adding a
parallel file.

Never propose renaming code, even for a `confusing` name. That's a code change;
leave it in the friction log.

## Is the map shared?

Check on the branch the write-back targets (usually the default branch):

- `git ls-files docs/map` lists files → **shared**.
- Otherwise, or if `git check-ignore docs/map` matches → **not shared**.

If not shared and `.map/scout.md` has no recorded choice, ask once:

> The map isn't tracked in this repo. Include `docs/map/` in this PR, or write
> self-contained docs that don't link to it?

Record the answer in `.map/scout.md`. "Include" adds the map to the docs commit
and then treats it as shared.

## The proposal

List every candidate change in chat, grouped by target file:

```text
README.md
  1. Fix: says config is YAML-only; TOML is also supported   (stale-doc, config.md)
  2. Add: short "How it's built" section linking to the map  (undocumented, index)
internal/sync/engine.go  [comment]
  3. Explain why the double-check isn't a race               (refuted, sync-engine)
AGENTS.md
  4. Add pointer to docs/map/ for architecture               (map shared)
```

Then the handoff line if ADR-shaped items exist. Wait for the user to pick ("all
but 3", "only README"). Don't write anything until they do.

## The branch and the comment check

1. Create the branch from the target branch (usually the default branch), not
   from whatever is checked out:
   `git worktree add -b docs/whiteboard-<YYYY-MM-DD> .map/worktrees/docs <target-branch>`.
   `.map/` is already excluded, so the worktree stays out of the tracked tree.
2. **Commit 1, docs:** doc files only (and `docs/map/` if the user chose to
   include it).
3. **Commit 2, comments:** source-file comment and docstring changes only.
   Before committing, run `git diff --cached -U0` and inspect every changed
   line. Reject the commit if any added or removed line is not entirely a
   comment or docstring in that file's language, including whitespace-only code
   changes. Fix the offending hunk and check again; if it can't be made
   comment-only, drop that change and tell the user.
4. Remove the worktree after pushing or when the user declines to push; the
   branch stays.

Skip commit 2 when no comment changes were selected.

## Content rules

**Stale claims:** correct them in place, matching the surrounding voice and
length. Don't rewrite the section around them.

**Missing docs, map shared:** a few sentences that rarely go stale (what the
system is, its major parts, where to go next), plus a link to the relevant map
region for depth. The map stays the single deep source because it's the one with
staleness detection. Add a one-line pointer in AGENTS.md / CLAUDE.md so future
agents start from the map.

**Missing docs, map not shared:** self-contained sections with no links to
`docs/map/` and no AGENTS.md pointer. Write them fuller, since they're the only
copy anyone else will see, but keep to what the map has evidence for.

**Comments:** explain why, not what, and only where the map has evidence. A
refuted-bug comment names the protection: "Safe without a lock: `Run` is only
called from the single scheduler goroutine (scheduler.go:42)."

**Decisions:** ADR-shaped items are offered to the user as candidates for
decision records (ADRs). If the user wants them in this branch instead, add them
to the repo's existing design-docs location, or a single
`docs/design-decisions.md` if there is none: one short entry per decision (what
was chosen, over what, why), with its evidence.

**Everywhere:** only write claims backed by the map's evidence. `[inferred]`
rationale never goes into repo docs.

## The PR

After committing, show the diff stat and ask whether to push and open a PR. Only
on a clear yes, push the branch and open the PR with:

- a one-paragraph summary,
- a table of changes, each with its evidence: code receipts and commit SHAs,
  never map paths, so reviewers can check claims against the code without
  trusting the map,
- a note that the comments commit is comment-only and can be dropped
  independently.

## After the PR

Append `proposed: <branch>` to each included friction entry in the map (and note
the branch in `.map/scout.md`). On the next `/whiteboard` or `refresh`:

- **Change reachable from HEAD** (`git merge-base --is-ancestor`, or the
  corrected text is present at HEAD after a squash merge): remove the entry, and
  upgrade the evidence of any rationale it carried to `[documented: <path>]`.
- **Branch gone and change not present:** remove the `proposed:` marker so the
  entry is open again.
- **Branch still open:** leave it.
