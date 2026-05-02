---
name: vault-ingest
description:
  Use when raw vault captures need classification, routing, and relocation from
  the source inbox into the right vault directories
---

# Vault Ingest

Categorize captures in `raw/sources/` and move the original source files to the
correct location in the vault. Do not summarize source contents into new notes.

## Parameters

- `--mode report|apply` (default: `report`)
  - `report`: preview all planned operations
  - `apply`: execute confirmed operations
- `--path PATH` (optional): override default `./raw/sources` input path

## Core Contract

For each ingestion cycle:

- Source starts in `raw/sources/` (unprocessed inbox)
- The source file itself remains the durable artifact
- Each source is classified by intent, topic, and lifecycle state before moving
- Source files move to the most specific existing vault location
- Owned notes, project ideas, drafts, and planning captures are moved intact
  rather than summarized
- `raw/processed/YYYY-MM-DD/` is only for processed archives or sources with no
  better durable home
- Navigation is updated only for moved durable files that belong in active
  navigation
- All material operations are logged in `log.md`
- `raw/processed/` is audited for empty folders and anomalies

## Routing Rules

Prefer the vault's existing directory taxonomy. Do not invent new top-level
folders when an existing one fits.

| Source category         | Destination pattern                                  |
| ----------------------- | ---------------------------------------------------- |
| Rough owned idea        | `ideas/fleeting/<idea>/`                             |
| Promising project idea  | `ideas/incubating/<idea>/`                           |
| Later/someday idea      | `ideas/someday/<idea>/` or the closest existing idea |
| Rejected/closed idea    | `ideas/rejected/<idea>/`                             |
| Active project material | `projects/active/<project>/`                         |
| Durable conceptual note | `notes/concepts/` only when it is itself canonical   |
| General durable note    | `notes/<topic>/` or the closest existing note area   |
| External/reference item | `resources/<topic>/`                                 |
| Asset or binary support | `raw/assets/` or an existing asset folder            |
| No clear durable home   | Leave in `raw/sources/` and report the ambiguity     |

When a source clearly belongs with an existing project, idea, note, or resource,
move it there even if the file is messy. Preserve the original content and
filename unless a minimal rename is needed to avoid collision or clarify the
source identity.

## Capture Decision

Use `raw/sources/` only for unclassified captures. If the user already
identifies the item as their own idea, route it to `ideas/` directly:

- `ideas/fleeting/`: quick idea, fragment, or unqualified possibility
- `ideas/incubating/`: idea with enough shape to revisit or develop
- `ideas/someday/`: intentionally parked idea
- `ideas/rejected/`: idea explicitly declined but worth retaining as history

External articles, discussions, docs, and market references can pass through
`raw/sources/`, but ingestion still only categorizes and moves them. Use
`vault-research` when the user wants synthesis, summaries, or evaluation of
external material.

## Workflow

1. **Scan** `raw/sources/` for unprocessed captures (skip hidden files)
2. **Classify** each capture:
   - Identify source type, topic, related entities, and lifecycle state
   - Match against existing `projects/`, `ideas/`, `notes/`, and `resources/`
   - Mark confidence as high, medium, or low
3. **Plan moves**:
   - Choose the most specific destination path
   - Detect filename collisions and propose minimal safe renames
   - Leave low-confidence items in place and list the decision needed
4. **Move** high-confidence sources to their destination paths
5. **Update** navigation and ops trail only as needed:
   - Add moved durable files to `index.md` when they belong in active navigation
   - Append concise operation entry to `log.md`
6. **Audit** processed archives:
   - Scan `raw/processed/YYYY-MM-DD/` for empty date folders
   - Flag non-date folder anomalies
   - Report duplicate filenames across dates
   - Remove empty folders (with confirmation in apply mode)
7. **Execute** by mode:
   - `report`: preview plan only (no changes)
   - `apply`: run full pipeline with confirmation

## Safety

- Never discard files from `raw/sources/` — only move them after successful
  classification
- Treat `raw/processed/` as immutable evidence — never delete processed source
  files
- Do not create summaries, synthesized notes, or rewritten interpretations of
  owned source files during ingest
- Non-destructive edits by default — source files are moved, not rewritten
- Confirm before execution unless `--yes`
- Do not mutate file contents under `raw/sources/`, `raw/processed/`, or
  `raw/assets/`
- Do not assume or create an inbox staging layer

## Output

Return:

- discovered captures and classification plan
- category, confidence, and destination path for each source
- source files moved and final destination paths
- source files left in place with ambiguity reason
- `index.md` additions
- `log.md` entry appended
- audit findings (empty folders, anomalies)
- fixes applied (if any)
- manual follow-up items
