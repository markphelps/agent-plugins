#!/usr/bin/env bash
set -euo pipefail

ROOT="."
MODE="dry-run"
CLEANUP=0
BACKUP_DIR=".declaudify-backups"

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--root PATH] [--dry-run] [--write] [--cleanup]

Options:
  --root PATH   Repository root (default: current directory)
  --dry-run     Show planned changes only (default)
  --write       Apply changes
  --cleanup     Remove migrated Claude-specific source files (requires --write)
  -h, --help    Show this help
USAGE
}

log() {
  printf '[declaudify] %s\n' "$*"
}

backup_path() {
  local src="$1"
  local dst="$BACKUP_DIR/$src"
  mkdir -p "$(dirname "$dst")"
  cp -a "$src" "$dst"
}

safe_copy_file() {
  local src="$1"
  local dst="$2"

  if [[ ! -f "$src" ]]; then
    return 0
  fi

  if [[ -f "$dst" ]]; then
    log "skip existing: $dst"
    return 0
  fi

  log "copy file: $src -> $dst"
  if [[ "$MODE" == "write" ]]; then
    mkdir -p "$(dirname "$dst")"
    cp -a "$src" "$dst"
  fi
}

safe_copy_dir_contents() {
  local src_dir="$1"
  local dst_dir="$2"

  if [[ ! -d "$src_dir" ]]; then
    return 0
  fi

  while IFS= read -r -d '' src; do
    local rel="${src#"$src_dir"/}"
    local dst="$dst_dir/$rel"
    if [[ -e "$dst" ]]; then
      log "skip existing: $dst"
      continue
    fi
    log "copy file: $src -> $dst"
    if [[ "$MODE" == "write" ]]; then
      mkdir -p "$(dirname "$dst")"
      cp -a "$src" "$dst"
    fi
  done < <(find "$src_dir" -type f -print0)
}

rewrite_heading() {
  local path="$1"
  if [[ "$MODE" != "write" || ! -f "$path" ]]; then
    return 0
  fi

  local tmp
  tmp="$(mktemp)"
  awk 'NR==1{sub(/^# CLAUDE\.md$/, "# AGENTS.md")}; {print}' "$path" > "$tmp"
  mv "$tmp" "$path"
}

normalize_agents_wording() {
  local path="$1"
  if [[ "$MODE" != "write" || ! -f "$path" ]]; then
    return 0
  fi

  local tmp
  tmp="$(mktemp)"
  awk '
    {
      gsub(/Claude Code \(claude\.ai\/code\)/, "AI agents")
      gsub(/Claude Code/, "AI agents")
      print
    }
  ' "$path" > "$tmp"
  mv "$tmp" "$path"
}

convert_plugin_manifest() {
  local src="$1"
  local dst="$2"

  if [[ ! -f "$src" ]]; then
    return 0
  fi
  if [[ -f "$dst" ]]; then
    log "skip existing: $dst"
    return 0
  fi

  log "convert plugin manifest: $src -> $dst"
  if [[ "$MODE" != "write" ]]; then
    return 0
  fi

  mkdir -p "$(dirname "$dst")"
  jq '
    .
    | .skills = (if has("skills") then .skills else "./skills/" end)
  ' "$src" > "$dst"
}

