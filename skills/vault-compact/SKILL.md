---
name: vault-compact
description: Merge clusters of small related notes into consolidated files
---

# Compact

Find clusters of small, related notes and merge them into single consolidated
files. Targets date-fragmented notes (daily logs, idea lists, drafts) and
topically similar small notes that would work better as sections in one file.

## Arguments

`arguments` - Path and optional flags.

**Path:** Can be relative or absolute. Defaults to current working directory.

**Flags:**

- `--dry-run` - Show compaction plan only, don't execute
- `--yes` - Execute without confirmation
- `--max-lines N` - Consider notes under N lines as "small" (default: 50)
- `--min-cluster N` - Minimum files to form a cluster (default: 2)

**Examples:**

```
vault-compact                         # Scan cwd, show plan, ask to confirm
vault-compact ./notes --dry-run       # Preview only
vault-compact notes --yes             # Execute without asking
vault-compact --max-lines 30          # Only target very small notes
```

## Process

### Step 1: Find small notes

Scan all `.md` files in the target path (recursively). Skip hidden folders,
`inbox/`, `_processed/`, `._meta/`, `_templates/`.

For each file:

1. Count lines
2. Read frontmatter (tags, updated, created, source)
3. Extract the title (H1 or filename)
4. Note the folder it's in

Filter to files under `--max-lines` threshold.

For large vaults (20+ small files), use small model subagents to parallelize
reading.

### Step 2: Detect clusters

Group small notes into compaction candidates using these signals:

**Date-series detection** (strongest signal):

Files that share a base name with date suffixes are almost always compactable:

- `health-tracker-2026-02-17.md`, `health-tracker-2026-02-18.md`, ... → cluster:
  "health-tracker"
- `tweet-drafts-2026-02-08.md`, `tweet-drafts-2026-02-11.md`, ... → cluster:
  "tweet-drafts"
- `blog-ideas-2026-02-19.md`, `blog-ideas-2026-02-20.md`, ... → cluster:
  "blog-ideas"

Pattern: Strip date suffixes (`YYYY-MM-DD`, `MMM-DD-YYYY`, `mon-D-YYYY`, etc.)
and group by the remaining base name. Also match across folders — files with the
same base name in different locations belong to the same cluster.

**Tag-based clustering:**

Files with high tag overlap (3+ shared tags) and similar size that aren't
date-series but cover the same topic.

**Folder siblings:**

Small files in the same folder with similar content structure.

### Step 3: Design compacted files

For each cluster, design a consolidated file:

**Date-series clusters** → Log-style file with entries by date:

```markdown
---
created: YYYY-MM-DD  (earliest entry)
updated: YYYY-MM-DD  (latest entry)
tags: [union, of, all, tags]
source: compacted
---

# [Base Name]

## YYYY-MM-DD

[Content from that date's file, with frontmatter stripped]

---

## YYYY-MM-DD

[Content from next date's file]

---

[...continuing chronologically, oldest first]
```

**Topic clusters** → Sectioned reference file:

```markdown
---
created: YYYY-MM-DD  (earliest file)
updated: YYYY-MM-DD  (latest file)
tags: [union, of, all, tags]
source: compacted
---

# [Topic Name]

## [Title from file 1]

[Content from file 1]

---

## [Title from file 2]

[Content from file 2]
```

**Rules for merged content:**

