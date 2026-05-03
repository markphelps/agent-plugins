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
- Notes tagged `external` are browser-clipped or imported external sources and
  are eligible for synthesis during processing
- When a capture duplicates or extends an existing note, idea, project, or
  resource, merge it into that destination when confidence is high
- Any source that is summarized or synthesized must keep a complete immutable
  copy in `raw/processed/YYYY-MM-DD/`
- Summaries or synthesized research briefs must link to the archived complete
  source record
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
| `external` reference    | `notes/<topic>/`                                     |
| Asset or binary support | `raw/assets/` or an existing asset folder            |
| No clear durable home   | Leave in `raw/sources/` and report the ambiguity     |

When a source clearly belongs with an existing project, idea, or note, move it
there even if the file is messy. Preserve the original content and filename
unless a minimal rename is needed to avoid collision or clarify the source
identity.

## Merge Rules

Prefer a single durable note or folder when multiple captures are clearly about
the same thing. Merge only when the relationship is obvious: same project, same
idea, same source, same canonical concept, or one file is a direct continuation
of another.

- In `report` mode, propose merge target, evidence, confidence, and link
  rewrites.
- In `apply` mode, merge high-confidence captures into the existing durable
  destination.
- Preserve all user-authored content. Move unmatched sections under clear
  headings instead of summarizing them away.
- Keep provenance by retaining source filename, capture date, or a backlink to
  the moved/merged file.
- When confidence is medium or low, route the file beside the likely target and
  report a manual merge decision instead of merging.
- Do not merge merely related but distinct ideas; link them instead.

## Capture Decision

Use `raw/sources/` only for unclassified captures. If the user already
identifies the item as their own idea, route it to `ideas/` directly:

- `ideas/fleeting/`: quick idea, fragment, or unqualified possibility
- `ideas/incubating/`: idea with enough shape to revisit or develop
- `ideas/someday/`: intentionally parked idea
- `ideas/rejected/`: idea explicitly declined but worth retaining as history

External articles, discussions, docs, and market references captured with
Obsidian Note Clipper should carry an `external` tag. That tag tells ingestion
the note came from an outside source and may be summarized while preserving the
complete clipped note.

X bookmark source records are captured by `vault-x-bookmarks`. If the task is to
delete irrelevant, minimal, or low-value bookmark captures from `raw/sources/`,
use `vault-x-bookmarks` prune mode instead of ingest. Ingest routes sources
worth keeping; it does not judge bookmark source value for deletion.

Recognize `external` in either common Obsidian form:

- frontmatter list or scalar: `tags: [external]`, `tags: external`
- inline tag: `#external`

## Copy vs Synthesize Decision

Default to moving or merging the full source intact. Synthesize during
processing only when the note is tagged `external`, or when the user explicitly
asks to summarize/synthesize a specific untagged source.

Plain copy/move/merge is correct when:

- The file is user-authored, an owned idea, a project draft, a plan, meeting
  note, scratch note, or decision record
- The note's wording, structure, or roughness is itself useful context
- The capture is short enough that summarizing would mainly discard nuance
- The user asks to organize, categorize, move, link, or merge

Synthesis is correct when:

- The note has an `external` tag from Obsidian Note Clipper or another external
  capture path
- The user explicitly asks for synthesis, summary, takeaways, assessment,
  comparison, or research
- Multiple external sources need to be combined into a brief

When synthesis happens, first archive the complete source under
`raw/processed/YYYY-MM-DD/`, then write the synthesis with links to those
archived source records. A working source record may also live under
`notes/<topic>/`, `projects/.../research/`, or `ideas/.../research/`, but the
complete archived copy is the immutable citation target.

## Workflow

1. **Scan** `raw/sources/` for unprocessed captures (skip hidden files)
2. **Classify** each capture:
   - Identify source type, topic, related entities, and lifecycle state
   - Match against existing `projects/`, `ideas/`, and `notes/`
   - Mark confidence as high, medium, or low
3. **Plan moves**:
   - Choose the most specific destination path
   - Detect filename collisions and propose minimal safe renames
   - Detect duplicate or continuation captures and propose merge targets
   - Check for the `external` tag and decide copy/move/merge vs synthesis
   - Leave low-confidence items in place and list the decision needed
4. **Move or merge** high-confidence sources to their destination paths
5. **Update** navigation and ops trail only as needed:
   - Add moved durable files to `index.md` when they belong in active navigation
   - Rewrite links for merged files when a canonical destination replaces them
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
- Do not synthesize untagged sources unless the user explicitly asks for it
- Do not remove the `external` tag from archived source records
- Non-destructive edits by default — source files are moved, not rewritten
- Merges are additive by default and must preserve provenance
- Confirm before execution unless `--yes`
- Do not mutate file contents under `raw/sources/`, `raw/processed/`, or
  `raw/assets/`
- Do not assume or create an inbox staging layer

## Output

Return:

- discovered captures and classification plan
- category, confidence, and destination path for each source
- source files moved and final destination paths
- files merged, merge target, and provenance retained
- synthesized items, archived complete source paths, and links inserted
- source files left in place with ambiguity reason
- `index.md` additions
- `log.md` entry appended
- audit findings (empty folders, anomalies)
- fixes applied (if any)
- manual follow-up items
