#!/usr/bin/env bash
# Deploy the built dashboard to Netlify as the universal org site.
#   NETLIFY_AUTH_TOKEN=xxxx bash deploy.sh
# Optional: SITE_NAME=momentum360-reporting (falls back if the name is taken).
set -euo pipefail
: "${NETLIFY_AUTH_TOKEN:?set NETLIFY_AUTH_TOKEN}"
API="https://api.netlify.com/api/v1"
AUTH="Authorization: Bearer $NETLIFY_AUTH_TOKEN"
CANDIDATES=("${SITE_NAME:-momentum360-reporting}" "momentum360-client-reporting" "m360-reporting-dashboard" "momentum360-am-reporting")

jval(){ node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const j=JSON.parse(d);console.log(eval("j."+process.argv[1])||"")}catch{console.log("")}})' "$1"; }

SITE_ID=""; USED=""
# Reuse if one of the candidate names already exists in this account.
EXISTING=$(curl -sS -H "$AUTH" "$API/sites?per_page=100")
for n in "${CANDIDATES[@]}"; do
  ID=$(echo "$EXISTING" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const a=JSON.parse(d);const m=Array.isArray(a)?a.find(s=>s.name===process.argv[1]):null;console.log(m?m.id:"")})' "$n")
  if [ -n "$ID" ]; then SITE_ID="$ID"; USED="$n"; echo "reusing existing site: $n ($ID)"; break; fi
done
# Otherwise create with the first available candidate name.
if [ -z "$SITE_ID" ]; then
  for n in "${CANDIDATES[@]}"; do
    R=$(curl -sS -X POST -H "$AUTH" -H "Content-Type: application/json" -d "{\"name\":\"$n\"}" "$API/sites")
    ID=$(echo "$R" | jval id)
    if [ -n "$ID" ]; then SITE_ID="$ID"; USED="$n"; echo "created site: $n ($ID)"; break; fi
  done
fi
# Last resort: let Netlify assign a random name.
if [ -z "$SITE_ID" ]; then
  R=$(curl -sS -X POST -H "$AUTH" -H "Content-Type: application/json" -d "{}" "$API/sites")
  SITE_ID=$(echo "$R" | jval id); USED=$(echo "$R" | jval name)
  echo "created site with auto name: $USED ($SITE_ID)"
fi
[ -n "$SITE_ID" ] || { echo "FAILED to create/find a site"; exit 1; }

echo "deploying..."
RESP=$(curl -sS -X POST -H "$AUTH" -H "Content-Type: application/zip" --data-binary @deploy.zip "$API/sites/$SITE_ID/deploys")
STATE=$(echo "$RESP" | jval state)
URL=$(echo "$RESP" | jval ssl_url); [ -n "$URL" ] || URL=$(echo "$RESP" | jval url)
echo "deploy state: ${STATE:-unknown}"
echo "LIVE URL: ${URL:-https://$USED.netlify.app}"
