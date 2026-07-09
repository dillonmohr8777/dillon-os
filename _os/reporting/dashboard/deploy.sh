#!/usr/bin/env bash
# Deploy the built dashboard to Netlify.
#   NETLIFY_AUTH_TOKEN=xxxx SITE_NAME=momentum360-reporting bash deploy.sh
set -euo pipefail
: "${NETLIFY_AUTH_TOKEN:?set NETLIFY_AUTH_TOKEN}"
SITE_NAME="${SITE_NAME:-momentum360-reporting}"
API="https://api.netlify.com/api/v1"
AUTH="Authorization: Bearer $NETLIFY_AUTH_TOKEN"

# Reuse the site if it already exists, else create it.
SITE_ID=$(curl -sS -H "$AUTH" "$API/sites?name=$SITE_NAME" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const a=JSON.parse(d);const m=a.find(s=>s.name==="'"$SITE_NAME"'");console.log(m?m.id:"")}catch{console.log("")}})')
if [ -z "$SITE_ID" ]; then
  SITE_ID=$(curl -sS -X POST -H "$AUTH" -H "Content-Type: application/json" -d "{\"name\":\"$SITE_NAME\"}" "$API/sites" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const s=JSON.parse(d);console.log(s.id||"")})')
  echo "created site: $SITE_ID"
else
  echo "using existing site: $SITE_ID"
fi

RESP=$(curl -sS -X POST -H "$AUTH" -H "Content-Type: application/zip" --data-binary @deploy.zip "$API/sites/$SITE_ID/deploys")
echo "$RESP" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const s=JSON.parse(d);console.log("deploy state:",s.state);console.log("URL:",s.ssl_url||s.url||("https://"+"'"$SITE_NAME"'"+".netlify.app"))})'
