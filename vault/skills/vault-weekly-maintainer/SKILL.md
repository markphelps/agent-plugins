---
name: vault-weekly-maintainer
description:
  Run a weekly vault maintenance sweep across tracker, concepts, archive
  hygiene, index, and log
---

# Weekly Maintainer

Run a bounded weekly maintenance loop over the active vault surface.

## Parameters

- `--mode report|apply-safe|apply` (default: `report`)

## Workflow

1. Run tracker audit (`vault-project-tracker --mode report`).
2. Run concept audit (`vault-concept-promoter --mode report`).
3. Run archive audit (`vault-archive-audit --mode report`).
4. Refresh `index.md` only if durable navigation changed.
5. Optionally run publish preflight (`vault-qmd --mode report`) when hosting
   surface changed materially.
6. Produce weekly summary and unresolved decisions.
7. Append maintenance entry to `log.md` (`vault-log`).

## Mode Behavior

- `report`: findings and proposals only
- `apply-safe`: apply high-confidence low-risk updates
- `apply`: include medium-confidence actions when evidence is clear

`apply-safe` allowed scope:

- tracker formatting / obvious status normalization
- additive updates to existing concept pages
- low-risk link normalization
- index refresh when needed
- log append

`apply` additionally allows:

- medium-confidence archive moves with deterministic link rewrites
- concept page creation when promotion thresholds are met

## Safety

- Do not delete curated notes.
- Do not archive ambiguous live projects without explicit instruction.
- Keep changes reviewable and list touched files.

## Output

Return:

- applied changes
- deferred/proposed changes
- confidence notes
- unresolved decisions
- touched files
