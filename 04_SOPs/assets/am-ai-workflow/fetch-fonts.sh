#!/usr/bin/env bash
# Install the two typefaces the guide is set in (Montserrat for headings, Lato for body).
# Both are SIL Open Font License; fetched rather than vendored to keep the vault lean.
set -euo pipefail
DEST="${1:-$HOME/.fonts}"
BASE="https://raw.githubusercontent.com/google/fonts/main/ofl"
mkdir -p "$DEST"
for path in "montserrat/Montserrat%5Bwght%5D.ttf" \
            "lato/Lato-Regular.ttf" \
            "lato/Lato-Bold.ttf"; do
  name="$(basename "$path" | sed 's/%5B/[/;s/%5D/]/')"
  curl -fsSL "$BASE/$path" -o "$DEST/$name"
  echo "installed $name"
done
fc-cache -f >/dev/null 2>&1 || true
echo "done -> $DEST"
