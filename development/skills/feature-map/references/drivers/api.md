# HTTP API driver

Use `curl` (or the repo's own client) against a locally running server.

## Launch

Start the server with the repo's command, wait on a health endpoint, and record
both in the Environment section. Obtain auth the way a client would (login
endpoint, test token from a seed script) and reference it by env var.

## Vocabulary

Write each step as a request:

```text
POST /api/v1/flags
Authorization: Bearer $APP_TEST_TOKEN
{"key": "demo", "enabled": false}
```

Keep bodies minimal: only the fields the feature needs.

## Observe

Record the status code and the response fields that matter, not the whole body.
For async operations, record how to observe completion (a follow-up GET, a
webhook, a status field).

## Gotchas to check

- Idempotency: can the drive be repeated, or does it need unique keys?
- Pagination, rate limits, and eventual consistency
- Required headers (content type, versioning, CSRF)
- Differences between the API and what the UI sends for the same feature
