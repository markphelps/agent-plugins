---
name: vault-init
description: Initialize raw-first vault folder structure in the current project
---

# Initialize Vault

Set up a raw-first vault structure in the target directory.

## Arguments

`arguments` - Optional path to vault root. Defaults to current working
directory.

**Examples:**

```
vault-init
vault-init ./my-vault
vault-init ~/Documents/notes
```

## Process

### Step 1: Confirm location

Report target path before creating files.

### Step 2: Create folder structure

Create if missing:

```
vault/
├── raw/
│   ├── inbox/        # unprocessed captures
│   ├── sources/      # immutable source material
│   ├── assets/       # attachments/media
│   └── processed/    # archived originals by date
├── daily/
├── _templates/
│   └── daily.md
├── notes/
├── projects/
├── index.md
└── log.md
```

### Step 3: Create daily note template

Create `_templates/daily.md` if missing:

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

### Step 4: Create starter operational files

Create `index.md` and `log.md` if missing with minimal boilerplate.

Create `raw/inbox/welcome.md` only when `raw/inbox/` is empty.

### Step 5: Report results

Summarize created vs existing paths and suggest:

1. Add captures to `raw/inbox/`
2. Run `vault-process`
3. Run `vault-index` and `vault-log` as needed

## Safety

- Never overwrite existing content without explicit permission.
- Never delete anything.
- Idempotent on repeated runs.
