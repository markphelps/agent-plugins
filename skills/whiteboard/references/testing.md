# Whiteboard skill tests

Run the deterministic handoff and map-format tests from the agent-plugins
repository root:

```sh
node --test development/skills/whiteboard/tests/*.test.js
```

The fixtures describe multiple inventoried areas, compact delegate reports, and
existing `docs/map/` Markdown artifacts. The tests create an isolated temporary
Git repository, commit the source receipts, then add the map artifacts as local
files. No live agent, token spend, or network access is needed.

Coverage includes complete mapped and Unexplored areas, omitted reports,
overlapping path ownership, duplicate region identifiers, conflicting reports
with and without an `inconsistent` friction entry, uncommitted or dropped
receipts, and dropped evidence tags. The overlap checker uses conservative
fixed-prefix matching: uncertain wildcard scopes may be flagged as overlapping.
Use clearly separated directory scopes such as `src/auth/**` and
`src/billing/**` in fixtures rather than treating it as a general glob solver.

The automated checker is a fixture-contract test; `/whiteboard map` does not
invoke it. To exercise the actual delegation workflow, prepare the committed
multi-area repository fixture:

```sh
repo="$(mktemp -d "${TMPDIR:-/tmp}/whiteboard-map.XXXXXX")"
cp -R development/skills/whiteboard/tests/fixtures/multi-area/sources/. "$repo/"
git -C "$repo" init -q
git -C "$repo" config user.name "Whiteboard fixture"
git -C "$repo" config user.email "whiteboard-fixture@example.test"
git -C "$repo" add --all
git -C "$repo" commit --quiet -m "Commit whiteboard fixture sources"
printf 'Start a delegation-capable agent session in: %s\n' "$repo"
```

In that session, invoke `/whiteboard map`. Confirm that each of the three
inventoried path scopes (`src/auth/**`, `src/billing/**`, and `ops/**`) is
assigned to a subagent exactly once, with no overlapping scopes. Inspect the
resulting `docs/map/index.md` and region files: every area must be mapped or
have a justified Unexplored entry, links and path boundaries must agree, and
claims must retain committed receipts and rationale evidence tags. Any
unassigned area, duplicate ownership or identifier, unsupported rationale, or
unresolved disagreement silently merged into a single claim fails. The
uncommitted map artifacts should be confined to this temporary repository.
