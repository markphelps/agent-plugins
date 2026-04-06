---
name: vault-organize
description: Reorganize vault files - rename, group, and update frontmatter
---

# Organize Vault

Reorganize files in the vault - rename to consistent format, group related
files, and update frontmatter. Does not touch the inbox folder.

## Arguments

`arguments` - Path and optional flags.

**Path:** Can be relative or absolute. Resolves from current working directory.

- `vault-organize notes` - Organize `./notes/` relative to cwd
- `vault-organize ./projects` - Relative path
- `vault-organize /Users/me/vault` - Absolute path
- `vault-organize` - Defaults to current directory

**Flags:**

- `--dry-run` - Show plan only, don't execute
- `--yes` - Execute without confirmation
- `--no-move` - Update frontmatter only, don't reorganize files
- `--shallow` - Only reorganize top-level, don't touch subfolders

**Examples:**

```
vault-organize notes              # Analyze, show plan, ask to execute
vault-organize notes --dry-run    # Just show plan
vault-organize notes --yes        # Execute without asking
vault-organize notes --no-move    # Only update frontmatter
```

**Skips:**

- Hidden folders (`.git/`, `.obsidian/`, `._meta/`, etc.)
- Hidden files (`.DS_Store`, `.gitignore`, etc.)
- `inbox/` folder (use `vault-process` for that)

## Process

### Step 1: Discover content

Use Glob and Bash (`ls`) to find:

- All `.md` files
- All subfolders and their contents (recursively by default, top-level if
  `--shallow`)
- Non-markdown files (images, CSVs, etc.)

Build a map of the current structure.

### Step 2: Analyze files (parallelized)

**For large vaults (10+ files), use subagents:**

Launch multiple `small model` subagents in parallel:

```
Task(
  subagent_type: "general-purpose",
  prompt: "Analyze these markdown files and return structured metadata...",
  parallel: true
)
```

Each subagent returns:

- File path
- Suggested folder name
- Suggested file name
- Inferred tags
- Current frontmatter state

**For small vaults (<10 files), analyze directly.**

For each markdown file:

1. Read the content
2. Extract existing frontmatter
3. Extract title for filename:
   - **First choice:** H1 heading (`# Title Here`)
   - **Second choice:** First meaningful sentence (skip frontmatter, blank
     lines)
   - **Fallback:** Keep current filename (just kebab-case it)
4. Determine:
   - What is the core topic?
   - What tags apply?
   - Should it be grouped with other files?

### Step 3: Generate filenames from titles

Convert extracted titles to filenames:

1. **Strip markdown** - Remove `#`, `**`, links, etc.
2. **Convert to kebab-case** - Lowercase, spaces/underscores to hyphens
3. **Remove filler words** - Strip leading "a", "an", "the"
4. **Truncate to 50 characters** - Cut at word boundary, don't leave partial
   words
5. **Add .md extension**

**Examples:**

| Title                                                                         | Generated Filename                       |
| ----------------------------------------------------------------------------- | ---------------------------------------- |
| `# Building a Voice Notes App for iOS`                                        | `building-voice-notes-app-for-ios.md`    |
| `# My Thoughts on the Future of Artificial Intelligence and Machine Learning` | `my-thoughts-on-future-of-artificial.md` |
| `First line is just some random text about cars`                              | `first-line-is-just-some-random-text.md` |
| (no title found)                                                              | `original-filename.md` (kebab-cased)     |

### Step 4: Design new structure

Based on analysis, design an organized structure. Principles:

- **Group by topic** - Related files go together
- **Consistent naming** - lowercase, kebab-case
- **Content-driven filenames** - Derived from title, max 50 chars

Example transformation:

```
BEFORE:
├── Random Thoughts.md              # H1: "My Random Thoughts on Life"
├── carsearch/
│   └── 90-DAY MVP AI CAR SHOPPING AGENT.md  # H1: "90-Day MVP: AI Car Shopping Agent"
├── Voice Notes App idea.md         # H1: "Building a Voice Notes App"
└── voice-notes/
    └── research.md                 # No H1, first line: "Research on voice recording APIs"

AFTER:
├── car-search/
│   └── 90-day-mvp-ai-car-shopping-agent.md
├── voice-notes-app/
│   ├── building-voice-notes-app.md
│   └── research-on-voice-recording-apis.md
└── my-random-thoughts-on-life.md
```

### Step 5: Build and save execution plan

Create the hidden directory if needed:

```bash
mkdir -p ._meta/plans
```

Build the plan:

