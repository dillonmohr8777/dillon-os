import { sha256 } from './policy.mjs';

function decodeEntities(value = '') {
  return value.replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
}

function cleanText(value = '') {
  return decodeEntities(value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

export function extractHtmlEvidence(html = '') {
  const title = cleanText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
  const h1 = cleanText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
  const description = decodeEntities(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]
    || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1] || '').trim();
  return { title: title.slice(0, 240), h1: h1.slice(0, 320), meta_description: description.slice(0, 400) };
}

export async function collectWebsiteEvidence(url, options = {}) {
  const capturedAt = options.capturedAt || new Date().toISOString();
  const timeoutMs = Number(options.timeoutMs || 12000);
  const maxBytes = Number(options.maxBytes || 524288);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow', signal: controller.signal,
      headers: { 'user-agent': 'IMMOHRTAL-Scout/1.0 (+https://www.immohrtalmarketing.com)' }
    });
    const contentType = response.headers.get('content-type') || '';
    const raw = (await response.text()).slice(0, maxBytes);
    const html = /html/i.test(contentType) ? extractHtmlEvidence(raw) : { title: '', h1: '', meta_description: '' };
    return {
      ok: response.ok, requested_url: url, final_url: response.url, status: response.status,
      content_type: contentType.slice(0, 120), captured_at: capturedAt,
      content_sha256: sha256(raw), bytes_inspected: Buffer.byteLength(raw), ...html
    };
  } catch (error) {
    return {
      ok: false, requested_url: url, final_url: null, status: null, captured_at: capturedAt,
      error: error?.name === 'AbortError' ? `timeout_after_${timeoutMs}ms` : String(error?.message || error).slice(0, 240)
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function enrichWithWebsiteEvidence(prospects, config, capturedAt) {
  if (config?.live_fetch_enabled !== true) return prospects;
  const concurrency = Math.max(1, Math.min(Number(config.concurrency || 4), 8));
  const result = new Array(prospects.length);
  let cursor = 0;
  async function worker() {
    while (cursor < prospects.length) {
      const index = cursor;
      cursor += 1;
      const prospect = prospects[index];
      result[index] = {
        ...prospect,
        live_evidence: await collectWebsiteEvidence(prospect.website, {
          capturedAt, timeoutMs: config.timeout_ms, maxBytes: config.max_bytes
        })
      };
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, prospects.length) }, () => worker()));
  return result;
}
