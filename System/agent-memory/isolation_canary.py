"""Prove that L0 and L3 data cannot cross TencentDB service spaces."""

from __future__ import annotations

import json
import os
import secrets
import sys

import httpx
from tencentdb_agent_memory import MemoryClient

from credential import DEFAULT_TARGET, read_credential


ENDPOINT = os.environ.get("TDAI_MEMORY_ENDPOINT", "http://127.0.0.1:8420").rstrip("/")


def main() -> int:
    api_key = read_credential(os.environ.get("TDAI_MEMORY_CREDENTIAL_TARGET", DEFAULT_TARGET))
    if not api_key:
        print(json.dumps({"passed": False, "error": "credential unavailable"}))
        return 1

    suffix = secrets.token_hex(8)
    source_space = f"canary-source-{suffix}"
    target_space = f"canary-target-{suffix}"
    marker = f"agent-memory-isolation-{secrets.token_hex(16)}"
    clients = {
        name: MemoryClient(endpoint=ENDPOINT, api_key=api_key, service_id=name)
        for name in (source_space, target_space)
    }
    headers = {"Authorization": f"Bearer {api_key}"}
    cleanup_errors: list[str] = []

    try:
        clients[source_space].add_conversation(
            session_id=f"canary-{suffix}",
            messages=[{"role": "user", "content": marker}],
        )
        source_hits = clients[source_space].query_conversation(session_id=f"canary-{suffix}", limit=5)
        target_hits = clients[target_space].query_conversation(limit=100)
        clients[source_space].write_core(marker)
        target_core = clients[target_space].read_core().get("content")

        source_visible = marker in json.dumps(source_hits, ensure_ascii=False)
        target_leak = marker in json.dumps(target_hits, ensure_ascii=False)
        passed = source_visible and not target_leak and marker not in str(target_core or "")
        result = {
            "passed": passed,
            "l0_source_visible": source_visible,
            "l0_cross_space_leak": target_leak,
            "l3_cross_space_leak": marker in str(target_core or ""),
        }
    except Exception as exc:
        result = {"passed": False, "error": type(exc).__name__}
    finally:
        for space in (source_space, target_space):
            try:
                response = httpx.post(
                    f"{ENDPOINT}/v2/instance/destroy",
                    headers={**headers, "x-tdai-service-id": space},
                    json={"instance_id": space},
                    timeout=15.0,
                )
                response.raise_for_status()
            except Exception as exc:
                cleanup_errors.append(f"{space}:{type(exc).__name__}")

    result["cleanup"] = "complete" if not cleanup_errors else "failed"
    if cleanup_errors:
        result["cleanup_errors"] = cleanup_errors
        result["passed"] = False
    print(json.dumps(result, separators=(",", ":")))
    return 0 if result.get("passed") else 1


if __name__ == "__main__":
    sys.exit(main())
