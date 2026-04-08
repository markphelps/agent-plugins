# Agent Plugins

Reusable agent plugins and skills following AGENTS/skills conventions.

## Standards

- AGENTS.md: https://agents.md/
- skills format: https://skills.sh/docs

## Plugins

| Plugin                        | Description                                           |
| ----------------------------- | ----------------------------------------------------- |
| [vault](./vault/)             | Zettelkasten-style vault workflows for Obsidian notes |
| [development](./development/) | Session handoff, workflows, and declaudify migration  |

## Layout

- `.agents/plugins/marketplace.json` - local plugin marketplace for Codex
- `*/.codex-plugin/plugin.json` - plugin manifests
- `*/skills/*/SKILL.md` - skill implementations
- `.codex/agents/*.toml` - project-scoped Codex subagents
- `AGENTS.md` - repository-level agent instructions

## Using With Codex

1. Open this repo in Codex.
2. Restart Codex so plugin discovery refreshes.
3. Install from the Plugin Directory (marketplace:
   `.agents/plugins/marketplace.json`).

## Using With skills.sh

This repo also provides top-level installable skills under `skills/`.

```bash
npx skills add markphelps/agent-plugins --skill declaudify
```

## Development

```bash
npm install
npm run format
npm run validate
npm run sync
```

## License

[MIT](LICENSE)
