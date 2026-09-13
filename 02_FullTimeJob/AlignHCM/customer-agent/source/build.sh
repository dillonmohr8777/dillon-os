#!/usr/bin/env bash
# Rebuild both Align HCM Customer Agent PDFs from the editable HTML sources.
# Requires: Chromium/Chrome (headless) and the fonts in ./assets installed to fontconfig.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
CHROME="${CHROME:-$(command -v chromium || command -v chromium-browser || command -v google-chrome || echo /opt/pw-browsers/chromium-*/chrome-linux/chrome)}"

# Install bundled fonts for this user (Poppins + Mulish) so headless Chromium finds them.
mkdir -p "$HOME/.fonts" && cp "$HERE"/assets/*.ttf "$HOME/.fonts/" && fc-cache -f "$HOME/.fonts" >/dev/null 2>&1 || true

render () {  # render <input.html> <output.pdf>
  "$CHROME" --headless=new --no-sandbox --disable-gpu --no-pdf-header-footer \
    --allow-file-access-from-files --disable-lcd-text --font-render-hinting=none \
    --print-to-pdf="$2" "file://$1"
}
render "$HERE/knowledge-core.html"  "$HERE/../Align-HCM-Customer-Agent-Knowledge-Core-v2-2026-07-24.pdf"
render "$HERE/readiness-report.html" "$HERE/../Align-HCM-Customer-Agent-Readiness-Report-v2-2026-07-24.pdf"
echo "Rebuilt both PDFs."
