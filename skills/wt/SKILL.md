---
name: wt
description:
  Use wt, the Git worktree manager, for branch-per-worktree development,
  worktree checkout/removal/status, and GitHub PR or GitLab MR worktree flows.
---

# wt

Use this skill when the user asks about `wt`, git worktrees, branch-per-task
workflows, `wt create`, `wt checkout`, `wt co`, `wt list`, `wt ls`, `wt remove`,
`wt rm`, `wt pr`, `wt mr`, `wt status`, or organizing branches with worktrees.

## Philosophy

Prefer a separate worktree for each task. This avoids stashing, branch switching
in the main checkout, and mixing unrelated working tree state.

## Core Commands

| Command                     | Purpose                                                                   |
| --------------------------- | ------------------------------------------------------------------------- |
| `wt create <branch> [base]` | Create a new branch in a worktree, defaulting to `main`/`master` as base. |
| `wt co <branch>`            | Check out an existing branch in a new worktree.                           |
| `wt co`                     | Fuzzy-search available branches interactively.                            |
| `wt ls`                     | List worktrees.                                                           |
| `wt rm <branch>`            | Remove a worktree.                                                        |
| `wt rm`                     | Fuzzy-search worktrees interactively for removal.                         |
| `wt pr [number\|url]`       | Check out a GitHub PR; requires `gh`.                                     |
| `wt pr`                     | Fuzzy-search open GitHub PRs interactively.                               |
| `wt mr [number\|url]`       | Check out a GitLab MR; requires `glab`.                                   |
| `wt mr`                     | Fuzzy-search open GitLab MRs interactively.                               |
| `wt status`                 | Show a color-coded overview of all worktrees.                             |
| `wt status --ci`            | Include CI/CD status per branch.                                          |
| `wt info`                   | Show active strategy, pattern, and variables.                             |
| `wt config show`            | Show effective config with sources.                                       |
| `wt cleanup --stale`        | Detect stale worktrees from deleted remotes or inactive commits.          |
| `wt prune`                  | Clean up stale git worktree admin files.                                  |
| `wt migrate`                | Migrate worktrees to configured paths.                                    |
| `wt init`                   | Configure shell integration.                                              |
| `wt examples`               | Show practical examples.                                                  |

## Layout Strategies

Configure wt via `~/.config/wt/config.toml`, per-repo `.wt.toml`, `WT_CONFIG`,
or `--config`.

| Strategy          | Layout                         |
| ----------------- | ------------------------------ |
| `global`          | `<root>/<repo>/<branch>`       |
| `sibling-repo`    | `../<repo>-worktrees/<branch>` |
| `parent-branches` | `../<branch>`                  |

The `pattern` setting controls the path template. Available variables include
`{root}`, `{repo}`, `{branch}`, `{host}`, and `{owner}`.

Environment overrides:

- `WORKTREE_ROOT`
- `WORKTREE_STRATEGY`
- `WORKTREE_PATTERN`
- `WORKTREE_SEPARATOR`

## Hooks

wt supports pre/post hooks for `create`, `checkout`, `remove`, `pr`, and `mr`.

```toml
[hooks]
post_create = ["cp .env $WT_PATH/.env"]
post_checkout = ["echo 'Switched to $WT_BRANCH'"]
```

Hook environment variables:

- `WT_PATH`
- `WT_BRANCH`
- `WT_MAIN`
- `WT_REPO_NAME`
- `WT_REPO_HOST`
- `WT_REPO_OWNER`

Disable all hooks with `WT_HOOKS_DISABLED=1`.

### Common Hook Recipes

Copy `.env` files from the main worktree:

```toml
[hooks]
post_create = [
  "test -f $WT_MAIN/.env && cp $WT_MAIN/.env $WT_PATH/.env || true"
]
post_checkout = [
  "test -f $WT_MAIN/.env && cp $WT_MAIN/.env $WT_PATH/.env || true"
]
```

Install Node.js dependencies:

```toml
[hooks]
post_create = ["cd $WT_PATH && npm install"]
post_checkout = ["cd $WT_PATH && npm install"]
```

Install Python dependencies with `uv`:

```toml
[hooks]
post_create = ["cd $WT_PATH && uv sync"]
post_checkout = ["cd $WT_PATH && uv sync"]
```

Use a deterministic dev server port per branch:

```toml
[hooks]
post_create = [
  "printf 'PORT=%d\n' $(( 3000 + $(printf '%s' \"$WT_BRANCH\" | cksum | cut -d' ' -f1) % 997 )) > $WT_PATH/.env.port"
]
```

## JSON Output

Prefer JSON output when scripting or when parsing command results:

```bash
wt --format json list
wt --format json info
wt --format json config show
wt --format json version
```

## Shell Integration

After `wt init`, a shell function can automatically navigate to worktrees on
create or checkout. Agents should not assume auto-`cd` happened; use the printed
worktree path explicitly for subsequent commands.

## Agent Workflow

1. Inspect existing worktrees with `wt ls` or `wt status`.
2. Create or check out a task worktree:

```bash
wt create feat/my-feature
wt co existing-branch
wt pr 123
```

3. Continue all file operations from the worktree path printed by `wt`.
4. Run tests and commit from that worktree.
5. Push and open a PR/MR from that worktree.
6. After merge, remove the task worktree with `wt rm <branch>`.

## Rules

- For non-interactive agent contexts, pass explicit arguments; use
  `wt co <branch>`, not `wt co`.
- When the user wants to work on a branch, prefer `wt create` or `wt co` over
  `git checkout`.
- For PR/MR checkout, prefer `wt pr` or `wt mr`; they resolve branch names
  automatically.
- Use `wt status` to understand all worktree state before cleanup or
  cross-worktree changes.
- Avoid removing worktrees unless the user explicitly asks or the task is
  cleanup after merge.
