# CLI driver

Run the real binary, built the way the repo builds it (`go build`,
`cargo build`, `npm link`), not an imagined invocation.

## Launch

Record the build command and binary path. Use a temporary working directory and
config (`--config`, `HOME=$(mktemp -d)`, or the tool's own env var) so drives
don't touch the user's real config or data.

## Vocabulary

Write each step as the exact command:

```text
$ plot session start --name demo
```

Include required env vars by name, stdin input, and working directory when they
matter.

## Observe

Record the exit code and the key lines of output, plus any files created or
changed. Prefer machine-readable output (`--json`, `--format json`) when the
tool has it, and note the fields that matter. For interactive prompts, record
the prompt text and the input given; if a TTY is required and can't be provided,
mark the entry unverified with that reason.

## Gotchas to check

- Output that differs between TTY and pipe (color, spinners, prompts)
- Global state (config files, caches, lockfiles) leaking between drives
- Commands that need network or credentials
- Destructive commands: drive them only against the temporary directory
