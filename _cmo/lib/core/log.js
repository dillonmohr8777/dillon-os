/**
 * Structured logging.
 *
 * One JSON object per line, so `cmo runs tail | jq` works and the HUD parses
 * the same stream a human reads. Pretty mode is for interactive terminals;
 * JSON is the default whenever stdout is not a TTY (cron, CI, docker logs).
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 99 };

// Built from a char code so no raw control bytes live in this source file.
const CSI = `${String.fromCharCode(27)}[`;
const C = {
  debug: `${CSI}2m`,
  info: `${CSI}36m`,
  warn: `${CSI}33m`,
  error: `${CSI}31m`,
  reset: `${CSI}0m`,
  dim: `${CSI}2m`,
};

function envLevel() {
  const raw = String(process.env.CMO_LOG_LEVEL || 'info').toLowerCase();
  return LEVELS[raw] ?? LEVELS.info;
}

function levelName(value) {
  return Object.keys(LEVELS).find((k) => LEVELS[k] === value) || 'info';
}

function formatFields(fields) {
  return Object.entries(fields)
    .map(([k, v]) => `${k}=${v && typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
    .join(' ');
}

export function createLogger({ scope = 'cmo', pretty = null, level = null, sink = null, clock = null, fields = {} } = {}) {
  const min = level != null ? (LEVELS[level] ?? LEVELS.info) : envLevel();
  const isPretty = pretty ?? (process.env.CMO_LOG_FORMAT
    ? process.env.CMO_LOG_FORMAT === 'pretty'
    : Boolean(process.stdout.isTTY));

  function emit(lv, message, extra) {
    if ((LEVELS[lv] ?? 0) < min) return;
    const record = {
      ts: clock ? clock.iso() : new Date().toISOString(),
      level: lv,
      scope,
      msg: message,
      ...fields,
      ...(extra || {}),
    };
    if (sink) {
      sink(record);
      return;
    }
    const stream = LEVELS[lv] >= LEVELS.warn ? process.stderr : process.stdout;
    if (!isPretty) {
      stream.write(`${JSON.stringify(record)}\n`);
      return;
    }
    const { ts, level: _lv, scope: sc, msg, ...rest } = record;
    const tail = Object.keys(rest).length ? ` ${C.dim}${formatFields(rest)}${C.reset}` : '';
    stream.write(`${C.dim}${ts.slice(11, 19)}${C.reset} ${C[lv]}${lv.padEnd(5)}${C.reset} ${C.dim}${sc}${C.reset} ${msg}${tail}\n`);
  }

  const api = {
    level: min,
    debug: (m, f) => emit('debug', m, f),
    info: (m, f) => emit('info', m, f),
    warn: (m, f) => emit('warn', m, f),
    error: (m, f) => emit('error', m, f),
  };
  api.child = (childScope, extra = {}) => createLogger({
    scope: childScope ? `${scope}:${childScope}` : scope,
    pretty: isPretty,
    level: levelName(min),
    sink,
    clock,
    fields: { ...fields, ...extra },
  });
  return api;
}

/** A logger that collects records in an array. Tests assert against this. */
export function memoryLogger(scope = 'test') {
  const records = [];
  const logger = createLogger({ scope, sink: (r) => records.push(r), level: 'debug' });
  return { logger, records };
}

export const log = createLogger();
