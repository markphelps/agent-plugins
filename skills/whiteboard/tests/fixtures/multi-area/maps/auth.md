---
region: auth
title: Authentication
altitude: 2
parent: index
mapped_at: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
mapped_on: 2026-10-01
paths: ['src/auth/**']
entry_points: [src/auth/session.js]
---

# Authentication

Creates and validates user sessions.

## Shape

- `src/auth/session.js`

## How it works

Session tokens expire after 15 minutes. [documented: design/decisions/auth.md]
(`src/auth/session.js`)

## Data

Session TTL is stored in minutes.

## Decisions

- **Session lifetime.** Session tokens expire after 15 minutes. [documented:
  design/decisions/auth.md] (`src/auth/session.js`)

## Trust boundaries and failure modes

- Invalid session tokens are rejected (`src/auth/session.js`).

## Open questions & friction

- None identified.