- Strip frontmatter from individual entries (it's merged into the top)
- Strip the H1 title if it duplicates the date or section heading
- Preserve all other content exactly as-is
- Separate entries with `---` horizontal rules
- Order chronologically (oldest first) for date-series
- Preserve wikilinks within content

### Step 4: Plan wikilink updates

For each file being compacted, scan the entire vault for wikilinks pointing to
it:

- `[[old-filename]]` → `[[new-filename#YYYY-MM-DD]]` (for date entries)
- `[[old-filename]]` → `[[new-filename#section-title]]` (for topic entries)
- `[[old-filename|alias]]` → preserve alias

Build an update map for all affected files.

### Step 5: Choose destination

Place the compacted file in the most logical location:

1. If all source files are in the same folder → keep it there
2. If files are scattered → place in the folder that has the most source files
3. Move any source files from other locations into the chosen folder first

### Step 6: Build and save execution plan

Save to `._meta/plans/`:

```json
{
  "created_at": "2026-02-23T15:30:00Z",
  "type": "compact",
  "target_path": "notes/",
  "options": {
    "max_lines": 50,
    "min_cluster": 2
  },
  "clusters": [
    {
      "name": "health-tracker",
      "type": "date-series",
      "source_files": [
        "notes/health/health-tracker-2026-02-17.md",
        "notes/health/health-tracker-2026-02-18.md",
        "notes/health-tracker-2026-02-23.md"
      ],
      "destination": "notes/health/health-tracker.md",
      "wikilink_updates": []
    }
  ],
  "status": "pending"
}
```

### Step 7: Present plan

```
Compaction plan:

CLUSTER: health-tracker (date-series, 6 files → 1)
  Sources:
    notes/health/health-tracker-2026-02-17.md (26 lines)
    notes/health/health-tracker-2026-02-18.md (33 lines)
    notes/health/health-tracker-2026-02-19.md (25 lines)
    notes/health/health-tracker-2026-02-20.md (23 lines)
    notes/health/health-tracker-2026-02-21.md (13 lines)
    notes/health-tracker-2026-02-23.md (16 lines)  ← will move to health/
  Destination: notes/health/health-tracker.md
  Wikilinks to update: 3

CLUSTER: tweet-drafts (date-series, 7 files → 1)
  Sources:
    notes/social/tweet-drafts-feb-7-2026.md
    notes/social/tweet-drafts-2026-02-08.md
    ...
  Destination: notes/social/tweet-drafts.md
  Wikilinks to update: 1

CLUSTER: blog-ideas (date-series, 5 files → 1)
  Sources:
    notes/ideas/blog-ideas-2026-02-19.md
    notes/social/blog-ideas-2026-02-16.md  ← will move to ideas/
    notes/blog-ideas-2026-02-23.md  ← will move to ideas/
    ...
  Destination: notes/ideas/blog-ideas.md
  Wikilinks to update: 2

Summary:
  - 3 clusters found
  - 18 files → 3 files
  - 6 wikilinks to update

Plan saved: ._meta/plans/2026-02-23-153000.json
```

**If `--dry-run`:** Stop here.

**If default:** Ask "Execute compaction? [Y/n]"

**If `--yes`:** Proceed.

### Step 8: Execute

For each cluster:

1. Read all source files
2. Build the consolidated content (following the format from Step 3)
3. Write the compacted file
4. Update wikilinks in all affected vault files
5. Delete the original source files
6. Update plan status to `"executed"`

### Step 9: Report results

```
Compaction complete!

health-tracker: 6 files → notes/health/health-tracker.md
  - 6 daily entries preserved chronologically
  - 3 wikilinks updated

tweet-drafts: 7 files → notes/social/tweet-drafts.md
  - 7 entries preserved chronologically
  - 1 wikilink updated

blog-ideas: 5 files → notes/ideas/blog-ideas.md
  - 5 entries preserved chronologically
  - 2 wikilinks updated

Total: 18 files compacted into 3 files
Plan: ._meta/plans/2026-02-23-153000.json (executed)
```

## Subagent Strategy

| Task                  | Model                 | Why                           |
| --------------------- | --------------------- | ----------------------------- |
| File reading/counting | small model           | Simple extraction             |
| Cluster detection     | high-capability model | Pattern matching across files |
| Content merging       | small model           | Straightforward concatenation |
| Wikilink scanning     | small model           | Simple grep                   |

## What NOT to Compact

- Notes with `status: active` (in-progress projects)
- Notes over the line threshold (they're substantial enough to stand alone)
- Notes in `inbox/` or `_processed/` (use `vault-process` and `vault-cleanup`)
- Notes that are the only file on their topic (no cluster partner)
- Template files in `_templates/`

## Safety

- **Always confirm** before executing (unless `--yes`)
- **Save plan to disk** before making changes
- **Preserve all content** — compaction merges, never deletes content
- **Update wikilinks** — don't break the link graph
- **Git-aware** — if in a git repo, suggest committing before compacting
- **Reversible** — plan file records exactly what was done
