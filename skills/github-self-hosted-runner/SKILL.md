---
name: github-self-hosted-runner
description:
  Install, register, namespace, verify, or remove one or more GitHub Actions
  self-hosted runners on a Linux host. Use when a user provides a GitHub
  repository or organization URL and wants a persistent runner managed by
  systemd, including adding another repository-specific runner to a machine that
  already has runners.
---

# GitHub self-hosted runner

Create one isolated runner instance per repository or organization registration.
Determine the account that should own and run the runner instead of assuming a
fixed username or home directory:

```bash
RUNNER_USER="${RUNNER_USER:-${SUDO_USER:-$USER}}"
RUNNER_GROUP="$(id -gn "$RUNNER_USER")"
RUNNER_HOME="$(getent passwd "$RUNNER_USER" | cut -d: -f6)"
RUNNER_ROOT="$RUNNER_HOME/actions-runners"
```

Validate that all four values are non-empty and that `RUNNER_HOME` exists. When
commands are run through `sudo`, do not accidentally use root's `$USER` or
`$HOME` as the runner account.

Namespace every instance by target slug:

- Directory: `$RUNNER_ROOT/<slug>`
- Runner name: `<hostname>-<slug>`
- Custom label: `<slug>`
- Service: `github-actions-runner@<slug>.service`

For example, `https://github.com/owner/blog` becomes:

- `$RUNNER_ROOT/blog`
- `<hostname>-blog`
- label `blog`
- `github-actions-runner@blog.service`

## Required inputs

Obtain:

1. A repository URL such as `https://github.com/owner/repository`, or an
   organization URL such as `https://github.com/organization`.
2. A GitHub credential authorized to manage self-hosted runners:
   - classic PAT with `repo` scope for a repository, or
   - an appropriately scoped fine-grained token.

GitHub does not support account-wide runners for a personal user URL. If a
one-segment GitHub URL belongs to a personal account rather than an
organization, ask for a repository URL.

Treat credentials as secrets:

- Never print a token.
- Never include it in a service unit, repository, skill file, or persistent
  environment file.
- Put it in a mode-`0600` temporary file only for the registration operation,
  then securely delete it.
- Recommend rotating any token pasted into chat after setup.

## Preflight

1. Detect the hostname and architecture.
2. Convert architecture names for GitHub assets:
   - `x86_64` → `x64`
   - `aarch64` or `arm64` → `arm64`
3. Derive a lowercase filesystem-safe slug from the repository name or
   organization name. Allow only letters, digits, `_`, and `-`.
4. Check whether the destination directory, runner registration, or service
   already exists.
5. Check for active jobs before stopping, replacing, or removing an existing
   runner. Do not interrupt a job without user confirmation.
6. Ensure `curl`, `tar`, `python3`, and `systemd` are available.

If the instance already exists and is healthy, report that instead of creating a
duplicate. If reconfiguration is requested, unregister the old instance before
replacing it.

## Install the runner

Fetch release metadata from GitHub's official API:

```bash
curl -fsSL https://api.github.com/repos/actions/runner/releases/latest
```

Select the asset named like:

```text
actions-runner-linux-<arch>-<version>.tar.gz
```

Read its `browser_download_url` and `digest`. Download to a temporary archive,
verify the SHA-256 digest, and only then extract it into:

```text
$RUNNER_ROOT/<slug>
```

Set ownership recursively to `$RUNNER_USER:$RUNNER_GROUP`. Delete the temporary
archive even when a command fails.

Always use a fresh runner distribution for a new instance. Do not copy
`.runner`, `.credentials`, `_diag`, or `_work` from another instance.

## Register

Run `config.sh` as `$RUNNER_USER` from inside the instance directory. The
working directory matters because runner scripts use relative paths.

Use:

```bash
./config.sh \
  --url '<github-url>' \
  --pat "$GITHUB_TOKEN" \
  --unattended \
  --name '<hostname>-<slug>' \
  --labels '<slug>' \
  --replace
```

Pass the PAT from the protected temporary file and securely remove that file
immediately afterward. Do not persist the PAT; GitHub exchanges it for runner
credentials during registration.

Do not use `--replace` to overwrite an unrelated live runner. Confirm that an
existing runner with the same name belongs to this VM and target.

## Configure systemd

Render a reusable template unit at
`/etc/systemd/system/github-actions-runner@.service` using the resolved runner
account values. Shell variables are not expanded by systemd in `User=`,
`Group=`, `WorkingDirectory=`, or `ExecStart=`, so expand them while writing the
unit:

```bash
sudo tee /etc/systemd/system/github-actions-runner@.service >/dev/null <<EOF
[Unit]
Description=GitHub Actions self-hosted runner (%i)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${RUNNER_USER}
Group=${RUNNER_GROUP}
WorkingDirectory=${RUNNER_ROOT}/%i
ExecStart=${RUNNER_ROOT}/%i/run.sh
Restart=always
RestartSec=5
KillSignal=SIGINT
TimeoutStopSec=90

[Install]
WantedBy=multi-user.target
EOF
```

After creating or changing the template:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now github-actions-runner@<slug>.service
```

Before replacing an existing systemd template, inspect it and confirm that its
user and root directory match `$RUNNER_USER` and `$RUNNER_ROOT`. Do not disrupt
existing runner instances owned by another account.

## Verify

Verify all of the following:

```bash
systemctl is-enabled github-actions-runner@<slug>.service
systemctl is-active github-actions-runner@<slug>.service
journalctl -u github-actions-runner@<slug>.service --no-pager -n 20
```

The journal must show:

```text
Connected to GitHub
Listening for Jobs
```

Read `.runner` using UTF-8 with BOM support and confirm:

- `agentName` is `<hostname>-<slug>`
- `gitHubUrl` is the requested target
- `workFolder` is `_work`

Tell the user they can target the instance with:

```yaml
runs-on: [self-hosted, <slug>]
```

Report the runner name, directory, label, service, version, and active/listening
status. Do not repeat the token.

## Multiple runners on one VM

Each runner needs its own directory, local credentials, listener process, label,
and systemd instance. Multiple instances can run concurrently but share the VM's
CPU, memory, disk, network, and—when run as the same Linux user—filesystem trust
boundary.

Use separate Linux users or separate VMs for repositories that should not trust
each other's workflow code or files.

## Removal or renaming

To remove or rename an instance:

1. Confirm it is not running a job.
2. Disable and stop `github-actions-runner@<slug>.service`.
3. Obtain a short-lived removal token through GitHub's repository or
   organization runner API using the PAT.
4. Run `./config.sh remove --token '<removal-token>'` from the runner directory
   as `$RUNNER_USER`.
5. For a rename, register again with the new runner name and restart the
   service.
6. For permanent removal, delete only that explicit instance directory after
   registration removal succeeds and the user confirms deletion.

Never delete the shared systemd template while other runner instances use it.

## Failure handling

- If registration fails, do not enable a restart-looping service.
- Preserve downloaded binaries when useful for retry, but remove all temporary
  credential files.
- A `404` from an organization registration endpoint often means the supplied
  one-segment URL is a personal account, the token lacks access, or the target
  is incorrect. Verify the target type before retrying.
- If extraction or checksum verification fails, remove the incomplete
  destination or clearly mark it incomplete; never start it.
- If the service starts but does not listen, inspect its journal and verify
  directory ownership, registration files, network access, and the unit's
  working directory.
