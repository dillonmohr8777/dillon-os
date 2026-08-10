// Single-run lock. Lives on the local (non-synced) volume so mtime-based
// staleness math is trustworthy. O_EXCL create + heartbeat + stale takeover.
import fs from "node:fs";
import path from "node:path";

export class RunLock {
  constructor(lockDir, name = "daily", { staleMs = 60_000, heartbeatMs = 10_000 } = {}) {
    this.file = path.join(lockDir, `${name}.lock`);
    this.staleMs = staleMs;
    this.heartbeatMs = heartbeatMs;
    this.timer = null;
    this.held = false;
  }

  acquire() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    for (;;) {
      try {
        const fd = fs.openSync(this.file, "wx");
        fs.writeSync(fd, JSON.stringify({ pid: process.pid, at: new Date().toISOString() }));
        fs.closeSync(fd);
        break;
      } catch (err) {
        if (err.code !== "EEXIST") throw err;
        const age = Date.now() - fs.statSync(this.file).mtimeMs;
        if (age > this.staleMs) {
          // stale holder: take over
          fs.rmSync(this.file, { force: true });
          continue;
        }
        throw new Error(`another run holds ${this.file} (heartbeat ${Math.round(age / 1000)}s ago)`);
      }
    }
    this.held = true;
    this.timer = setInterval(() => {
      try { const now = new Date(); fs.utimesSync(this.file, now, now); } catch { /* released elsewhere */ }
    }, this.heartbeatMs);
    this.timer.unref();
    return this;
  }

  release() {
    if (this.timer) clearInterval(this.timer);
    if (this.held) fs.rmSync(this.file, { force: true });
    this.held = false;
  }
}
