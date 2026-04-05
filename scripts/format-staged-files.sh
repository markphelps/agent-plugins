#!/usr/bin/env bash

set -euo pipefail

files=()

for file in "$@"; do
  if [ ! -L "$file" ]; then
    files+=("$file")
  fi
done

if [ "${#files[@]}" -gt 0 ]; then
  ./node_modules/.bin/prettier --write "${files[@]}"
fi
