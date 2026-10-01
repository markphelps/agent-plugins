---
region: billing
title: Billing
altitude: 2
parent: index
mapped_at: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
mapped_on: 2026-10-01
paths: ['src/billing/**']
entry_points: [src/billing/invoice.js]
---

# Billing

Calculates invoice totals.

## Shape

- `src/billing/invoice.js`

## How it works

Invoice totals use integer cents. [documented: design/decisions/billing.md]
(`src/billing/invoice.js`)

## Data

Amounts are integer cents.

## Decisions

- **Amount units.** Invoice totals use integer cents. [documented:
  design/decisions/billing.md] (`src/billing/invoice.js`)

## Trust boundaries and failure modes

- Amounts are derived from line items (`src/billing/invoice.js`).

## Open questions & friction

- None identified.
