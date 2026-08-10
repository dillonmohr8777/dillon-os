// Lane pools + budget reserve/settle. Plain semaphores; no queue library.
export class Semaphore {
  constructor(max) { this.max = max; this.active = 0; this.waiters = []; }
  async acquire() {
    if (this.active < this.max) { this.active++; return; }
    await new Promise((res) => this.waiters.push(res));
    this.active++;
  }
  release() {
    this.active--;
    const next = this.waiters.shift();
    if (next) next();
  }
  async run(fn) {
    await this.acquire();
    try { return await fn(); } finally { this.release(); }
  }
}

export class Lanes {
  constructor(config) {
    this.research = new Semaphore(config.lanes.research);
    this.browserQa = new Semaphore(config.lanes.browserQa);
    this.images = new Semaphore(config.lanes.images);
    this.heavyCpu = new Semaphore(config.lanes.heavyCpu); // shared: vite builds + Playwright
  }
}

// Budgets: reserve-then-settle inside the single-writer process.
export class Budgets {
  constructor(db, runId) { this.db = db; this.runId = runId; }

  init(caps) {
    const ins = this.db.prepare(
      `INSERT OR IGNORE INTO budgets (run_id, resource, cap, spent) VALUES (?, ?, ?, 0)`
    );
    for (const [resource, cap] of Object.entries(caps)) ins.run(this.runId, resource, cap);
  }

  // Returns a settle function, or null if the reservation is refused (EXHAUSTED path).
  reserve(resource, estimate) {
    const row = this.db.prepare(
      `SELECT cap, spent FROM budgets WHERE run_id = ? AND resource = ?`
    ).get(this.runId, resource);
    if (!row) throw new Error(`unknown budget resource ${resource}`);
    if (row.spent + estimate > row.cap) return null;
    this.db.prepare(`UPDATE budgets SET spent = spent + ? WHERE run_id = ? AND resource = ?`)
      .run(estimate, this.runId, resource);
    let settled = false;
    return (actual) => {
      if (settled) return; settled = true;
      const delta = (actual ?? estimate) - estimate;
      if (delta !== 0) {
        this.db.prepare(`UPDATE budgets SET spent = spent + ? WHERE run_id = ? AND resource = ?`)
          .run(delta, this.runId, resource);
      }
    };
  }

  spentReport() {
    return this.db.prepare(`SELECT resource, cap, spent FROM budgets WHERE run_id = ?`).all(this.runId);
  }
}
