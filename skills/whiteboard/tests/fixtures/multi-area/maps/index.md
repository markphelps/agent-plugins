---
region: index
title: Fixture architecture map
altitude: 1
mapped_at: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
mapped_on: 2026-10-01
paths: ['**']
entry_points: [src/auth/session.js, src/billing/invoice.js]
---

# Fixture architecture map

A small fixture with separate authentication and billing areas.

## Shape

The authentication and billing regions have separate path boundaries.

## Key flows

- Authentication creates expiring sessions.
- Billing totals invoice items in cents.

## System-wide decisions

No cross-cutting decisions are asserted in this fixture.

## Trust boundaries and failure modes

Input validation is owned by each region.

## Regions

| Region                    | Covers           | Mapped at |
| ------------------------- | ---------------- | --------- |
| [Authentication](auth.md) | `src/auth/**`    | `aaaaaaa` |
| [Billing](billing.md)     | `src/billing/**` | `aaaaaaa` |

## Unexplored

- **Operations** (`ops/**`, ~1 line): Only deployment configuration is present;
  defer mapping until its runtime flow is known.

## Open questions & friction

- None identified.
