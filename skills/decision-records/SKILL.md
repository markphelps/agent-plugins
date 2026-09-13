---
name: decision-records
description:
  Write or update decision and implementation-plan records in a repository's
  records directory (usually `docs/records/`, also known as ADRs, decision logs,
  or design docs). Use for architecture, product, design, privacy, security,
  dependency, delivery, or other durable project decisions. Use when creating a
  record, changing a record's status, writing an amendment, superseding a
  record, updating the record registry, or bootstrapping a records directory in
  a repo that has none.
---

# Project records

A records directory is a repository's durable registry for decisions and
implementation plans. A record explains what the team decided, why, and what
follows from that decision. Records are historical evidence: they are appended
to and amended, not rewritten.

Do not use a record for a routine code change, a temporary task, a release note,
or an investigation without a durable outcome.

## Find the records directory

1. Look for an existing registry, in this order: `docs/records/`, `docs/adr/`,
   `docs/decisions/`, `adr/`, `decisions/`, or any directory that contains a
   `README.md` with a table of numbered records. Check the project's
   `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, or `CLAUDE.md` for a pointer.
2. If a registry exists, its `README.md` is the contract. It is the authority
   for ID format, filename pattern, frontmatter, status vocabulary, and required
   headings. Follow it even where it differs from the defaults below.
3. If no registry exists, ask the user whether to create one. If they agree,
   create `docs/records/README.md` from the template in "Bootstrap a registry"
   before writing the first record.

## Read first

1. Read the registry `README.md` completely.
2. Read the records that relate to the work.
3. Read the product, design, or architecture source that defines the facts.
4. If a record conflicts with newer evidence, preserve the record's history and
   record the correction or new decision. Do not edit the old text in place.

Do not copy a legacy record's errors into a new record. When a legacy record and
the registry contract disagree, the contract wins.

## Create a record

Create a record only after the decision or plan has a clear scope. Ask for
missing product or technical facts before you invent them.

1. Find the next unused ID in the registry table. Default format is a global
   three-digit number (`001`, `002`, ...). Never reuse or skip an ID.
2. Name the file `<id>-<short-kebab-case-title>.md`.
3. Add the exact frontmatter contract from the registry README. Keep every list
   key, even when the list is empty.
4. Use `kind: decision` for a durable choice. Use `kind: plan` for committed,
   outcome-based work.
5. New decisions start as `proposed` until accepted. New plans start as
   `planned` until work begins. Use another valid status only when the current
   state differs.
6. Set `date` and `updated` to the creation date. Use ISO dates (`YYYY-MM-DD`).
7. Start with the six required headings, in this order:
   - `## Intent`
   - `## Context`
   - `## Record`
   - `## Consequences`
   - `## Validation / Current state`
   - `## Related records`
8. Add the new row to the registry table in the README.

The table row is part of the change. Keep its ID, title, kind, status, date,
supersession, and related-record fields aligned with the record's frontmatter.

### Default frontmatter

Use this when the registry README does not define its own:

```yaml
---
id: 007
title: Short title
kind: decision # decision | plan
status: proposed # see "Status rules"
date: 2026-09-13
updated: 2026-09-13
supersedes: []
superseded_by: []
related: []
---
```

## Write the sections

Write factual, direct prose in plain English. Use the project's own terms,
matching the related records. Prefer short sentences and concrete nouns over
abstractions. If the repo has a writing-style skill or guide, apply it.

### Intent

State the user or project outcome. State what the record makes possible or
protects. Do not repeat implementation detail here.

### Context

State the facts, constraints, research, risks, and alternatives that shaped the
choice. Link evidence (issues, PRs, benchmarks, docs) when it is useful. Mark
assumptions and open questions as such.

### Record

State the decision or plan precisely. Use numbered items when the contract has
several rules. Name scope boundaries and required behavior. For a plan, make the
desired outcome and completion evidence clear.

### Consequences

State costs, tradeoffs, follow-up work, and intentionally deferred work. Do not
present a consequence as a requirement unless the record commits to it.

### Validation / Current state

State the current, observable status. For completed work, name the evidence:
tests, checks, measurements, or human acceptance. For proposed or active work,
state what remains. Do not claim that work shipped or passed unless the evidence
exists.

### Related records

Use this form:

```md
**Supersedes:** None.

**Related:**

- [005 — Short title of record 005](005-short-title.md)
```

Use relative links. Keep the frontmatter ID lists in the same order as the links
in this section.

## Update a record

A record is historical evidence. Preserve its ID, filename, creation date, and
past decisions.

- Change `updated` only for a substantive content change.
- Change `status` only to a value valid for the record kind.
- Add a dated `## Amendment (YYYY-MM-DD) — <short title>` for a later decision,
  correction, or material scope change. Put it after the existing material.
- Update `## Validation / Current state` when new evidence changes the status.
- Create a new record when a decision or plan is fully replaced. Put the old IDs
  in the new record's `supersedes`, set the old record's status to `superseded`
  and its `superseded_by`, and update the registry rows.
- Use `related`, not `supersedes`, for a dependency, coordinated work, or a
  partial refinement.
- Never silently rewrite history to make an old decision look current.

A superseded record stays in the registry. Do not renumber, delete, or reuse its
ID.

## Status rules

Default vocabulary, unless the registry README defines its own:

- Decisions: `proposed`, `accepted`, `superseded`, `rejected`.
- Plans: `planned`, `active`, `completed`, `blocked`, `superseded`, `rejected`.

A status tells the truth about the record. It does not predict the desired
outcome.

## Bootstrap a registry

Only when the user agrees to create one. Write `docs/records/README.md` with:

1. A one-paragraph statement of what belongs in a record and what does not.
2. The ID and filename pattern.
3. The frontmatter contract (copy the default above).
4. The status vocabulary per kind.
5. The six required headings in order.
6. An empty registry table with these columns:
   `ID | Title | Kind | Status | Date | Supersedes | Related`.

Keep the README short. It is a contract, not a guide.

## Final review

Before you finish:

1. Make sure that the new ID is unique and matches the filename.
2. Make sure that the frontmatter has every required key and valid values.
3. Make sure that the required headings exist in the required order.
4. Make sure that every linked or listed record ID exists.
5. Make sure that `supersedes` means full replacement.
6. Make sure that the registry row and frontmatter agree.
7. Read the record as a future maintainer. Remove vague promises and unsupported
   claims.
8. Run `git diff --check`. If the repo has a Markdown linter or link checker,
   run it on the changed files.

Do not run the app build or test suite for a records-only change.
