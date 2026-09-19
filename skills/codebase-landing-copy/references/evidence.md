# What counts as evidence

Read this before building the evidence ledger. The goal is to separate "the code
can do this for a real user today" from "someone intended this."

## Strong evidence (claim is safe)

- **Registered entry points**: CLI subcommands in the command tree, HTTP routes
  mounted in the router, SwiftUI/React views reachable from navigation, menu
  items, keyboard shortcut bindings, public exports from the package's main
  module.
- **User-facing strings** in the UI or CLI help text, when the surrounding code
  is live.
- **Integrations with real client code**: an SDK import plus calls that are
  reachable from an entry point. An SDK in the dependency list alone is weak —
  confirm it's called.
- **Config/settings wired into behavior**: the option is read somewhere that
  changes what happens.
- **File formats**: parsers/serializers invoked from import/export flows.
- **Platforms**: build targets, CI matrix, release workflow artifacts (e.g. a
  GoReleaser config that builds linux/darwin/windows).
- **License**: the LICENSE file (for "open source" / "free" claims).
- **Tests that exercise a public path** strengthen a claim but don't create one
  on their own.

## Not evidence (never claim)

- TODO / FIXME / XXX comments, "coming soon" strings.
- Functions that throw/return "not implemented", empty handlers, placeholder
  views.
- Code gated by a feature flag that defaults off and isn't documented as
  user-toggleable.
- Dead code: no caller from any entry point.
- Test fixtures, mocks, examples folders that don't ship.
- README roadmap / "planned" sections, CHANGELOG "Unreleased" items that aren't
  merged, open issues/PRs, branch names.
- Commented-out code.
- Dependencies listed but never imported or called.

## Ambiguous (collect and ask the user once)

- Experimental/beta modules, flags that are user-toggleable but labelled
  experimental.
- Paid-tier gating (entitlement checks) — the feature is real but the copy may
  need a "Pro" label.
- Features that are wired up but visibly unfinished (rough UI, missing error
  handling).
- Claims about **privacy, security, offline use, or "no telemetry"** — verify by
  actually checking network calls, analytics SDKs, and crash reporters. If you
  can't fully verify, ask rather than assert.
- Performance claims backed only by an informal comment.

## Turning evidence into benefits (allowed transformations)

These are fine — they change framing, not facts:

- Mechanism → outcome: `summarize(article)` → "Catch up in minutes."
- Aggregation: five export functions → "Export to Markdown, JSON, CSV, HTML, or
  OPML."
- Counting: 12 provider adapters → "Works with 12 providers" (count them; don't
  round up).
- Absence as a feature, when verified: no auth module and no network calls
  outside feed fetching → "No account. No tracking."

These are not fine:

- Generalizing past the code: supports OpenAI and Anthropic → "works with any AI
  model".
- Implying quality you can't measure: "blazing fast", "rock-solid",
  "enterprise-grade".
- Promoting a capability of a dependency to a product feature when the product
  doesn't expose it.
