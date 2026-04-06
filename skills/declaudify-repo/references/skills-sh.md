# skills.sh Interop Notes

skills.sh documents reusable agent skills and the open-source `skills` CLI.

## Install example

```bash
npx skills add vercel-labs/agent-skills
```

Install this skill from this repository:

```bash
npx skills add markphelps/agent-plugins --skill declaudify-repo
```

## Interop recommendation

- Keep skills as folder-based units with a required `SKILL.md`.
- Avoid runtime-specific instructions in core skill files.
- Put deterministic logic in `scripts/` so behavior can be reused by different
  agents.
