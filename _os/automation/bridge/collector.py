#!/usr/bin/env python3
"""The bridge collector: pulls finished work out of Managed Agents sessions.

Cloud agents never call this machine. They write artifacts to
/mnt/session/outputs/ and a manifest.json LAST. This script, run by Task
Scheduler at logon and every 10 minutes, lists each open session's output files
by scope_id, and only when the manifest is present AND every file it names is
listed, downloads them, runs each `deliver` step idempotently, writes a
receipt, commits, and marks the session collected.

"Desktop was off for three hours" and "desktop was on the whole time" are the
same code path, because this reads the Files API, not the sandbox.

Stdlib only. The key comes from ANTHROPIC_API_KEY set for THIS process by the
scheduled task's action, never persisted anywhere Claude Code can see it.

  python collector.py                # one pass, exits when nothing is pending
  python collector.py --dry-run      # list + download, no deliveries, no commit
  python collector.py --register SESSION_ID AGENT CLIENT   # track a new session
"""
from __future__ import annotations

import argparse
import json
import os
import sqlite3
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
VAULT = HERE.parents[2]                      # repos/dillon-os
DB_PATH = HERE / "bridge.sqlite"
DELIVERIES = HERE / "deliveries"
API = "https://api.anthropic.com"
BETA = "files-api-2025-04-14,managed-agents-2026-04-01"
ABANDON_AFTER_H = 24


# ---------------------------------------------------------------- journal ----
def db() -> sqlite3.Connection:
    c = sqlite3.connect(DB_PATH)
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA synchronous=FULL")
    c.executescript("""
    CREATE TABLE IF NOT EXISTS sessions(
      session_id TEXT PRIMARY KEY, agent TEXT, client TEXT,
      created_at TEXT, state TEXT, parent_session_id TEXT);
    CREATE TABLE IF NOT EXISTS deliveries(
      key TEXT PRIMARY KEY, session_id TEXT, kind TEXT,
      state TEXT, result_json TEXT, updated_at TEXT);
    """)
    return c


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


# -------------------------------------------------------------------- api ----
def api(method: str, path: str, body: bytes | None = None, raw=False):
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        sys.exit("ANTHROPIC_API_KEY is not set for this process. Refusing to run.")
    req = urllib.request.Request(API + path, data=body, method=method)
    req.add_header("x-api-key", key)
    req.add_header("anthropic-version", "2023-06-01")
    req.add_header("anthropic-beta", BETA)
    if body is not None:
        req.add_header("content-type", "application/json")
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if raw else json.loads(data)


def list_outputs(session_id: str) -> dict[str, str]:
    """filename -> file_id for everything the session wrote to outputs."""
    out, page = {}, f"/v1/files?scope_id={session_id}&limit=1000"
    while page:
        d = api("GET", page)
        for f in d.get("data", []):
            out[f.get("filename") or f.get("name") or f["id"]] = f["id"]
        page = f"/v1/files?scope_id={session_id}&limit=1000&page={d['next_page']}" \
            if d.get("has_more") and d.get("next_page") else None
    return out


def download(file_id: str) -> bytes:
    return api("GET", f"/v1/files/{file_id}/content", raw=True)


# ---------------------------------------------------------------- deliver ----
def already_done(kind: str, key: str, step: dict) -> bool:
    """The third idempotency layer: ask the world, not the journal."""
    if kind == "receipt":
        return (DELIVERIES / step["_dir"] / "RECEIPT.json").exists()
    if kind == "git_commit":
        r = subprocess.run(["git", "log", "--oneline", "--grep", f"[mx:{key}]"],
                           cwd=VAULT, capture_output=True, text=True)
        return bool(r.stdout.strip())
    if kind == "gmail_draft":
        # `claude -p` is asked to check for the tag before creating; treated as
        # done only via the journal here. ponytail: Gmail API + list drafts when
        # the tag check needs to be provable from this script.
        return False
    if kind == "designsync":
        return (DELIVERIES / step["_dir"] / "designsync.handoff.json").exists()
    return False


def execute(kind: str, key: str, step: dict, dry: bool) -> dict:
    d = DELIVERIES / step["_dir"]
    if dry:
        return {"dry_run": True}
    if kind == "receipt":
        (d / "RECEIPT.json").write_text(json.dumps(step["_receipt"], indent=2), encoding="utf-8")
        return {"path": str(d / "RECEIPT.json")}
    if kind == "git_commit":
        subprocess.run(["git", "add", str(d)], cwd=VAULT, check=True)
        msg = f"deliver {step['_agent']} {step['_client']} [mx:{key}]"
        r = subprocess.run(["git", "commit", "-q", "-m", msg], cwd=VAULT, capture_output=True, text=True)
        return {"committed": r.returncode == 0, "stderr": r.stderr[-200:]}
    if kind == "gmail_draft":
        # ponytail: an LLM in the last mile. The subscription-billed claude -p is
        # the only Gmail route on this machine; swap for the Gmail API when a
        # draft must be byte-exact or the tag check must be script-verifiable.
        body = (d / step["body_file"]).read_text(encoding="utf-8")
        prompt = (f"Using ONLY the Gmail create_draft tool: first list drafts and if one "
                  f"already has subject containing '[mx:{key}]' do nothing and reply DONE. "
                  f"Otherwise create ONE draft. to={step['to']} cc={step.get('cc', [])} "
                  f"subject={step['subject']} [mx:{key}]. htmlBody is exactly the text "
                  f"between <<<BODY and BODY>>>. Reply with the draft id.\n<<<BODY\n{body}\nBODY>>>")
        r = subprocess.run(["claude", "-p", prompt, "--allowedTools",
                            "mcp__*__create_draft,mcp__*__list_drafts"],
                           capture_output=True, text=True, timeout=300)
        return {"stdout": r.stdout[-400:], "rc": r.returncode}
    if kind == "designsync":
        # DesignSync is a session tool, not a CLI. Hand off to the next Claude
        # Code session by writing the plan it should finalize_plan/write_files.
        (d / "designsync.handoff.json").write_text(json.dumps(step, indent=2), encoding="utf-8")
        return {"handoff": True}
    raise ValueError(f"unknown deliver kind: {kind}")


