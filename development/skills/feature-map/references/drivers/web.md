# Web driver

Use a browser automation tool: Playwright (via the repo's own setup, the
Playwright MCP, or `npx playwright`), or a browser-control MCP if that's what
the harness has.

## Launch

Start the dev server with the repo's own command (`npm run dev`, `make run`).
Wait for a readiness signal (a log line or a 200 from the base URL) instead of a
fixed sleep. Record the command and signal in the generated `SKILL.md`
Environment section.

## Vocabulary

Write steps as user actions with locators, most stable first:

1. Role and accessible name: `click button "Save flag"`
2. Label: `fill label "Email" with $APP_TEST_EMAIL`
3. Test id: `click [data-testid=flag-toggle]`
4. Visible text, only when unique and unlikely to change

Avoid CSS class chains, nth-child, and XPath; they break on restyling. If no
stable locator exists, record a finding ("add `data-testid` or an accessible
name to the flag toggle").

## Observe

Record what a user would see: headings, text, URL changes, toasts, and the
network response when it matters (`POST /api/flags → 201`). Take a screenshot
only when a result is visual and hard to put in words; don't store it in the
entry.

## Gotchas to check

- Auth redirects and session expiry
- Loading and optimistic UI (wait on the result, not a timer)
- Feature flags or roles that hide the feature
- Client-side routing that changes the URL without a page load
