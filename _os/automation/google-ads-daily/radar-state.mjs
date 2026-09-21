import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = path.dirname(fileURLToPath(import.meta.url));
export const statePath = path.join(base, 'work', 'radar-state.json');
const tz = 'America/New_York';
const sourceNames = ['slack', 'gmail'];
const dailyNames = ['bedtime', 'leadTable', 'predictionBrief', 'googleAdsReport'];
const idPattern = /^[A-Za-z0-9_.:/-]{1,240}$/;
const iso = value => {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) throw Error('Invalid timestamp');
  return new Date(value).toISOString();
};
const unix = value => {
  if (!Number.isSafeInteger(value) || value < 0) throw Error('Invalid Unix timestamp');
  return value;
};
const identifier = value => {
  if (typeof value !== 'string' || !idPattern.test(value)) throw Error('Invalid opaque identifier');
  return value;
};

export function initialState() {
  return {
    schemaVersion: 1, timezone: tz,
    sources: Object.fromEntries(sourceNames.map(s => [s, { throughUnix: null, lastSuccessAt: null, window: null, failure: null }])),
    seen: [], threads: [], daily: {}, pauseUntil: null, overnightDate: null, wake: null, updatedAt: null
  };
}

export function localTime(now) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date(now)).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minute: Number(parts.hour) * 60 + Number(parts.minute) };
}

export function localEight(now) {
  let { date, minute } = localTime(now);
  if (minute >= 480) date = new Date(Date.parse(`${date}T12:00:00Z`) + 86400000).toISOString().slice(0, 10);
  let target = Date.parse(`${date}T08:00:00Z`);
  for (let i = 0; i < 3; i++) {
    const got = localTime(target);
    const desiredWall = Date.parse(`${date}T08:00:00Z`);
    const gotWall = Date.parse(`${got.date}T00:00:00Z`) + got.minute * 60000;
    target += desiredWall - gotWall;
  }
  return new Date(target).toISOString();
}

export function lookupKeys(state, keys) {
  if (!Array.isArray(keys) || keys.length > 1000) throw Error('Supply at most 1000 opaque keys');
  const wanted = [...new Set(keys.map(identifier))];
  const known = new Map(state.seen.map(item => [item.key, item]));
  return { known: wanted.filter(key => known.has(key)).map(key => known.get(key)), unseen: wanted.filter(key => !known.has(key)) };
}

export function plan(state, now) {
  const at = iso(now), local = localTime(at), end = Math.floor(Date.parse(at) / 1000);
  const paused = !!state.pauseUntil && Date.parse(state.pauseUntil) > Date.parse(at);
  const overnight = local.minute < 480;
  const overnightApproved = state.overnightDate === local.date;
  const ownedActive = state.threads.filter(t => t.status === 'active');
  return {
    at, localDate: local.date, timezone: tz, paused, pauseUntil: paused ? state.pauseUntil : null,
    resumeDue: !!state.pauseUntil && !paused,
    allowNewWork: !paused && (!overnight || overnightApproved),
    dispatchSlots: Math.max(0, Math.min(3 - ownedActive.length, 2 - (state.wake?.created || 0))),
    maxNewTasksThisWake: 2,
    wake: state.wake || null,
    seenCount: state.seen.length,
    bedtimeDue: local.minute >= 30 && local.minute < 480 && state.daily.bedtime?.date !== local.date,
    leadTableDue: !paused && local.minute >= 480 && state.daily.leadTable?.date !== local.date,
    googleAdsReportDue: !paused && local.minute >= 540 && state.daily.googleAdsReport?.date !== local.date,
    predictionBriefDue: !paused && local.minute >= 480 && local.minute < 1080 && state.daily.predictionBrief?.date !== local.date,
    windows: Object.fromEntries(sourceNames.map(name => {
      const through = state.sources[name].throughUnix;
      const afterUnix = through === null ? end - 48 * 3600 : Math.max(0, through - 900);
      const beforeUnix = name === 'slack' ? Math.min(end, (through ?? afterUnix) + 6 * 3600) : end;
      return [name, state.sources[name].window || { afterUnix, beforeUnix, cursor: null }];
    })),
    sourceRetry: Object.fromEntries(sourceNames.map(name => [name, {
      due: !state.sources[name].failure || Date.parse(state.sources[name].failure.retryAt) <= Date.parse(at),
      failure: state.sources[name].failure || null
    }])),
    threads: state.threads,
    note: 'Observation metadata only. Canonical client queue remains authoritative. A plan is not proof of a completed scan or worker.'
  };
}

