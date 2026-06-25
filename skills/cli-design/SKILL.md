---
name: cli-design
description: |
  Design, build, or review command-line interfaces using the Command Line Interface Guidelines from clig.dev. Use this skill whenever the user is creating a new CLI, adding commands/subcommands/flags, designing help text, choosing stdout/stderr/exit-code behavior, adding JSON or plain output modes, improving error messages, making destructive operations safer, or asking whether a CLI feels good, scriptable, discoverable, or Unix-friendly.
---

# CLI Design

Use this skill to make command-line programs feel humane, predictable, and
composable. Ground decisions in the Command Line Interface Guidelines at
https://clig.dev/: CLIs are text UIs for humans first, but they still need to
behave as good parts in scripts, pipelines, CI, and larger automation systems.

The goal is not to copy old Unix behavior blindly. Prefer conventions because
they make interfaces guessable; break them only when doing so clearly improves
usability.

## Operating model

When designing or reviewing a CLI, separate the work into four surfaces:

1. **Command shape** — names, subcommands, positional args, flags, defaults.
2. **Conversation** — help, errors, suggestions, prompts, confirmations, next
   steps.
3. **I/O contract** — stdout, stderr, stdin, exit codes, TTY behavior,
   machine-readable modes.
4. **Safety and evolution** — destructive actions, dry-runs, idempotence,
   config, env vars, deprecation.

A good answer should explicitly cover all four when the task is broad. For a
narrow task, focus on the relevant surface but still check for knock-on effects.

## First-pass questions

Ask only the questions needed to avoid designing the wrong interface. If the
user's intent is already clear from code or context, inspect first and proceed.

- Who is the primary user: humans in a terminal, scripts/CI, or both?
- Is this a single-purpose command or a `git`-style multitool with subcommands?
- What is the primary output: human status, transformed data, files, remote
  state, or side effects?
- Which operations are destructive, expensive, remote, or surprising?
- What should be stable for automation: command names, flags, JSON schema, plain
  text, config, env vars?

## Design principles

### Human-first, script-friendly

Optimize default output for a human reading a terminal. Preserve scriptability
with explicit stable modes such as `--json`, `--plain`, or `--quiet` rather than
making the default terse and cryptic.

### Say just enough

A CLI says too little when users wonder whether it is hung. It says too much
when important information is buried in noisy logs. Show progress and next steps
for long or multi-step operations, but keep final output scannable.

### Be conversational

Treat each invocation as part of a conversation. Good CLIs help users recover:

- explain what went wrong in ordinary language
- show the invalid value or missing requirement
- suggest the likely correction or next command
- avoid raw stack traces unless a debug mode was requested

### Be robust and feel robust

Make unexpected input graceful. Prefer idempotent operations where practical.
Keep users informed during slow work. A CLI feels fragile when it hangs
silently, prints alarming internals, or makes state-changing guesses without
consent.

## Command and flag design

Prefer an argument parsing library for the implementation language. It should
handle parsing, help, validation, shell completion where possible, and spelling
suggestions.

Design rules:

- Use clear verbs for subcommands: `init`, `list`, `show`, `create`, `delete`,
  `sync`, `login`.
- Prefer standard flag names when a convention exists: `--help`, `--version`,
  `--verbose`, `--quiet`, `--output`, `--format`, `--json`, `--force`,
  `--dry-run`, `--config`.
- Provide long versions for all flags. Use short flags only for common actions;
  do not exhaust the namespace with obscure one-letter flags.
- Prefer flags over positional args for anything optional, ambiguous, or likely
  to grow.
- Keep positional args for required primary nouns where order is obvious:
  `cp <source> <destination>`.
- Avoid catch-all subcommands or ambiguous magic if the same behavior can be
  expressed as clear flags/subcommands.
- Keep changes additive where possible. A flag, env var, config key, command
  name, and output schema are all public interfaces once released.

When proposing a CLI shape, include a small command synopsis and 2-4
representative examples.

## Help and discoverability

Every command and subcommand should support `-h` and `--help`. For multitool
CLIs, also support `help` and `help <subcommand>` when feasible.

Top-level help should include:

- one-sentence purpose
- usage synopsis
- the most common commands or flags first
- 1-3 examples that mirror real tasks
- where to find full documentation or support

