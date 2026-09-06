# Agent Plugins

Reusable agent plugins and skills following AGENTS/skills conventions.

## Standards

- AGENTS.md: https://agents.md/
- skills format: https://skills.sh/docs

## Plugins

| Plugin                        | Description                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [vault](./vault/)             | Zettelkasten-style vault workflows for Obsidian notes                                                          |
| [development](./development/) | Agent context, PR fixups, CLI design, OSS readiness and marketing, session log audits, and self-hosted runners |

## Layout

- `.agents/plugins/marketplace.json` - local plugin marketplace for Codex
- `*/.codex-plugin/plugin.json` - plugin manifests
- `*/skills/*/SKILL.md` - skill implementations, the source of truth
- `skills/` - generated flat mirror for skills.sh, written by `npm run sync`
- `.codex/agents/*.toml` - project-scoped Codex subagents
- `AGENTS.md` - repository-level agent instructions
- `mise.toml` - pinned tool versions, used by local development and CI

## Using With Codex

1. Open this repo in Codex.
2. Restart Codex so plugin discovery refreshes.
3. Install from the Plugin Directory (marketplace:
   `.agents/plugins/marketplace.json`).

## Using With skills.sh

This repo also provides top-level installable skills under `skills/`.

```bash
npx skills add markphelps/agent-plugins --skill cli-design
```

## Development

Tool versions are pinned in `mise.toml` and managed with
[mise](https://mise.jdx.dev/). Install mise, then let it install the toolchain:

```bash
mise install
```

With mise activated in your shell, `node` and `npm` resolve to the pinned
version automatically. Without it, prefix commands with `mise exec --`.

```bash
npm install
npm run format
npm run validate
npm run sync
actionlint
```

CI runs the same checks: `npm run format:check`, `npm run validate`, and
`actionlint`.

## License

[MIT](LICENSE)