export function applyEvent(state, input, now) {
  const s = structuredClone(state), at = iso(now), event = input;
  if (!event || typeof event !== 'object' || typeof event.action !== 'string') throw Error('Event action required');
  const local = localTime(at);
  if (event.action.startsWith('source-')) {
    if (!sourceNames.includes(event.source)) throw Error('Unknown source');
    const source = s.sources[event.source];
    if (event.action === 'source-start') {
      if (source.window) throw Error('Resume the existing source window before starting another');
      const afterUnix = unix(event.afterUnix), beforeUnix = unix(event.beforeUnix);
      if (afterUnix > beforeUnix || beforeUnix > Math.floor(Date.parse(at) / 1000)) throw Error('Invalid source window');
      if (source.throughUnix !== null && afterUnix > source.throughUnix) throw Error('Source window would skip messages');
      source.window = { afterUnix, beforeUnix, cursor: null };
    } else if (event.action === 'source-narrow') {
      if (!source.window) throw Error('No open source window');
      const beforeUnix = unix(event.beforeUnix);
      if (beforeUnix <= source.window.afterUnix || beforeUnix >= source.window.beforeUnix) throw Error('Must narrow inside the current window');
      source.window.beforeUnix = beforeUnix;
      source.window.cursor = null;
    } else if (event.action === 'source-page') {
      if (!source.window) throw Error('No open source window');
      if (typeof event.cursor !== 'string' || !event.cursor || event.cursor.length > 4000 || /[\r\n]/.test(event.cursor)) throw Error('Invalid page cursor');
      source.window.cursor = event.cursor;
    } else if (event.action === 'source-complete') {
      if (!source.window || event.paginationExhausted !== true) throw Error('Complete only after pagination exhaustion');
      if (event.beforeUnix !== source.window.beforeUnix) throw Error('Mismatched source upper bound');
      source.throughUnix = Math.max(source.throughUnix || 0, source.window.beforeUnix);
      source.lastSuccessAt = at;
      source.window = null;
      source.failure = null;
    } else if (event.action === 'source-failed') {
      if (!['auth', 'identity', 'rate-limit', 'unavailable'].includes(event.reason)) throw Error('Unknown source failure');
      const attempts = source.failure?.reason === event.reason ? source.failure.attempts + 1 : 1;
      const delay = [900, 3600, 14400, 86400][Math.min(attempts - 1, 3)];
      source.failure = { reason: event.reason, attempts, at, retryAt: new Date(Date.parse(at) + delay * 1000).toISOString() };
    } else throw Error('Unknown source action');
  } else if (event.action === 'wake-start') {
    const wakeId = identifier(event.wakeId);
    if (s.wake?.id !== wakeId) s.wake = { id: wakeId, at, created: 0 };
  } else if (event.action === 'seen') {
    const key = identifier(event.key);
    if (!['suppressed', 'notified', 'dispatched', 'prepared', 'reviewed'].includes(event.disposition)) throw Error('Invalid disposition');
    s.seen = s.seen.filter(x => x.key !== key);
    s.seen.push({ key, disposition: event.disposition, at });
  } else if (event.action === 'register-thread') {
    const threadId = identifier(event.threadId), sourceKey = identifier(event.sourceKey), clientId = identifier(event.clientId);
    if (s.threads.some(t => t.threadId === threadId || (t.sourceKey === sourceKey && t.status !== 'completed'))) throw Error('Duplicate dispatch');
    const p = plan(s, at);
    if (!s.wake) throw Error('Start a wake before dispatch');
    if (!p.allowNewWork || p.dispatchSlots < 1) throw Error('Dispatch is paused, overnight, or at capacity');
    s.threads.push({ threadId, sourceKey, clientId, status: 'active', startedAt: at });
    s.wake.created += 1;
  } else if (event.action === 'thread-status') {
    const thread = s.threads.find(t => t.threadId === event.threadId);
    if (!thread || !['active', 'paused', 'completed', 'blocked'].includes(event.status)) throw Error('Unknown thread or status');
    if (event.status === 'active' && thread.status !== 'active') {
      const p = plan(s, at);
      if (!p.allowNewWork || s.threads.filter(t => t.status === 'active').length >= 3) throw Error('Cannot resume while paused or at capacity');
    }
    thread.status = event.status;
    thread.checkedAt = at;
  } else if (event.action === 'daily') {
    if (!dailyNames.includes(event.name) || !['notified', 'dispatched', 'complete', 'blocked', 'quiet'].includes(event.status)) throw Error('Invalid daily outcome');
    s.daily[event.name] = { date: local.date, at, status: event.status };
  } else if (event.action === 'pause-until-eight') {
    s.pauseUntil = localEight(at);
    s.overnightDate = null;
  } else if (event.action === 'overnight-approved') {
    s.overnightDate = local.minute >= 480
      ? new Date(Date.parse(`${local.date}T12:00:00Z`) + 86400000).toISOString().slice(0, 10)
      : local.date;
    s.pauseUntil = null;
  } else if (event.action === 'resume') {
    if (s.pauseUntil && Date.parse(s.pauseUntil) > Date.parse(at) && event.explicitUserResume !== true) throw Error('Resume time has not arrived');
    s.pauseUntil = null;
  } else throw Error('Unknown event');
  s.updatedAt = at;
  return s;
}

function readState() {
  if (!fs.existsSync(statePath)) return initialState();
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8').replace(/^\uFEFF/, ''));
  if (state.schemaVersion !== 1 || state.timezone !== tz) throw Error('Unsupported state schema');
  return state;
}

function main() {
  const [command = 'plan', inputFile] = process.argv.slice(2);
  if (command === 'plan') { console.log(JSON.stringify(plan(readState(), new Date().toISOString()), null, 2)); return; }
  if (command === 'lookup' && inputFile) {
    const keys = JSON.parse(fs.readFileSync(path.resolve(inputFile), 'utf8').replace(/^\uFEFF/, ''));
    console.log(JSON.stringify(lookupKeys(readState(), keys), null, 2)); return;
  }
  if (command !== 'apply' || !inputFile) throw Error('Usage: node radar-state.mjs plan | apply event.json');
  const data = JSON.parse(fs.readFileSync(path.resolve(inputFile), 'utf8').replace(/^\uFEFF/, ''));
  const events = Array.isArray(data) ? data : [data];
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const lockPath = statePath + '.lock';
  const lock = fs.openSync(lockPath, 'wx');
  try {
    let state = readState();
    for (const event of events) state = applyEvent(state, event, new Date().toISOString());
    const next = statePath + '.next';
    fs.writeFileSync(next, JSON.stringify(state, null, 2) + '\n', { flag: 'w' });
    fs.renameSync(next, statePath);
    console.log(JSON.stringify({ ok: true, events: events.length, updatedAt: state.updatedAt }));
  } finally { fs.closeSync(lock); fs.unlinkSync(lockPath); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