def run_idempotent(c: sqlite3.Connection, key: str, kind: str, step: dict, dry: bool) -> None:
    row = c.execute("SELECT state FROM deliveries WHERE key=?", (key,)).fetchone()
    if row and row[0] in ("executed", "posted"):
        return                                              # crashed after the side effect: never redo
    c.execute("INSERT OR REPLACE INTO deliveries VALUES (?,?,?,?,?,?)",
              (key, step["_session"], kind, "claimed", None, now()))
    c.commit()                                              # write-ahead, survives power loss
    result = {"already_done": True} if already_done(kind, key, step) else execute(kind, key, step, dry)
    c.execute("UPDATE deliveries SET state=?, result_json=?, updated_at=? WHERE key=?",
              ("executed" if not dry else "claimed", json.dumps(result), now(), key))
    c.commit()


# ---------------------------------------------------------------- collect ----
def collect(c: sqlite3.Connection, s: dict, dry: bool) -> str:
    files = list_outputs(s["session_id"])
    if "manifest.json" not in files:
        return "waiting"                                    # not done, or the 1-3 s indexing lag
    manifest = json.loads(download(files["manifest.json"]))
    named = manifest.get("files", [])
    if any(f not in files for f in named):
        return "waiting"                                    # manifest-last: never deliver a partial set
    d = DELIVERIES / s["client"] / s["session_id"]
    d.mkdir(parents=True, exist_ok=True)
    for f in named + ["manifest.json"]:
        (d / f).write_bytes(download(files[f]))
    rel = str(d.relative_to(DELIVERIES))
    base = {"_session": s["session_id"], "_agent": s["agent"], "_client": s["client"], "_dir": rel}
    if manifest.get("status") == "partial":
        (d / "PARTIAL.txt").write_text(manifest.get("reason", ""), encoding="utf-8")
    else:
        for i, step in enumerate(manifest.get("deliver", [])):
            run_idempotent(c, f"{s['session_id']}:{step['kind']}:{i}", step["kind"], {**base, **step}, dry)
    receipt = {"session_id": s["session_id"], "agent": s["agent"], "client": s["client"],
               "files": named, "status": manifest.get("status", "complete"),
               "collected_at": now(), "next": manifest.get("next")}
    run_idempotent(c, f"{s['session_id']}:receipt", "receipt", {**base, "_receipt": receipt}, dry)
    run_idempotent(c, f"{s['session_id']}:git", "git_commit", base, dry)
    if not dry:
        c.execute("UPDATE sessions SET state='collected' WHERE session_id=?", (s["session_id"],))
        c.commit()
    return "collected"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--register", nargs=3, metavar=("SESSION_ID", "AGENT", "CLIENT"))
    ap.add_argument("--once", action="store_true", help="single list pass, no in-run waiting")
    a = ap.parse_args()
    c = db()
    if a.register:
        c.execute("INSERT OR IGNORE INTO sessions VALUES (?,?,?,?,?,?)",
                  (*a.register, now(), "open", None))
        c.commit()
        print("registered", a.register[0])
        return 0
    deadline = time.time() + (0 if a.once else 300)
    while True:
        pending = 0
        for row in c.execute("SELECT session_id, agent, client, created_at FROM sessions WHERE state='open'").fetchall():
            s = dict(zip(("session_id", "agent", "client", "created_at"), row))
            age_h = (datetime.now(timezone.utc) - datetime.fromisoformat(s["created_at"])).total_seconds() / 3600
            try:
                state = collect(c, s, a.dry_run)
            except urllib.error.HTTPError as e:
                state = f"http {e.code}"
            print(f"{s['session_id']}  {s['agent']:<28} {s['client']:<24} {state}")
            if state == "waiting":
                pending += 1
                if age_h > ABANDON_AFTER_H:
                    c.execute("UPDATE sessions SET state='abandoned' WHERE session_id=?", (s["session_id"],))
                    c.commit()
                    print(f"  ABANDONED after {age_h:.0f}h with no manifest")
        if not pending or time.time() > deadline:
            return 0
        time.sleep(30)


if __name__ == "__main__":
    sys.exit(main())
