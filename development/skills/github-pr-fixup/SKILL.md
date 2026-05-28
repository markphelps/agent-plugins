---
name: github-pr-fixup
description:
  '{url} address comments left on a GitHub pull request. Use when a user wants
  review comments and CI failures fixed on an existing GitHub pull request
  without opening a new PR.'
---

# GitHub PR Fixup

Fix review feedback and CI failures on an existing GitHub pull request. Work on
the PR's source branch. Do not open a new PR.

## Required tools

Verify both tools exist before doing anything else:

```bash
gh --version
jq --version
```

If either command is missing, stop and tell the user to run:

```bash
brew install gh jq
```

## Inputs

- GitHub URL: `$ARGUMENTS`

Extract the PR number from the URL:

```bash
PR_NUMBER="$(echo "$ARGUMENTS" | grep -oE '[0-9]+$')"
```

Stop if `PR_NUMBER` is empty.

## Workflow

1. Check out the existing PR branch.

```bash
gh pr checkout "$PR_NUMBER"
```

2. Read PR metadata you will need later.

```bash
gh pr view "$PR_NUMBER" --json number,title,headRefName,headRepositoryOwner,headRepository,headRefOid,baseRefName,url
```

3. Gather unresolved review feedback.

Use GraphQL so you can ignore resolved threads and outdated comments.

```bash
gh api graphql -f query='
query($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        nodes {
          isResolved
          isOutdated
          path
          line
          comments(first: 20) {
            nodes {
              author { login }
              body
              createdAt
              url
            }
          }
        }
      }
    }
  }
}' -F owner="$(gh pr view "$PR_NUMBER" --json headRepositoryOwner -q '.headRepositoryOwner.login')" -F repo="$(gh pr view "$PR_NUMBER" --json headRepository -q '.headRepository.name')" -F number="$PR_NUMBER"
```

Focus only on threads where:

- `isResolved == false`
- `isOutdated == false`

Read each active thread carefully. Fix the requested changes in code, tests,
docs, or config as needed. If comments conflict, prefer the most recent reviewer
guidance and note the conflict in your final summary.

4. Check CI status for the PR head commit.

```bash
HEAD_SHA="$(gh pr view "$PR_NUMBER" --json headRefOid -q '.headRefOid')"
gh pr checks "$PR_NUMBER"
gh run list --commit "$HEAD_SHA" --json databaseId,status,conclusion,name,event,workflowName,headSha,url
```

5. Investigate failed runs only.

Filter for failing runs:

```bash
gh run list --commit "$HEAD_SHA" --json databaseId,status,conclusion,name,event,workflowName,url | jq '.[] | select(.conclusion == "failure")'
```

For each failed run:

```bash
gh run view <run-id> --log-failed
```

Diagnose the underlying failure from the failed job log. Do not patch symptoms
blindly. Fix the actual issue in code or configuration.

6. Verify locally.

Run the smallest relevant validation that covers the fixes you made. Prefer
repo-native lint, unit, or integration commands over broad full-suite runs when
scope is small. If full local verification is not possible, explain why and
state what you did run.

7. Commit and push fixes to the existing source branch.

Do not create a new branch and do not create a new PR.

## Guardrails

- Never open a new PR.
- Never resolve review threads unless the user explicitly asks.
- Ignore resolved and outdated review threads.
- Prefer the PR head repository and branch already associated with the PR.
- Keep fixes scoped to active review feedback and failing CI unless you find a
  directly related root cause.
- If a CI failure depends on unavailable secrets, external services, or flaky
  infrastructure, state that clearly and avoid speculative code changes.

## Final response

Report:

- what unresolved review comments you addressed
- which CI failures you fixed
- what validation you ran
- any remaining blockers you could not complete