If a command needs arguments and is run without them, show concise help rather
than a bare error. Concise help should include what the command does, one or two
examples, common flags, and a pointer to `--help`.

Lead with examples because users copy examples before they read reference text.
For complex workflows, tell a short story through examples that progress from
simple to advanced.

## Output contract

Follow the stream contract:

- Primary command output goes to **stdout**.
- Machine-readable output goes to **stdout**.
- Errors, warnings, progress, logs, and prompts go to **stderr**.
- Success exits `0`; failure exits non-zero. Map distinct non-zero codes only
  when callers can act on them.

TTY behavior:

- If stdout is a TTY, optimize for humans: headings, spacing, aligned columns,
  color with restraint.
- If stdout is not a TTY, disable decoration that would break piping unless
  explicitly requested.
- Disable color when not writing to a terminal, and respect common controls such
  as `NO_COLOR` where appropriate.
- If a command expects piped input but stdin is interactive, print help or an
  explanatory message instead of hanging silently.

Machine-readable modes:

- Offer `--json` for structured automation when the data has nested shape or
  stable fields matter.
- Offer `--plain` or a simple tabular line format when users need `grep`, `awk`,
  or shell-friendly output.
- Keep JSON schemas stable. If human output changes, tell users to script
  against `--json`/`--plain` rather than default text.

## Errors and recovery

Good error messages have four parts when possible:

1. What failed.
2. Why it failed.
3. What the user can do next.
4. A concrete command or flag to try.

Example pattern:

```text
Error: could not find app "billing-api" in project "prod".

Run `tool apps list --project prod` to see available apps.
```

Do not silently autocorrect state-changing input. If the likely fix is safe,
suggest it. If it mutates state, ask interactively or require an explicit flag.

## Safety for destructive operations

Destructive or expensive actions need friction proportional to risk.

- Mild local change: prompt interactively or require `--force` in
  non-interactive mode.
- Broad or remote change: support `--dry-run` and show what will change before
  applying it.
- Severe deletion or irreversible action: require typing the resource name, or
  support a scriptable `--confirm <name>` flag.

Never make prompts the only path. Every interactive flow needs a non-interactive
way to pass the same information via args, flags, config, env vars, or stdin.

## Interactivity and automation

Prompt for missing input only when stdin is interactive. In scripts, CI, or
piped use, fail with a clear message explaining the missing flag or value.

For multi-step workflows, print the next useful command after success. This
teaches the interface and makes state visible:

```text
Created project demo.

Next: tool deploy demo --env staging
```

Support `--verbose` for more detail and `--quiet` for suppressing non-essential
messaging. Keep errors visible even in quiet mode unless the user explicitly
redirects them.

## Configuration and environment

Use config files and environment variables for values that are stable across
invocations, such as auth tokens, default org/project, region, or output
preference.

Make precedence explicit in docs and help when relevant. A common order is:

1. command-line flags
2. environment variables
3. project-local config
4. user config
5. defaults

Do not hide surprising behavior in config. If a command will affect remote state
or many files because of config, show the resolved target before acting or in
`--dry-run`.

## Review checklist

When reviewing an existing CLI, report findings under these headings:

1. **Top issues** — the highest-impact usability or automation problems.
2. **Command shape** — names, args, flags, defaults, consistency.
3. **Help and discovery** — help text, examples, suggestions, docs links.
4. **I/O and scriptability** — stdout/stderr, exit codes, TTY behavior,
   JSON/plain modes.
5. **Errors and safety** — recovery messages, prompts, destructive actions,
   dry-runs.
6. **Recommended changes** — concrete command examples or implementation notes.

Prefer specific rewrites over vague advice. For example, write the improved
error text, proposed help section, or new command synopsis.

## Implementation checklist

Before calling a CLI design complete, verify:

- `cmd --help` and `cmd -h` work.
- Each subcommand has help and examples.
- No-arg behavior is helpful: concise help or intentional interactive mode.
- stdout contains only primary output; stderr contains logs/progress/errors.
- exit code is `0` on success and non-zero on failure.
- color/progress adapts to TTY and can be disabled.
- machine-readable output exists where users will script against results.
- destructive actions have confirmation, `--force`, `--confirm`, or `--dry-run`
  as appropriate.
- prompts are never required for automation.
- errors explain what happened and how to recover.
- docs state stability guarantees and deprecation path for interfaces.
