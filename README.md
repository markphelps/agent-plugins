# Claude Plugins

A collection of plugins for AI

## Available Plugins

| Plugin                        | Description                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [vault](./vault/)             | Zettelkasten-style vault manager for Obsidian. Process inbox, organize files, research topics, and think with your notes. |
| [development](./development/) | Developer workflow tools — session handoffs, context management, and productivity utilities.                              |

## Installation

```bash
# Add this repository as a plugin marketplace
/plugin marketplace add https://github.com/markphelps/claude-plugins

# Install individual plugins
/plugin install vault
```

## For Codex (`/install`)

From Codex chat, you can install this marketplace with:

```bash
/plugin marketplace add https://github.com/markphelps/claude-plugins
```

Then install whichever plugins you want:

```bash
/plugin install vault
/plugin install development
```

You can also browse all available marketplace plugins with:

```bash
/plugin marketplace list
```

## Creating Your Own Plugin

See [CLAUDE.md](./CLAUDE.md) for plugin architecture and structure.

For official documentation, see the
[Claude Code Plugins Guide](https://code.claude.com/docs/en/plugins).

## Development

```bash
npm install          # Install dev dependencies (sets up husky hooks)
npm run format       # Format all markdown and JSON files
npm run validate     # Validate all plugin.json manifests
```

Pre-commit hooks automatically format staged files and validate plugin
manifests.

## Author

Mark Phelps

## License

[MIT](LICENSE.md)
