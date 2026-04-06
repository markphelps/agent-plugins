---
name: declaudify-repo
description:
  Migrate repositories away from Claude-specific agent config to neutral,
  portable AI-agent standards. Converts CLAUDE.md/.claude artifacts and Claude
  plugin manifests to Codex-compatible plugin + marketplace structure.
---

# Declaudify

Normalize AI-agent config so the repo is portable across agent runtimes.

## When to use

Use this skill when a repository contains Claude-specific artifacts such as:

- `CLAUDE.md`
- `.claude/` folders (`commands`, `hooks`, `skills`, `agents`)
- `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`
- Claude-specific wording in README, scripts, or CI

## Goals

1. Preserve behavior while removing Claude lock-in.
2. Prefer neutral formats and Codex-compatible plugin paths.
3. Keep migration safe: inventory first, dry-run by default, reversible edits.

## Target standards

- `AGENTS.md` as the canonical instruction file.
- Reusable skills as folder-based skills with `SKILL.md` frontmatter (`name`,
  `description`).
- Hooks via standard git/husky/lefthook locations.
- Codex plugin manifest at `.codex-plugin/plugin.json`.
- Codex marketplace at `.agents/plugins/marketplace.json` with plugin entries
  that include:
  - `source: { source: "local", path: "..." }`
  - `policy.installation`
  - `policy.authentication`
  - `category`

See [references/standards-map.md](references/standards-map.md) for detailed
mappings and [references/skills-sh.md](references/skills-sh.md) for skills
interoperability.

## Process

1. Inventory Claude-specific artifacts.
2. Propose a mapping plan with file-by-file targets.
3. Run dry-run transformation.
4. Apply transformation.
5. Validate with lint/test/typecheck and search for leftover Claude-specific
   references.

## Commands

Use the bundled script:

```bash
# Inventory + planned changes only
bash ./scripts/declaudify.sh --dry-run

# Apply migration (keeps backups in .declaudify-backups/)
bash ./scripts/declaudify.sh --write

# Apply and remove migrated Claude-specific files after copying
bash ./scripts/declaudify.sh --write --cleanup

# Run against a different repo
bash ./scripts/declaudify.sh --root /path/to/repo --dry-run
```

## Completion checklist

- `AGENTS.md` exists and is not just a symlink to `CLAUDE.md`.
- `.claude/*` content is migrated to neutral locations.
- Each migrated plugin has `.codex-plugin/plugin.json`.
- If marketplace exists, `.agents/plugins/marketplace.json` exists with Codex
  schema.
- Migrated skills have `skills/<name>/SKILL.md` (or
  `.agents/skills/<name>/SKILL.md`).
- `rg -n "CLAUDE.md|\\.claude/|\\.claude-plugin"` only returns intentional
  legacy references.
