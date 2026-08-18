/**
 * Anthropic provider, via the official SDK.
 *
 * Written against the documented Messages API surface as of 2026-08:
 *   - adaptive thinking (`thinking: {type: 'adaptive'}`); `budget_tokens` is
 *     rejected on the Claude 5 family, so it is never sent
 *   - `output_config.effort` for depth control (low | medium | high | xhigh | max)
 *   - structured output via STRICT TOOL USE with a forced `tool_choice`, which
 *     needs no extra dependency (the Zod `output_config.format` helper would)
 *   - prompt caching with `cache_control` on the stable system prefix - the
 *     brand profile and voice guide are identical across every agent run for a
 *     workspace, which is exactly the prefix worth caching
 *   - streaming whenever max_tokens is large enough to risk an HTTP timeout
 *
 * Credentials resolve through the SDK (ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN,
 * or an `ant auth login` profile). This module never reads or logs a key.
 */

import { AuthError, TransientError, RateLimitError, ValidationError, CmoError } from '../../core/errors.js';

const STREAM_THRESHOLD = 16_000; // above this, stream to avoid request timeouts

let AnthropicCtor = null;

async function loadSdk() {
  if (AnthropicCtor) return AnthropicCtor;
  try {
    const mod = await import('@anthropic-ai/sdk');
    AnthropicCtor = mod.default || mod.Anthropic;
    return AnthropicCtor;
  } catch (err) {
    throw new CmoError(
      'the @anthropic-ai/sdk package is not installed - run `npm install` in _cmo, or use CMO_PROVIDER=mock',
      { code: 'SDK_MISSING', retryable: false, cause: err },
    );
  }
}

export function createAnthropicProvider({ client = null, apiKey = null, timeoutMs = 600_000 } = {}) {
  let sdk = client;

  async function getClient() {
    if (sdk) return sdk;
    const Ctor = await loadSdk();
    sdk = apiKey ? new Ctor({ apiKey, timeout: timeoutMs }) : new Ctor({ timeout: timeoutMs });
    return sdk;
  }

  return {
    name: 'anthropic',
    isMock: false,
    supportsCaching: true,

    /**
     * @param {object} req
     * @param {string} req.model
     * @param {string|Array} req.system      stable prefix; cached when cacheSystem
     * @param {Array}  req.messages
     * @param {object} req.schema            { name, description, input_schema } for structured output
     * @param {string} req.effort            output_config.effort
     * @param {number} req.maxTokens
     * @param {boolean} req.cacheSystem      put cache_control on the system prefix
     */
    async complete({
      model, system = '', messages = [], schema = null,
      effort = 'high', maxTokens = 8000, cacheSystem = true, thinking = true,
    }) {
      const api = await getClient();
      const body = buildBody({ model, system, messages, schema, effort, maxTokens, cacheSystem, thinking });

      try {
        const response = maxTokens > STREAM_THRESHOLD
          ? await api.messages.stream(body).finalMessage()
          : await api.messages.create(body);
        return normalize(response, schema, model);
      } catch (err) {
        // A forced tool_choice combined with thinking is rejected by some
        // model/feature combinations. Retry once with tool_choice: auto rather
        // than failing the run - the tool_use block is still parseable.
        if (schema && isForcedChoiceRejection(err)) {
          const relaxed = { ...body, tool_choice: { type: 'auto' } };
          const response = maxTokens > STREAM_THRESHOLD
            ? await api.messages.stream(relaxed).finalMessage()
            : await api.messages.create(relaxed);
          return normalize(response, schema, model);
        }
        throw mapError(err);
      }
    },
  };
}

function buildBody({ model, system, messages, schema, effort, maxTokens, cacheSystem, thinking }) {
  const body = {
    model,
    max_tokens: maxTokens,
    messages,
  };

  if (system) {
    // Array form so a cache breakpoint can sit on the stable prefix. The
    // caller is responsible for keeping this text byte-identical between
    // runs - any change invalidates the cache for everything after it.
    body.system = cacheSystem
      ? [{ type: 'text', text: String(system), cache_control: { type: 'ephemeral' } }]
      : String(system);
  }

  if (thinking) body.thinking = { type: 'adaptive' };
  if (effort) body.output_config = { ...(body.output_config || {}), effort };

  if (schema) {
    const tool = {
      name: schema.name,
      description: schema.description || `Return the result as ${schema.name}.`,
      strict: true,
      input_schema: hardenSchema(schema.input_schema),
    };
    body.tools = [tool];
    body.tool_choice = { type: 'tool', name: schema.name };
  }
  return body;
}

