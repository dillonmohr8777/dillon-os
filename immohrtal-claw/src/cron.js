'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');
const { CRON } = require('./paths');

function loadJobs() {
  if (!fs.existsSync(CRON)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(CRON, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveJobs(jobs) {
  fs.mkdirSync(require('node:path').dirname(CRON), { recursive: true });
  fs.writeFileSync(CRON, `${JSON.stringify(jobs, null, 2)}\n`, 'utf8');
}

function addJob({ text, runAt, everyMinutes }) {
  const jobs = loadJobs();
  const job = {
    id: `cron_${crypto.randomBytes(4).toString('hex')}`,
    text: String(text || '').trim(),
    runAt: runAt || null,
    everyMinutes: everyMinutes ? Number(everyMinutes) : null,
    created: new Date().toISOString(),
    nextRun: runAt || new Date(Date.now() + (Number(everyMinutes) || 30) * 60_000).toISOString(),
  };
  if (!job.text) throw new Error('cron text is empty');
  jobs.push(job);
  saveJobs(jobs);
  return job;
}

function cancelJob(id) {
  const jobs = loadJobs();
  const next = jobs.filter((j) => j.id !== id);
  if (next.length === jobs.length) throw new Error('cron job not found');
  saveJobs(next);
  return { ok: true, id };
}

function dueJobs(now = Date.now()) {
  return loadJobs().filter((job) => Date.parse(job.nextRun) <= now);
}

function markRan(id) {
  const jobs = loadJobs();
  const job = jobs.find((j) => j.id === id);
  if (!job) return;
  if (job.everyMinutes) {
    job.nextRun = new Date(Date.now() + job.everyMinutes * 60_000).toISOString();
  } else {
    job.nextRun = 'done';
  }
  saveJobs(jobs.filter((j) => j.nextRun !== 'done'));
}

module.exports = { loadJobs, addJob, cancelJob, dueJobs, markRan };
