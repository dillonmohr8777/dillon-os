#!/usr/bin/env bash
# Print HubSpot auth status without revealing the token.
set -euo pipefail
token="${HUBSPOT_PRIVATE_APP_TOKEN:-${HUBSPOT_ACCESS_TOKEN:-${HUBSPOT_SERVICE_KEY:-}}}"
if [[ -z "$token" ]]; then
  echo "HubSpot token: MISSING on this runtime"
  echo "Desktop: Windows user env / Hermes .env should already hold the aliases."
  echo "Cloud: add HUBSPOT_PRIVATE_APP_TOKEN as a Cursor Cloud environment secret, then re-run."
  exit 1
fi
echo "HubSpot token: PRESENT (length=${#token}; value not shown)"
echo "Expected portal: 242825734 (Align HCM, na2)"
exit 0
