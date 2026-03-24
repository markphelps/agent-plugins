# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Repository Overview

This is a Claude Code plugin marketplace. Each subdirectory is a standalone
plugin with its own `.claude-plugin/plugin.json` manifest.

**Structure:**

```
claude-plugins/
├── .claude-plugin/marketplace.json  # Marketplace manifest listing all plugins
├── vault/                           # Zettelkasten vault manager plugin
│   ├── .claude-plugin/plugin.json
│   ├── commands/
│   ├── agents/
│   └── skills/
└── development/                     # Developer workflow tools plugin
    ├── .claude-plugin/plugin.json
    └── skills/
```

## Plugin Architecture

**Command files are prompts**, not code. Each `.md` file in `commands/` is a
full prompt definition with YAML frontmatter for description. Claude executes
the process described, not code.

**Subagent pattern:** Plugins use the Task tool with model selection:

- `model: "haiku"` - cheap/fast work (classification, web fetches, extraction)
- `model: "sonnet"` - complex reasoning (link discovery, synthesis)
- `model: "opus"` - extensive work requiring deep research, planning, or
  multi-step reasoning

Use `run_in_background: true` for parallel execution.

## Adding a New Plugin

1. Create a new directory at root level
2. Add `.claude-plugin/plugin.json` with:
   ```json
   {
     "name": "plugin-name",
     "description": "What it does",
     "version": "0.0.1",
     "author": { "name": "Your Name" }
   }
   ```
3. Register in `.claude-plugin/marketplace.json` under `plugins` array
4. Add commands in `commands/`, agents in `agents/`, skills in `skills/`

## Git Commit Rules

Always use the `-s` flag when creating commits (sign-off).
