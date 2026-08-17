"""Ingest the Dillon OS vault into isolated L0 memory spaces."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time
from typing import Any

import httpx
from tencentdb_agent_memory import MemoryClient

from credential import DEFAULT_TARGET, read_credential


SECRET_PATTERN = re.compile(
    r"(?i)(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|"
    r"(?:api[_-]?key|access[_-]?token|password)\s*[:=]\s*[\"'][^\"']{8,})"
)


def slug(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return value[:72] or "unknown"


def classify(relative: Path) -> tuple[str, str, str]:
    parts = relative.parts
    if len(parts) >= 2 and parts[0] == "01_Clients":
        label = parts[1]
        return f"client-{slug(label)}", label, "Isolated Obsidian client memory"
    if len(parts) >= 2 and parts[0] == "02_FullTimeJob":
        label = parts[1]
        return f"employer-{slug(label)}", label, "Isolated employer memory"
    if parts and parts[0] == "00_Inbox":
        return "dillon-private-inbox", "Dillon private inbox", "Uncompiled private inbox receipts"
    if parts and parts[0] == "02_Campaigns":
        return "dillon-private-campaigns", "Dillon private campaigns", "Cross-project campaign working memory"
    if parts and parts[0] == "10_Sessions":
        return "dillon-private-sessions", "Dillon private sessions", "Historical session records"
    if len(parts) >= 3 and parts[0] == "12_Brain" and parts[1] == "01_Captures":
        return "dillon-private-captures", "Dillon private captures", "Immutable brain capture evidence"
    return "dillon-shared", "Dillon shared operating memory", "Non-client vault and compiled brain knowledge"


def load_manifest(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"schema_version": "1.0", "files": {}}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"schema_version": "1.0", "files": {}}


def session_ids_for(space: str, rel_key: str, group_count: int) -> list[str]:
    stem = hashlib.sha256((space + ":" + rel_key).encode()).hexdigest()[:24]
    return [f"vault-{stem}-{index:04d}" for index in range(group_count)]


def client_for(clients: dict[str, MemoryClient], space: str, endpoint: str, key: str) -> MemoryClient:
    if space not in clients:
        clients[space] = MemoryClient(endpoint=endpoint, api_key=key, service_id=space, timeout=300.0)
    return clients[space]


def remove_previous(
    entry: dict[str, Any],
    rel_key: str,
    clients: dict[str, MemoryClient],
    endpoint: str,
    key: str,
) -> int:
    space = entry.get("space")
    if not space:
        return 0
    sessions = entry.get("sessions")
    if not isinstance(sessions, list) or not sessions:
        legacy_stem = hashlib.sha256((space + ":" + rel_key).encode()).hexdigest()[:24]
        sessions = [f"vault-{legacy_stem}"]
    errors = 0
    memory = client_for(clients, space, endpoint, key)
    for session_id in sessions:
        try:
            memory.delete_conversation(session_id=session_id)
        except Exception:
            errors += 1
    return errors


def write_manifest(path: Path, vault: Path, files: dict[str, Any], stats: dict[str, int]) -> None:
    payload = {"schema_version": "2.0", "vault": str(vault), "files": files, "stats": stats}
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    temporary.replace(path)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--vault", default=r"C:\Users\dillo\repos\dillon-os")
    parser.add_argument("--runtime", default=r"C:\Users\dillo\AppData\Local\Codex\AgentMemory")
    parser.add_argument("--endpoint", default="http://127.0.0.1:8420")
    parser.add_argument("--max-chars", type=int, default=7000)
    args = parser.parse_args()

    vault = Path(args.vault).resolve()
    runtime = Path(args.runtime).resolve()
    runtime.mkdir(parents=True, exist_ok=True)
    manifest_path = runtime / "vault-sync-manifest.json"
    spaces_path = runtime / "spaces.generated.json"
    manifest = load_manifest(manifest_path)
    previous = manifest.get("files", {})
    current: dict[str, Any] = dict(previous)
    seen: set[str] = set()
    spaces: dict[str, dict[str, str]] = {}
    clients: dict[str, MemoryClient] = {}
    key = read_credential(os.environ.get("TDAI_MEMORY_CREDENTIAL_TARGET", DEFAULT_TARGET))
    if not key:
        raise RuntimeError("Agent Memory gateway credential is unavailable")

    stats = {
        "scanned": 0,
        "ingested": 0,
        "chunks_ingested": 0,
        "unchanged": 0,
        "removed": 0,
        "delete_errors": 0,
        "secret_skipped": 0,
        "read_errors": 0,
    }
    excluded_roots = {".git", ".obsidian", "node_modules"}

    markdown_paths = [
        path for path in sorted(vault.rglob("*.md"))
        if not any(part in excluded_roots for part in path.relative_to(vault).parts)
    ]
    for path in markdown_paths:
        relative = path.relative_to(vault)
        space, label, scope = classify(relative)
        spaces[space] = {"id": space, "label": label, "scope": scope}
    spaces_path.write_text(
        json.dumps({"schema_version": "2.0", "spaces": sorted(spaces.values(), key=lambda item: item["id"])}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    for path in markdown_paths:
        relative = path.relative_to(vault)
        rel_key = relative.as_posix()
        seen.add(rel_key)
        stats["scanned"] += 1
        try:
            text = path.read_text(encoding="utf-8-sig")
        except OSError:
            stats["read_errors"] += 1
            continue
        if SECRET_PATTERN.search(text):
            stats["secret_skipped"] += 1
            if rel_key in current:
                stats["delete_errors"] += remove_previous(current[rel_key], rel_key, clients, args.endpoint, key)
                current.pop(rel_key, None)
                write_manifest(manifest_path, vault, current, stats)
            continue
        digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
        space, label, scope = classify(relative)
        chunks = [text[index : index + args.max_chars] for index in range(0, len(text), args.max_chars)] or [""]
        groups = [chunks[index : index + 100] for index in range(0, len(chunks), 100)]
        session_ids = session_ids_for(space, rel_key, len(groups))
        desired = {"sha256": digest, "space": space, "sessions": session_ids}
        if previous.get(rel_key) == desired:
            current[rel_key] = desired
            stats["unchanged"] += 1
            continue

        if rel_key in previous:
            stats["delete_errors"] += remove_previous(previous[rel_key], rel_key, clients, args.endpoint, key)

        memory = client_for(clients, space, args.endpoint, key)
        # Clear any checkpoint-invisible partial write from a prior interrupted
        # run before replaying this deterministic source session.
        for session_id in session_ids:
            try:
                memory.delete_conversation(session_id=session_id)
            except Exception:
                stats["delete_errors"] += 1

        chunk_offset = 0
        for group_index, (session_id, group) in enumerate(zip(session_ids, groups), start=1):
            messages = []
            for local_index, content in enumerate(group, start=1):
                chunk_index = chunk_offset + local_index
                source_block = (
                    f"Dillon OS source document. Memory space: {space}. Source path: {rel_key}. "
                    f"SHA256: {digest}. Chunk {chunk_index} of {len(chunks)}. Treat as historical evidence and verify "
                    f"current claims against the live file.\n\n{content}"
                )
                messages.append({"role": "assistant", "content": source_block})
            for attempt in range(1, 4):
                try:
                    memory.add_conversation(session_id=session_id, messages=messages)
                    break
                except httpx.HTTPStatusError as exc:
                    response_message = ""
                    try:
                        response_message = str(exc.response.json().get("message", ""))[:240]
                    except Exception:
                        pass
                    print(json.dumps({
                        "status": "error",
                        "source_path": rel_key,
                        "group": group_index,
                        "http_status": exc.response.status_code,
                        "message": response_message,
                    }, separators=(",", ":")), file=sys.stderr)
                    write_manifest(manifest_path, vault, current, stats)
                    raise
                except httpx.RequestError as exc:
                    if attempt >= 3:
                        print(json.dumps({
                            "status": "error",
                            "source_path": rel_key,
                            "group": group_index,
                            "transport_error": type(exc).__name__,
                            "attempts": attempt,
                        }, separators=(",", ":")), file=sys.stderr)
                        write_manifest(manifest_path, vault, current, stats)
                        raise
                    # A timed-out request may have completed server-side. Clear
                    # the deterministic session before retrying to avoid duplicates.
                    try:
                        memory.delete_conversation(session_id=session_id)
                    except Exception:
                        pass
                    time.sleep(attempt * 2)
            stats["chunks_ingested"] += len(group)
            chunk_offset += len(group)
        current[rel_key] = desired
        stats["ingested"] += 1
        write_manifest(manifest_path, vault, current, stats)

    for rel_key, entry in list(current.items()):
        if rel_key in seen:
            continue
        stats["delete_errors"] += remove_previous(entry, rel_key, clients, args.endpoint, key)
        current.pop(rel_key, None)
        stats["removed"] += 1

    write_manifest(manifest_path, vault, current, stats)
    print(json.dumps({"status": "ok", **stats, "spaces": len(spaces)}, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
