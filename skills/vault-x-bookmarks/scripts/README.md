# X Bookmarks Helper

TypeScript CLI used by the `vault-x-bookmarks` skill to capture selected X
bookmarks into a vault's `raw/sources/` directory.

For bookmarked posts that contain X Articles, the helper requests the `article`
post field and writes the article title, preview, body text, and article entity
links into the captured source record.

For bookmarked posts that link directly to external non-X text/html content, the
helper fetches that page and writes extracted text into the source record. It
only fetches URLs present in the bookmark payload and does not crawl links found
inside fetched pages.

## Requirements

- Node.js with npm.
- [`xurl`](https://github.com/xdevplatform/xurl) installed and available on
  `PATH`.
- `xurl` authenticated with OAuth 2.0 for the X account whose bookmarks should
  be captured.
- The authenticated `xurl` account needs these scopes:
  - `bookmark.read`
  - `tweet.read`
  - `users.read`
  - `offline.access`

Do not use an app-only bearer token. Bookmarks are private user-context data,
and the script shells out to `xurl --auth oauth2`.

## Setup

From the skill root:

```sh
cd vault/skills/vault-x-bookmarks
npm install
```

Verify that `xurl` can see your authenticated user:

```sh
xurl auth status
xurl whoami
```

The script loads `.env` via `dotenv` before invoking `xurl`, so environment
variables needed by your local `xurl` setup can live in the skill root.

## Run

From the skill root:

```sh
npx tsx scripts/x-bookmarks.ts --limit 15
```

Options:

- `--limit N` (default `15`, range `1..100`): maximum selected bookmarks to
  capture.
- `--max-pages N` (default `10`, range `1..100`): maximum bookmark pages to
  scan.
- `--head-pages N` (default `2`, range `1..100`): newest pages to scan before
  continuing backlog catch-up.
- `--path PATH`: vault root. Defaults to the current working directory.

Examples:

```sh
npx tsx scripts/x-bookmarks.ts --limit 15
npx tsx scripts/x-bookmarks.ts --limit 75 --max-pages 25 --head-pages 2
npx tsx scripts/x-bookmarks.ts --path /path/to/vault --limit 20
```

## Output

The script writes:

- source records to `raw/sources/`
- reviewed bookmark state to `raw/state/x-bookmarks/reviewed.jsonl`
- run summaries to `raw/state/x-bookmarks/runs.jsonl`
- catch-up cursor state to `raw/state/x-bookmarks/checkpoint.json`

It prints a JSON summary with the `xurl whoami` user ID, pages fetched, captured
count, created source paths, and any errors.

Captured bookmarks are selected newest-to-oldest from X's bookmark pages, so the
first source records in a run match the current bookmark order returned by X.

The script never mutates X bookmarks and does not route files into permanent
vault folders. Run `vault-ingest` afterward to classify captured source records.

## Test

From the skill root:

```sh
npm run test:x-bookmarks
npx tsc --noEmit --module NodeNext --moduleResolution NodeNext --target ES2022 --types node scripts/x-bookmarks.ts scripts/x-bookmarks.test.ts
```
