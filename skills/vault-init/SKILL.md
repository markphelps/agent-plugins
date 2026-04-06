---
name: vault-init
description: Initialize vault folder structure in the current project
---

# Initialize Vault

Set up the vault plugin folder structure in the current directory.

## Arguments

`arguments` - Optional path to vault root. Defaults to current working
directory.

**Examples:**

```
vault-init                     # Initialize in current directory
vault-init ./my-vault          # Initialize in specific folder
vault-init ~/Documents/notes   # Absolute path
```

## Process

### Step 1: Confirm location

Tell the user where you'll create the vault structure:

```
Initializing vault in: /path/to/vault
```

### Step 2: Create folder structure

Create these folders if they don't exist:

```
vault/
├── inbox/           # Where raw captures go
├── daily/           # Daily notes (used by vault-review)
├── _templates/      # Note templates
│   └── daily.md     # Daily note template (for Obsidian)
└── ._meta/
    └── plans/       # Execution plans saved here
```

Use `mkdir -p` to create folders (safe if they already exist).

### Step 3: Create daily note template

Create the template file for daily notes:

**\_templates/daily.md:**

```markdown
---
created: { { date } }
updated: { { date } }
tags: [daily]
---

# {{date}}

## Plan

-

## Log

-

## Ideas

-

## Carry Forward

-
```

The `{{date}}` placeholders work with Obsidian's Templater or core Templates
plugin. Users can also just use `vault-review` which creates daily notes
directly.

### Step 4: Create starter files (optional)

If `inbox/` was just created (was empty), create a welcome file:

**inbox/welcome.md:**

```markdown
# Welcome to your vault inbox

Drop ideas, links, and thoughts here. Then run `vault-process` to turn them into
linked notes.

## Examples of what to capture

- URLs you want to remember
- Shower thoughts and random ideas
- Daily logs with `## Heading` separators
- Anything you don't want to forget

---

Delete this file once you've added your first real item.
```

### Step 5: Report results

```
✓ Vault initialized

Created:
  - inbox/
  - daily/
  - _templates/daily.md
  - ._meta/plans/

Next steps:
  1. Add items to inbox/ (links, thoughts, daily logs)
  2. Run vault-process to create linked notes
  3. Run vault-review morning to start your day
  4. Run vault-organize to clean up file structure
```

If folders already existed, say so:

```
✓ Vault already initialized

Existing folders found:
  - inbox/ (5 items)
  - daily/
  - ._meta/plans/

Ready to use. Run vault-process to process inbox items.
```

**Obsidian tip:** Enable the Daily Notes core plugin and set:

- Template: `_templates/daily`
- Folder: `daily`
- Date format: `YYYY-MM-DD`

## Safety

- Never overwrite existing files
- Never delete anything
- Safe to run multiple times (idempotent)