/**
 * Strict tool use requires `additionalProperties: false` and a `required`
 * array on every object node. Adding them by hand at every call site is how
 * subtle 400s get shipped, so it is done here, once.
 */
export function hardenSchema(node) {
  if (!node || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map(hardenSchema);
  const out = { ...node };
  if (out.type === 'object') {
    const props = out.properties || {};
    out.properties = Object.fromEntries(Object.entries(props).map(([k, v]) => [k, hardenSchema(v)]));
    out.additionalProperties = false;
    if (!Array.isArray(out.required)) out.required = Object.keys(out.properties);
  }
  if (out.type === 'array' && out.items) out.items = hardenSchema(out.items);
  return out;
}

function normalize(response, schema, model) {
  const blocks = Array.isArray(response?.content) ? response.content : [];
  const textParts = [];
  let parsed = null;

  for (const block of blocks) {
    if (block.type === 'text') textParts.push(block.text);
    if (block.type === 'tool_use' && schema && block.name === schema.name) {
      // Tool inputs may carry provider-specific JSON escaping - the SDK has
      // already parsed this into an object, so never string-match on it.
      parsed = block.input;
    }
  }

  if (response?.stop_reason === 'refusal') {
    throw new CmoError('the model declined this request', {
      code: 'REFUSAL',
      retryable: false,
      meta: { category: response.stop_details?.category ?? null, explanation: response.stop_details?.explanation ?? null },
    });
  }
  if (schema && parsed === null) {
    throw new ValidationError('model returned no structured output for the requested schema', {
      schema: schema.name, stopReason: response?.stop_reason ?? null,
    });
  }

  return {
    text: textParts.join('\n').trim(),
    parsed,
    model: response?.model || model,
    stopReason: response?.stop_reason ?? null,
    usage: {
      input_tokens: response?.usage?.input_tokens ?? 0,
      output_tokens: response?.usage?.output_tokens ?? 0,
      cache_creation_input_tokens: response?.usage?.cache_creation_input_tokens ?? 0,
      cache_read_input_tokens: response?.usage?.cache_read_input_tokens ?? 0,
    },
    provider: 'anthropic',
    truncated: response?.stop_reason === 'max_tokens',
  };
}

function isForcedChoiceRejection(err) {
  const status = err?.status ?? err?.statusCode;
  if (status !== 400) return false;
  const msg = String(err?.message || '').toLowerCase();
  return msg.includes('tool_choice') || msg.includes('thinking');
}

/** Map SDK errors onto the runtime taxonomy so retry policy is uniform. */
export function mapError(err) {
  const status = err?.status ?? err?.statusCode ?? null;
  const message = String(err?.message || err);
  if (status === 401 || status === 403) return new AuthError(`Anthropic refused credentials (${status})`, { status });
  if (status === 429) {
    const retryAfter = Number(err?.headers?.['retry-after'] ?? 0) * 1000 || null;
    return new RateLimitError('Anthropic rate limited', { retryAfterMs: retryAfter, status });
  }
  if (status === 400 || status === 404 || status === 422) return new ValidationError(`Anthropic rejected the request: ${message}`, { status });
  if (status === 408 || status === 409 || (status && status >= 500)) return new TransientError(`Anthropic ${status}: ${message}`, { status });
  if (['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND', 'UND_ERR_CONNECT_TIMEOUT'].includes(err?.code)) {
    return new TransientError(`network error talking to Anthropic: ${err.code}`, { code: err.code });
  }
  if (err instanceof CmoError) return err;
  return new CmoError(`Anthropic call failed: ${message}`, { code: 'PROVIDER_ERROR', retryable: false, cause: err });
}
