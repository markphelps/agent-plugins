---
name: ship-pr
description:
  Branch, commit, push, and open a pull request with smart staging and explicit
  draft-PR confirmation.
---

# Ship PR

Use this skill when the user wants to publish local work as a PR.

## Goals

- turn local changes into a clean PR quickly
- avoid accidentally committing unrelated work
- always confirm whether PR should be draft

## Inputs

`arguments` may include:

- optional branch name
- optional commit message
- optional PR title/body hints
- optional base branch (default: `main`)

## Process

1. Inspect repository state:
   - current branch
   - `git status --short`
   - staged vs unstaged files
   - default base branch (`main` unless repo policy differs)
2. Build a commit scope plan:
   - group changed files by feature/topic
   - identify likely unrelated files and exclude by default
   - if ambiguity exists, ask one concise scope question before staging
3. Create/switch branch:
   - if on `main`/default branch, create a feature branch
   - branch naming: short kebab-case reflecting scope
4. Stage smartly:
   - stage only scoped files (`git add <paths>`), not blanket adds by default
   - include all hunks only when the whole file is in-scope
5. Commit:
   - if commit message provided, use it
   - otherwise generate a concise imperative message from staged diff
6. Push branch to origin with upstream tracking.
7. Ask explicitly: `Should I open this as a draft PR?`.
8. Create PR with chosen draft mode and a focused summary:
   - what changed
   - why
   - risks / follow-ups

## Smart Staging Heuristics

Prefer including files that:

- are in the same directory/module as core edits
- were edited in the same session for the same goal
- are required companions (tests/docs for the feature)

Prefer excluding files that:

- look orthogonal (different project area, unrelated refactor)
- are incidental local artifacts
- contain ongoing work not ready for review

If uncertain, default to narrower scope and ask before including extra files.

## Safety

- never use destructive git commands
- do not rewrite user history without explicit instruction
- do not auto-commit unrelated dirty changes
- always confirm draft vs ready PR before creating

## Output

Return:

- branch name
- files committed
- commit hash and message
- push result
- PR URL and draft status
- any excluded files the user may want in a follow-up PR
