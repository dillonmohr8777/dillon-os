#!/usr/bin/env bash
# Pull the five local open-weight brains. Run on the box with Ollama, not in git CI.
# Tags can be overridden with env vars. Missing tags: install a close Qwen/Gemma/Llama build.
set -euo pipefail

pull() {
  local tag="$1"
  echo "ollama pull ${tag}"
  ollama pull "${tag}"
}

pull "${CLAW_QWEN_MODEL:-qwen3.6:27b}"
pull "${CLAW_GEMMA_MODEL:-gemma4:31b}"
pull "${CLAW_CODER_MODEL:-qwen3-coder:latest}"
pull "${CLAW_LLAMA_MODEL:-llama4:scout}"
pull "${CLAW_DEEPSEEK_LOCAL_MODEL:-deepseek-v4:flash}"

echo "done. ollama list"
ollama list