convert_marketplace() {
  local src=".claude-plugin/marketplace.json"
  local dst=".agents/plugins/marketplace.json"

  if [[ ! -f "$src" ]]; then
    return 0
  fi
  if [[ -f "$dst" ]]; then
    log "skip existing: $dst"
    return 0
  fi

  log "convert marketplace: $src -> $dst"
  if [[ "$MODE" != "write" ]]; then
    return 0
  fi

  mkdir -p ".agents/plugins"
  jq '
    {
      name: (.name // "local-marketplace"),
      interface: { displayName: ((.name // "Local Marketplace") | gsub("-"; " ")) },
      plugins: (
        (.plugins // [])
        | map({
            name: .name,
            source: {
              source: "local",
              path: (
                if (.source | type) == "string" then .source else .source.path end
              )
            },
            policy: {
              installation: "AVAILABLE",
              authentication: "ON_INSTALL"
            },
            category: (.category // "Productivity")
          })
      )
    }
  ' "$src" > "$dst"
}

migrate_claude_skills_to_skill_md() {
  local src_root=".claude/skills"
  if [[ ! -d "$src_root" ]]; then
    return 0
  fi

  while IFS= read -r -d '' src_skill; do
    local skill_name dst_skill
    skill_name="$(basename "$src_skill")"
    dst_skill="skills/$skill_name"

    log "copy skill dir: $src_skill -> $dst_skill"
    if [[ "$MODE" == "write" ]]; then
      mkdir -p "$dst_skill"
      cp -a "$src_skill/." "$dst_skill/"
    fi

    if [[ -f "$dst_skill/SKILL.md" ]]; then
      continue
    fi

    for cand in "$dst_skill/README.md" "$dst_skill/skill.md" "$dst_skill/prompt.md"; do
      if [[ -f "$cand" ]]; then
        log "promote skill doc: $cand -> $dst_skill/SKILL.md"
        if [[ "$MODE" == "write" ]]; then
          cp -a "$cand" "$dst_skill/SKILL.md"
        fi
        break
      fi
    done
  done < <(find "$src_root" -mindepth 1 -maxdepth 1 -type d -print0)
}

convert_plugin_commands_to_skill_stubs() {
  local plugin_dir="$1"
  local commands_dir="$plugin_dir/commands"
  local skills_dir="$plugin_dir/skills"

  if [[ ! -d "$commands_dir" ]]; then
    return 0
  fi

  while IFS= read -r -d '' cmd_file; do
    local base skill_name dst_dir dst
    base="$(basename "$cmd_file" .md)"
    skill_name="${plugin_dir##*/}-$base"
    dst_dir="$skills_dir/$skill_name"
    dst="$dst_dir/SKILL.md"

    if [[ -f "$dst" ]]; then
      continue
    fi

    log "create skill stub from command: $cmd_file -> $dst"
    if [[ "$MODE" == "write" ]]; then
      mkdir -p "$dst_dir"
      {
        printf -- "---\n"
        printf 'name: %s\n' "$skill_name"
        printf 'description: Migrated from %s command %s.\n' "${plugin_dir##*/}" "$base"
        printf -- "---\n\n"
        cat "$cmd_file"
      } > "$dst"
    fi
  done < <(find "$commands_dir" -type f -name '*.md' -print0)
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --root)
        ROOT="$2"
        shift 2
        ;;
      --dry-run)
        MODE="dry-run"
        shift
        ;;
      --write)
        MODE="write"
        shift
        ;;
      --cleanup)
        CLEANUP=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "Unknown option: $1" >&2
        usage
        exit 1
        ;;
    esac
  done

  if [[ "$CLEANUP" -eq 1 && "$MODE" != "write" ]]; then
    echo "--cleanup requires --write" >&2
    exit 1
  fi

  if ! command -v jq >/dev/null 2>&1; then
    echo "jq is required" >&2
    exit 1
  fi
}

run() {
  cd "$ROOT"

  log "mode: $MODE"
  log "root: $(pwd)"

  if [[ "$MODE" == "write" ]]; then
    mkdir -p "$BACKUP_DIR"
  fi

  if [[ -L "AGENTS.md" ]]; then
    local target
    target="$(readlink AGENTS.md || true)"
    log "found symlink: AGENTS.md -> ${target:-unknown}"
    if [[ "$MODE" == "write" ]]; then
      backup_path "AGENTS.md"
      rm -f "AGENTS.md"
    fi
  fi

  if [[ -f "CLAUDE.md" ]]; then
    safe_copy_file "CLAUDE.md" "AGENTS.md"
    rewrite_heading "AGENTS.md"
  fi
  normalize_agents_wording "AGENTS.md"

  safe_copy_dir_contents ".claude/commands" ".agents/commands"
  safe_copy_dir_contents ".claude/hooks" ".githooks/ai-agent"
  migrate_claude_skills_to_skill_md

  if [[ -d ".claude-plugin" ]]; then
    convert_marketplace
  fi

  while IFS= read -r -d '' plugin_manifest; do
    local plugin_root
    plugin_root="$(dirname "$(dirname "$plugin_manifest")")"
    convert_plugin_manifest "$plugin_manifest" "$plugin_root/.codex-plugin/plugin.json"
    convert_plugin_commands_to_skill_stubs "$plugin_root"
  done < <(find . -type f -path '*/.claude-plugin/plugin.json' -print0)

  if [[ "$CLEANUP" -eq 1 ]]; then
    for path in ".claude/commands" ".claude/hooks" ".claude/skills" ".claude-plugin"; do
      if [[ -e "$path" ]]; then
        log "cleanup path: $path"
        if [[ "$MODE" == "write" ]]; then
          backup_path "$path"
          rm -rf "$path"
        fi
      fi
    done

    while IFS= read -r -d '' p; do
      local d
      d="$(dirname "$p")"
      if [[ -e "$d/.claude-plugin" ]]; then
        log "cleanup path: $d/.claude-plugin"
        if [[ "$MODE" == "write" ]]; then
          backup_path "$d/.claude-plugin"
          rm -rf "$d/.claude-plugin"
        fi
      fi
    done < <(find . -type f -path '*/.claude-plugin/plugin.json' -print0)
  fi

  log "scan for residual Claude-specific references"
  if rg -n --hidden --glob '!.git' --glob '!node_modules' 'CLAUDE\.md|(^|[^A-Za-z])Claude([^A-Za-z]|$)|\.claude/' .; then
    log "residual references found; inspect and normalize manually"
  else
    log "no residual Claude references found"
  fi

  log "complete"
}

parse_args "$@"
run
