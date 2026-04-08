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
│   ├── sources/      # unprocessed source inbox
│   ├── assets/       # attachments/media
│   └── processed/    # immutable processed-source archive by date
├── notes/
├── projects/
├── archive/
├── resources/
├── index.md
└── log.md
```

### Step 3: Create starter operational files

Create `index.md` and `log.md` if missing with minimal boilerplate.

### Step 4: Report results

Summarize created vs existing paths and suggest:

1. Add captures directly to `raw/sources/`
2. Run `vault-process`
3. Move superseded curated pages into `archive/` when they no longer belong in
   active navigation
4. Run `vault-index` and `vault-log` as needed

## Safety

- Never overwrite existing content without explicit permission.
- Never create or depend on an inbox staging layer.
- Never delete anything.
- Idempotent on repeated runs.
