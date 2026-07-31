#!/usr/bin/env bash
# hermes-local-control — Linux/macOS CDP launcher (fallback).
# Primary host is Windows HP 64GB — use hermes-local-control.ps1 there.
# Cloud agents cannot reach localhost:9222.
set -euo pipefail

CDP_PORT="${HERMES_CDP_PORT:-9222}"
CDP_URL="http://127.0.0.1:${CDP_PORT}"
PROFILE_DIR="${HERMES_CHROME_PROFILE:-$HOME/.hermes/chrome-debug}"

mkdir -p "$PROFILE_DIR"

already_up() {
  curl -sf "${CDP_URL}/json/version" >/dev/null 2>&1
}

launch_browser() {
  local bin=""
  if [[ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]]; then
    bin="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  elif [[ -x "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" ]]; then
    bin="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
  elif [[ -x "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" ]]; then
    bin="/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
  elif command -v google-chrome >/dev/null 2>&1; then
    bin="$(command -v google-chrome)"
  elif command -v chromium-browser >/dev/null 2>&1; then
    bin="$(command -v chromium-browser)"
  elif command -v brave-browser >/dev/null 2>&1; then
    bin="$(command -v brave-browser)"
  else
    echo "ERROR: No Chrome/Brave/Edge found. Install Chrome, then rerun." >&2
    exit 1
  fi

  echo "==> Launching: $bin"
  echo "    CDP: $CDP_URL"
  echo "    profile: $PROFILE_DIR"
  "$bin" \
    --remote-debugging-port="$CDP_PORT" \
    --remote-debugging-address=127.0.0.1 \
    --user-data-dir="$PROFILE_DIR" \
    --no-first-run \
    --no-default-browser-check \
    about:blank >/dev/null 2>&1 &
}

if already_up; then
  echo "==> CDP already listening on $CDP_URL"
else
  launch_browser
  for i in 1 2 3 4 5 6 7 8 9 10; do
    if already_up; then
      echo "==> CDP ready"
      break
    fi
    sleep 0.5
  done
  if ! already_up; then
    echo "ERROR: CDP did not come up on $CDP_URL" >&2
    echo "Tip: quit all Chrome windows using this profile, then rerun." >&2
    exit 1
  fi
fi

echo ""
echo "Browser version:"
curl -s "${CDP_URL}/json/version" | head -c 500
echo ""
echo ""
echo "=============================================="
echo "  hermes-local-control — next steps"
echo "=============================================="
echo "1. Open Hermes in a terminal (not Web UI / Telegram):"
echo "     hermes chat"
echo ""
echo "2. Attach to this Chrome (TV-visible):"
echo "     /browser connect"
echo "     /browser status"
echo ""
echo "3. Start a NEW session and paste your task."
echo ""
echo "4. When done:"
echo "     /browser disconnect"
echo "   (do not close the browser window)"
echo "=============================================="
