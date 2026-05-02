---
name: vault-x-bookmarks
description:
  Review a bounded slice of X bookmarks via the X API and capture selected
  bookmarks as external source records in raw/sources
---

# Vault X Bookmarks

Use the bundled TypeScript helper to review a bounded slice of the authenticated
user's X bookmarks and capture selected items into `raw/sources/`.

This is source-first: the helper writes `external` source records, records
captured bookmark IDs in `raw/state/x-bookmarks/`, and leaves organization to a
follow-up `vault-ingest` run.

When a bookmarked post contains an X Article, the helper requests the `article`
post field and includes the article title, preview, body text, and article
entity links in the source record.

When a bookmarked post links to external non-X content, the helper may fetch the
direct linked page and include readable text in the source record. This is
strictly one level deep: fetch URLs surfaced by the bookmark payload, but do not
follow or recursively crawl links found inside fetched pages.

## Requirements

- Node.js 18+ for `tsx` and `dotenv`.
- An X Developer account and app. See
  [X API docs](https://developer.twitter.com/en/docs/twitter-api) for details.
- [`xurl`](https://github.com/xdevplatform/xurl/) CLI tool installed and
  authenticated with OAuth 2.0.

## Command

Run from this skill directory:

```sh
npx tsx scripts/x-bookmarks.ts [--limit N] [--max-pages N] [--head-pages N] [--path PATH]
```

## Parameters

- `--limit N` (default: `15`, range: `1..100`): maximum selected bookmarks to
  evaluate and capture in one run.
- `--max-pages N` (default: `10`, range: `1..100`): maximum bookmark pages to
  fetch across the head scan and catch-up scan.
- `--head-pages N` (default: `2`, range: `1..100`): newest bookmark pages to
  scan before resuming backlog pagination.
- `--path PATH` (default: current working directory): vault root containing
  `raw/sources/` and `raw/state/x-bookmarks/`.

There is no report mode. This helper is apply-only and bounded by `--limit`. It
writes source records, appends reviewed/run state, and updates the catch-up
checkpoint after successful runs.

## Authentication

Install `xurl`, authenticate it with OAuth 2.0 for the X account whose bookmarks
should be captured, and verify it before running the helper:

```sh
xurl auth apps add vault-x-bookmarks --client-id <YOUR_CLIENT_ID> --client-secret <YOUR_CLIENT_SECRET>
xurl auth oauth2 --app vault-x-bookmarks
xurl default # to set the default authenticated app for later `xurl` commands
xurl auth status
xurl whoami
```

Required scopes:

- `bookmark.read`
- `tweet.read`
- `users.read`
- `offline.access`

Do not use an app-only bearer token. The helper resolves the authenticated user
through `xurl whoami`; do not pass a manual user ID.

## Behavior

1. Load reviewed IDs from `raw/state/x-bookmarks/reviewed.jsonl`.
2. Fetch bookmark pages by shelling out to `xurl --auth oauth2`.
3. Always scan newest `--head-pages` first so newly saved bookmarks are found
   even after backlog has been processed.
4. If backlog remains and the head scan does not fill `--limit`, continue from
   the saved catch-up pagination token until `--max-pages` or `--limit` is
   reached.
5. Advance the saved catch-up token only past pages whose unreviewed bookmarks
   have all been captured or recorded; if `--limit` stops mid-page, save the
   token for that same page.
6. Select the newest unreviewed bookmarks reachable in the combined scan, up to
   `--limit`.
7. Process the selected slice newest-to-oldest, matching X bookmark order.
8. Capture every selected bookmark to `raw/sources/` as markdown tagged
   `external`, including X Article text and direct external linked-page text
   when available.
9. Append every captured bookmark to `reviewed.jsonl`.
10. Append the run summary to `runs.jsonl` and update `checkpoint.json` only
    after reviewed entries are durable.

Never mutate X bookmarks. Never route captured files directly into permanent
vault folders.

## Capture Policy

Capture every selected bookmark. Do not apply regex scoring, string scoring, or
filtering; the user's bookmark action is the relevance signal. Manually delete
unwanted source records after a run.

## Output

The command prints a JSON summary with the authenticated X user ID, pages
fetched, evaluated and captured counts, created source paths, state files
updated, and errors or partial failures.

## Examples

Regular run:

```sh
npx tsx scripts/x-bookmarks.ts --limit 15
```

Catch up more backlog in one run:

```sh
npx tsx scripts/x-bookmarks.ts --limit 75 --max-pages 25 --head-pages 2
```

Override the vault path:

```sh
npx tsx scripts/x-bookmarks.ts --path /path/to/vault --limit 20
```
