"""Does the collector deliver exactly once, no matter how many times it runs?

Replays a fixture session twice against a fake Files API. Fails if a second pass
creates a second delivery row or a second receipt. No network, no git, no key.

  python test_collector.py
"""
import json
import os
import sqlite3
import tempfile
from pathlib import Path

import collector as C

# ---- fixture: one finished session, manifest names two files, one deliver step
FILES = {
    "report.html": b"<html>house</html>",
    "email.html": b"<div>body</div>",
    "manifest.json": json.dumps({
        "status": "complete",
        "files": ["report.html", "email.html"],
        "deliver": [{"kind": "designsync", "artboards": ["report.html"]}],
        "next": None,
    }).encode(),
}


def fake_api(method, path, body=None, raw=False):
    if path.startswith("/v1/files?scope_id="):
        return {"data": [{"id": f"file_{n}", "filename": n} for n in FILES], "has_more": False}
    if path.startswith("/v1/files/file_") and path.endswith("/content"):
        return FILES[path.split("file_")[1].split("/")[0]]
    raise AssertionError(path)


def run():
    tmp = Path(tempfile.mkdtemp())
    C.DB_PATH = tmp / "bridge.sqlite"
    C.DELIVERIES = tmp / "deliveries"
    C.api = fake_api
    # git_commit would touch the real vault; make it observable instead.
    commits = []
    real_execute = C.execute

    def execute(kind, key, step, dry):
        if kind == "git_commit":
            commits.append(key)
            return {"committed": True}
        return real_execute(kind, key, step, dry)
    C.execute = execute
    C.already_done = lambda kind, key, step: kind == "git_commit" and key in commits

    c = C.db()
    c.execute("INSERT INTO sessions VALUES (?,?,?,?,?,?)",
              ("sesn_fixture", "momentum-reporter", "nexla", C.now(), "open", None))
    c.commit()
    s = {"session_id": "sesn_fixture", "agent": "momentum-reporter", "client": "nexla", "created_at": C.now()}

    assert C.collect(c, s, dry=False) == "collected"
    rows1 = c.execute("SELECT key, state FROM deliveries ORDER BY key").fetchall()
    receipt = tmp / "deliveries" / "nexla" / "sesn_fixture" / "RECEIPT.json"
    assert receipt.exists(), "receipt not written"
    assert (tmp / "deliveries" / "nexla" / "sesn_fixture" / "designsync.handoff.json").exists()
    assert all(st == "executed" for _, st in rows1), rows1
    assert len(commits) == 1

    # Second pass: session is already 'collected', so collect() must not even be
    # reached by main(); but call it directly to prove the journal alone holds.
    first_mtime = receipt.stat().st_mtime_ns
    assert C.collect(c, s, dry=False) == "collected"
    rows2 = c.execute("SELECT key, state FROM deliveries ORDER BY key").fetchall()
    assert rows1 == rows2, "second pass changed the journal"
    assert len(commits) == 1, "second pass committed again"
    assert receipt.stat().st_mtime_ns == first_mtime, "receipt rewritten"

    # Crash drill: journal row wiped after the side effect; the external check must
    # stop a re-execution.
    c.execute("DELETE FROM deliveries WHERE key='sesn_fixture:git'")
    c.commit()
    assert C.collect(c, s, dry=False) == "collected"
    assert len(commits) == 1, "external already_done guard failed"
    row = c.execute("SELECT result_json FROM deliveries WHERE key='sesn_fixture:git'").fetchone()
    assert json.loads(row[0]).get("already_done") is True

    # Partial manifest: nothing delivered, but recorded.
    FILES["manifest.json"] = json.dumps({"status": "partial", "reason": "cred blocked", "files": []}).encode()
    c.execute("INSERT INTO sessions VALUES (?,?,?,?,?,?)",
              ("sesn_partial", "momentum-reporter", "omega", C.now(), "open", None))
    s2 = {"session_id": "sesn_partial", "agent": "momentum-reporter", "client": "omega", "created_at": C.now()}
    assert C.collect(c, s2, dry=False) == "collected"
    assert (tmp / "deliveries" / "omega" / "sesn_partial" / "PARTIAL.txt").read_text() == "cred blocked"
    assert not c.execute("SELECT 1 FROM deliveries WHERE session_id='sesn_partial' AND kind='designsync'").fetchone()

    # Manifest-last: a manifest naming a file not yet listed must wait.
    FILES["manifest.json"] = json.dumps({"status": "complete", "files": ["late.html"], "deliver": []}).encode()
    c.execute("INSERT INTO sessions VALUES (?,?,?,?,?,?)",
              ("sesn_late", "momentum-designer", "kjb", C.now(), "open", None))
    s3 = {"session_id": "sesn_late", "agent": "momentum-designer", "client": "kjb", "created_at": C.now()}
    assert C.collect(c, s3, dry=False) == "waiting"
    print("collector: 5/5 passed (once-only, journal replay, external guard, partial, manifest-last)")


if __name__ == "__main__":
    run()
