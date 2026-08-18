#!/usr/bin/env bash
# Pull the five local open-weight brains. Run on the box with Ollama, not in git CI.
#
# Tags can be overridden with env vars. A tag that is not published yet must not
# abort the rest of the pulls, so failures are collected and reported at the end
# instead of killing the script on the first miss.
#
# CLAW matches tags EXACTLY. `gemma4:31b-cloud` does not satisfy `gemma4:31b`.
# If a tag below is unavailable, either pull the exact tag later or point the
# catalog at what you actually have, e.g.
#   export CLAW_GEMMA_MODEL=gemma4:26b
set -uo pipefail

FAILED=()
OK=()

pull() {
  local tag="$1"
  echo ""
  echo "==> ollama pull ${tag}"
  if ollama pull "${tag}"; then
    OK+=("${tag}")
  else
    echo "!! ${tag} did not pull"
    FAILED+=("${tag}")
  fi
}

pull "${CLAW_QWEN_MODEL:-qwen3.6:27b}"
pull "${CLAW_GEMMA_MODEL:-gemma4:31b}"
pull "${CLAW_CODER_MODEL:-qwen3-coder:latest}"
pull "${CLAW_LLAMA_MODEL:-llama4:scout}"
pull "${CLAW_DEEPSEEK_LOCAL_MODEL:-deepseek-v4:flash}"

echo ""
echo "================ result ================"
echo "pulled:  ${#OK[@]}  ${OK[*]:-(none)}"
echo "missing: ${#FAILED[@]}  ${FAILED[*]:-(none)}"

if [ "${#FAILED[@]}" -gt 0 ]; then
  echo ""
  echo "For each missing tag either pull the exact tag when it ships, or override"
  echo "the catalog in immohrtal-claw/.env to a tag you already run, for example:"
  echo "  CLAW_GEMMA_MODEL=gemma4:26b"
  echo "  CLAW_CODER_MODEL=qwen3-coder:30b"
  echo "Then restart CLAW and press Probe live brains in the Harness rail."
fi

echo ""
echo "==> ollama list"
ollama list
