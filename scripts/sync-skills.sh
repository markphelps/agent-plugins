#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/skills"

# Root-level directories we never treat as plugin roots.
IGNORE_RE='^(\.git|node_modules|\.agents|\.github|scripts|docs|skills|\.husky)$'

declare -A SKILL_SRC

echo "[sync-skills] scanning plugin skill directories..."

while IFS= read -r plugin_dir; do
  skills_root="$plugin_dir/skills"
  [[ -d "$skills_root" ]] || continue

  while IFS= read -r skill_dir; do
    [[ -f "$skill_dir/SKILL.md" ]] || continue
    skill_name="$(basename "$skill_dir")"

    if [[ -n "${SKILL_SRC[$skill_name]:-}" && "${SKILL_SRC[$skill_name]}" != "$skill_dir" ]]; then
      echo "[sync-skills] duplicate skill name '$skill_name' found:" >&2
      echo "  - ${SKILL_SRC[$skill_name]}" >&2
      echo "  - $skill_dir" >&2
      echo "Rename one of them before syncing." >&2
      exit 1
    fi

    SKILL_SRC[$skill_name]="$skill_dir"
  done < <(find "$skills_root" -mindepth 1 -maxdepth 1 -type d | sort)
done < <(
  find "$ROOT" -mindepth 1 -maxdepth 1 -type d | while IFS= read -r d; do
    base="$(basename "$d")"
    if [[ "$base" =~ $IGNORE_RE ]]; then
      continue
    fi
    # Treat directories with a codex plugin manifest as plugin roots.
    if [[ -f "$d/.codex-plugin/plugin.json" ]]; then
      echo "$d"
    fi
  done | sort
)

mkdir -p "$DEST"

# Remove stale top-level skills not present in plugin skill roots.
while IFS= read -r existing; do
  name="$(basename "$existing")"
  if [[ -z "${SKILL_SRC[$name]:-}" ]]; then
    echo "[sync-skills] removing stale skill: $name"
    rm -rf "$existing"
  fi
done < <(find "$DEST" -mindepth 1 -maxdepth 1 -type d | sort)

# Sync each skill directory.
for name in "${!SKILL_SRC[@]}"; do
  src="${SKILL_SRC[$name]}"
  dst="$DEST/$name"
  mkdir -p "$dst"
  rsync -a --delete "$src/" "$dst/"
  echo "[sync-skills] synced: $name"
done

echo "[sync-skills] done"
