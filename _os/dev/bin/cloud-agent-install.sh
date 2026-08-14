#!/usr/bin/env bash
# Idempotent Cloud Agent install for Dillon OS.
# Syncs site and radar-engine dependencies. Does not start servers.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"

npm_sync() {
  local dir="$1"
  if [ -f "$dir/package-lock.json" ]; then
    echo "cloud-agent-install: npm ci ($dir)"
    npm --prefix "$dir" ci
  elif [ -f "$dir/package.json" ]; then
    echo "cloud-agent-install: npm install ($dir)"
    npm --prefix "$dir" install
  else
    echo "cloud-agent-install: skip missing $dir"
  fi
}

npm_sync "immohrtal-site"
npm_sync "01_Clients/Shadow HVAC/website"
npm_sync "_os/radar-engine"
