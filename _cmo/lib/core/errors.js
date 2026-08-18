/**
 * Error taxonomy.
 *
 * The runtime treats errors by CLASS, not by message. `retryable` decides
 * whether the queue backs off and tries again; terminal errors go straight
 * to the dead-letter queue so a human sees them instead of the system
 * burning budget on a hopeless call.
 */

export class CmoError extends Error {
  constructor(message, { code = 'CMO_ERROR', retryable = false, cause, meta } = {}) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.code = code;
    this.retryable = retryable;
    this.meta = meta ?? {};
  }

  toJSON() {
    return { name: this.name, code: this.code, message: this.message, retryable: this.retryable, meta: this.meta };
  }
}

/** Bad input, bad config, schema mismatch after repair attempts. Never retried. */
export class ValidationError extends CmoError {
  constructor(message, meta) {
    super(message, { code: 'VALIDATION', retryable: false, meta });
  }
}

/** Upstream said "slow down" or "try later". Retried with backoff. */
export class TransientError extends CmoError {
  constructor(message, meta) {
    super(message, { code: 'TRANSIENT', retryable: true, meta });
  }
}

/** Rate limited. Carries `retryAfterMs` when the upstream told us. */
export class RateLimitError extends CmoError {
  constructor(message, { retryAfterMs = null, ...meta } = {}) {
    super(message, { code: 'RATE_LIMIT', retryable: true, meta: { retryAfterMs, ...meta } });
    this.retryAfterMs = retryAfterMs;
  }
}

/** The connector has no credentials, or the credential is refused. Not retried. */
export class AuthError extends CmoError {
  constructor(message, meta) {
    super(message, { code: 'AUTH', retryable: false, meta });
  }
}

/** A workspace hit its spend cap. Not retried - a human raises the cap. */
export class BudgetError extends CmoError {
  constructor(message, meta) {
    super(message, { code: 'BUDGET_EXCEEDED', retryable: false, meta });
  }
}

/** A connector's breaker is open. Retryable, but not right now. */
export class CircuitOpenError extends CmoError {
  constructor(message, meta) {
    super(message, { code: 'CIRCUIT_OPEN', retryable: true, meta });
  }
}

/** Output failed a brand-safety or evidence guardrail. Terminal by design. */
export class GuardrailError extends CmoError {
  constructor(message, meta) {
    super(message, { code: 'GUARDRAIL', retryable: false, meta });
  }
}

/** A step needs a human before it can continue. Not a failure - a pause. */
export class ApprovalRequired extends CmoError {
  constructor(message, meta) {
    super(message, { code: 'APPROVAL_REQUIRED', retryable: false, meta });
  }
}

const RETRYABLE_HTTP = new Set([408, 425, 429, 500, 502, 503, 504, 522, 524]);

/** Map an HTTP response into the taxonomy above. */
export function fromHttp(status, body, { host } = {}) {
  const meta = { status, host, body: typeof body === 'string' ? body.slice(0, 500) : body };
  if (status === 401 || status === 403) {
    return new AuthError(`${host || 'upstream'} refused credentials (${status})`, meta);
  }
  if (status === 429) {
    const retryAfter = Number(body?.retry_after ?? 0) * 1000 || null;
    return new RateLimitError(`${host || 'upstream'} rate limited`, { retryAfterMs: retryAfter, ...meta });
  }
  if (RETRYABLE_HTTP.has(status)) return new TransientError(`${host || 'upstream'} returned ${status}`, meta);
  return new CmoError(`${host || 'upstream'} returned ${status}`, { code: `HTTP_${status}`, retryable: false, meta });
}

const RETRYABLE_NODE_CODES = new Set([
  'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND',
  'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_SOCKET', 'ABORT_ERR',
]);

export function isRetryable(err) {
  if (!err) return false;
  if (err instanceof CmoError) return err.retryable;
  return RETRYABLE_NODE_CODES.has(err.code);
}

export function errorPayload(err) {
  if (!err) return null;
  if (err instanceof CmoError) return err.toJSON();
  return {
    name: err.name || 'Error',
    code: err.code || 'UNKNOWN',
    message: String(err.message || err),
    retryable: isRetryable(err),
  };
}
