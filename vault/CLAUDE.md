# AGENTS.md

This file provides guidance to AI agents when working with code in this
repository.

## Project Overview

This is a Claude Code plugin for Zettelkasten-style vault management in
Obsidian. It processes inbox items into linked notes, organizes files, and
researches topics.

## Architecture

**Plugin Structure:**

- `.claude-plugin/plugin.json` - Plugin manifest (name: "vault", version 0.0.1)
- `commands/` - Slash commands:
  - **Management:** `/vault:init`, `/vault:process`, `/vault:organize`,
    `/vault:compact`, `/vault:cleanup`
  - **Thinking:** `/vault:ideas`, `/vault:trace`, `/vault:connect`,
    `/vault:drift`, `/vault:challenge`, `/vault:review`
  - **Research:** `/vault:research`
- `agents/` - Subagent definitions (e.g., `researcher.md` for deep research
  tasks)
- `skills/` - Context-aware skills

**Command Files Are Prompts:** Each `.md` file in `commands/` is a full prompt
definition with YAML frontmatter for description. Commands define multi-step
processes that Claude executes, not code to run.

**Subagent Pattern:** The plugin uses subagents to parallelize work and minimize
costs:

- `haiku` model for simple tasks (content classification, URL fetching, concept
  extraction)
- `sonnet` model for complex reasoning (link discovery, research synthesis)

Subagents are launched via the Task tool with `run_in_background: true` for
parallel execution.

## Key Concepts

**Frontmatter Schema:**

```yaml
# Universal fields (all notes)
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [freeform, tags]
source: inbox | url | manual

# Optional (for projects/ideas)
status: active | someday | done | archived
```

**File Organization:**

- `inbox/` - Raw captures (links, thoughts, daily logs)
- `inbox/_processed/` - Archived processed items with date folders
- `daily/` - Daily notes created by `/vault:review`
- `_templates/` - Note templates (e.g., `daily.md` for Obsidian)
- `._meta/plans/` - Execution plans saved before filesystem changes

**Two-Pass Processing:**

1. First pass: Parse inbox, create/update notes
2. Second pass: Discover concept matches, add bidirectional links

**Linking:**

- Inline `[[wikilinks]]` where concepts are mentioned naturally
- `## Related` section for discovered connections
- Backlinks added to target notes automatically

## Safety Rules

- Never touch hidden folders (`.git/`, `.obsidian/`, `._meta/`)
- Save execution plans to disk before making changes
- Archive inbox items before deleting (to `_processed/`)
- Ask for confirmation before reorganizing files (unless `--yes` flag)
- Skip inbox folder during organize (use process instead)

## Naming Conventions

- Folders: lowercase, kebab-case (`my-project-name/`)
- Files: lowercase, kebab-case (`my-file-name.md`)
- System folders: Prefix with `_` (`_processed/`)

## Thresholds

- Substantial thought: >280 characters (longer than a tweet) → new note
- Short thought: ≤280 characters → append to related note if match found
- Link limit: ~5 discovered links per note (prevent spam)
- Cleanup default: 90 days for processed items and plan files