```json
{
  "created_at": "2025-01-04T15:30:00Z",
  "target_path": "notes/",
  "options": {
    "shallow": false,
    "no_move": false
  },
  "operations": {
    "create_folders": ["voice-notes-app/"],
    "renames": [
      { "from": "carsearch/", "to": "car-search/" },
      { "from": "Random Thoughts.md", "to": "my-random-thoughts-on-life.md" }
    ],
    "moves": [
      {
        "from": "Voice Notes App idea.md",
        "to": "voice-notes-app/building-voice-notes-app.md"
      },
      {
        "from": "voice-notes/research.md",
        "to": "voice-notes-app/research-on-voice-recording-apis.md"
      }
    ],
    "frontmatter_updates": [
      {
        "file": "car-search/90-day-mvp-ai-car-shopping-agent.md",
        "set": {
          "updated": "2025-01-04",
          "tags": ["automotive", "ai"],
          "source": "manual"
        }
      }
    ],
    "delete_empty_folders": ["voice-notes/", "carsearch/"],
    "wikilink_updates": []
  },
  "status": "pending"
}
```

Write to: `._meta/plans/YYYY-MM-DD-HHMMSS.json`

### Step 6: Scan for wikilinks to update

For each file being renamed or moved, scan the **entire vault** for wikilinks
pointing to it:

**Wikilink formats to match:**

- `[[filename]]` - bare filename (no extension)
- `[[filename|display text]]` - with alias
- `[[path/to/filename]]` - with path
- `[[path/to/filename|display text]]` - path with alias

**Build wikilink update map:**

For each rename/move operation, find all `.md` files containing wikilinks to the
old path and record the replacements needed:

```json
"wikilink_updates": [
  {
    "file": "projects/overview.md",
    "replacements": [
      {
        "old": "[[Voice Notes App idea]]",
        "new": "[[voice-notes-app/building-voice-notes-app|Voice Notes App idea]]"
      },
      {
        "old": "[[Voice Notes App idea|my app]]",
        "new": "[[voice-notes-app/building-voice-notes-app|my app]]"
      }
    ]
  }
]
```

**Matching rules:**

1. Match is case-insensitive for the filename portion
2. Preserve the original display text (alias) if present
3. If no alias existed, add one with the original link text (maintains
   readability)
4. Match with or without `.md` extension

### Step 7: Present plan

Display in human-readable format:

```
Proposed reorganization:

RENAMES:
  carsearch/ → car-search/
  "Random Thoughts.md" → "my-random-thoughts-on-life.md"

MOVES:
  "Voice Notes App idea.md" → voice-notes-app/building-voice-notes-app.md
  voice-notes/research.md → voice-notes-app/research-on-voice-recording-apis.md

NEW FOLDERS:
  voice-notes-app/

WIKILINK UPDATES:
  3 files contain links that will be updated

FRONTMATTER UPDATES:
  5 files will have frontmatter added/updated

Plan saved: ._meta/plans/2025-01-04-153000.json
```

**If `--dry-run`:** Stop here.

**If default:** Ask "Execute these changes? [Y/n]"

**If `--yes`:** Proceed to execution.

### Step 8: Execute

Read the plan from disk and execute exactly what's specified:

1. Create new folders (`mkdir -p`)
2. Rename folders (do folders first)
3. Move/rename files
4. Update wikilinks in all affected files
5. Update frontmatter on all markdown files
6. Delete empty folders
7. Update plan status to `"executed"`

### Step 9: Update frontmatter

For each note, ensure frontmatter has:

```yaml
---
updated: YYYY-MM-DD
tags: [inferred, tags]
source: manual
---
```

Preserve existing values where present. Only add `status` field if the note
appears to be a project/idea.

### Step 10: Report results

```
Reorganization complete!

Changes made:
- Renamed 2 folders
- Renamed 3 files
- Moved 2 files
- Updated 12 wikilinks across 3 files
- Updated 8 files with frontmatter

Plan: ._meta/plans/2025-01-04-153000.json (executed)
```

## Naming Conventions

- **Folders:** lowercase, kebab-case (`my-project-name/`)
- **Files:** Derived from H1 title or first sentence, kebab-case, max 50 chars
- **Fallback:** If no title found, kebab-case the original filename
- **System folders:** Prefix with `_` (`_archive/`)

## Safety

- **Always confirm** before changes (unless `--yes`)
- **Save plans to disk** before executing
- **Skip inbox folder** entirely
- **Skip hidden folders** (`.git/`, `.obsidian/`, etc.)
- **Git-aware:** If in a git repo, suggest committing before reorganizing
