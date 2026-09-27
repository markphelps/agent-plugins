# macOS driver

Drive native apps through the accessibility tree. This works well for menus,
buttons, text fields, and windows; custom-drawn views and some menu bar extras
need accessibility identifiers added before they're drivable.

## Launch

Build with the repo's scheme
(`xcodebuild -scheme <App> -configuration Debug build`) and launch the built
bundle (`open <path>.app`). Record both. The first drive may need Accessibility
permission for the terminal or agent host; if the drive fails with a permissions
error, stop and ask the user to grant it in System Settings → Privacy & Security
→ Accessibility.

## Choosing a driver

- **The repo has UI tests (XCUITest):** prefer them. Drive through a focused
  test with `xcodebuild test -only-testing:<target>/<test>` and record the test
  name as the drive step. This is the most reliable path.
- **Otherwise:** use System Events via `osascript`, or an accessibility MCP if
  the harness has one.

## Vocabulary

Write steps against accessibility identifiers first, then titles:

```text
click menu item "New Feed…" of menu "File" of menu bar 1
click button id "addFeedButton" of window "Cove"
set value of text field id "feedURL" to "https://example.com/feed.xml"
```

For menu bar extras, record how to open the extra (its status item's identifier
or title) as the first step.

## Observe

Record window titles, text of labels, enabled state of controls, and any
notification or status item change. Read values through the accessibility tree
rather than screenshots when possible.

## Gotchas to check

- Accessibility permission for the driving process
- SwiftUI views without `accessibilityIdentifier` (record a finding)
- Menu bar extras that only render while open
- Sandboxed file dialogs, which are hard to drive; seed files instead
- Login items, sleep/wake, or system state the feature depends on
