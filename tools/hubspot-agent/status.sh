#!/usr/bin/env bash
# Print HubSpot auth status without revealing the token.
set -euo pipefail
token="${HUBSPOT_PRIVATE_APP_TOKEN:-${HUBSPOT_ACCESS_TOKEN:-}}"
if [[ -z "$token" ]]; then
  echo "HubSpot token: MISSING"
  echo "Set HUBSPOT_PRIVATE_APP_TOKEN in Cursor Cloud environment secrets, then re-run."
  exit 1
fi
echo "HubSpot token: PRESENT (length=${#token})"
echo "Portal hint: 242825734 (na2) — confirm against private app settings"
exit 0
