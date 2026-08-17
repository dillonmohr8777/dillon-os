/**
 * Netlify Function: add one workshop registrant to the canonical Google Calendar event.
 *
 * Deploy with this folder, then point Netlify Forms notifications at:
 *   /.netlify/functions/calendar-invite?secret=$CALENDAR_INVITE_SECRET
 *
 * Env (Netlify UI, never Git):
 *   CALENDAR_INVITE_SECRET
 *   GOOGLE_CALENDAR_CLIENT_ID
 *   GOOGLE_CALENDAR_CLIENT_SECRET
 *   GOOGLE_CALENDAR_REFRESH_TOKEN
 *   WORKSHOP_CALENDAR_EVENT_ID   (default: the Aug 27 Growth Workshop event)
 *
 * Caps at 5 emails per POST. Do not wire this to the franchise list.
 */
const EVENT_ID = process.env.WORKSHOP_CALENDAR_EVENT_ID || "3onjuqp9rcgc5p346bc67h59vs";
const CALENDAR_ID = process.env.WORKSHOP_CALENDAR_ID || "primary";
const SECRET = process.env.CALENDAR_INVITE_SECRET || "";
const MAX_EMAILS = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

exports.handler = async (event) => {
  if (event.httpMethod === "GET") {
    return json(200, { ok: true, configured: Boolean(SECRET && refreshConfigured()) });
  }
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "method" });
  }

  const secret = (event.queryStringParameters && event.queryStringParameters.secret) || "";
  if (!SECRET || secret !== SECRET) {
    return json(401, { ok: false, error: "unauthorized" });
  }

  let emails;
  try {
    emails = extractEmails(event.body);
  } catch (error) {
    return json(400, { ok: false, error: error.message });
  }
  if (!emails.length) {
    return json(200, { ok: true, skipped: "no email in payload" });
  }
  if (!refreshConfigured()) {
    return json(501, {
      ok: false,
      error: "missing Google OAuth env — use the Apps Script webhook instead",
    });
  }

  try {
    const token = await accessToken();
    const invited = await addAttendees(token, emails);
    return json(200, { ok: true, invited });
  } catch (error) {
    return json(502, { ok: false, error: error.message });
  }
};

function refreshConfigured() {
  return Boolean(
    process.env.GOOGLE_CALENDAR_CLIENT_ID &&
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
      process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
  );
}

function extractEmails(raw) {
  let payload = raw;
  try {
    payload = JSON.parse(raw || "{}");
  } catch {
    payload = Object.fromEntries(new URLSearchParams(raw || ""));
  }
  const found = new Set();
  const push = (value) => {
    const email = String(value || "")
      .trim()
      .toLowerCase();
    if (EMAIL_RE.test(email)) found.add(email);
  };
  if (payload && typeof payload === "object") {
    push(payload.email);
    if (payload.data && typeof payload.data === "object") push(payload.data.email);
  }
  for (const match of String(raw || "").match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []) {
    push(match);
  }
  if (found.size > MAX_EMAILS) {
    throw new Error("too many emails");
  }
  return [...found];
}

async function accessToken() {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID,
    client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await response.json();
  if (!data.access_token) {
    throw new Error(data.error || "token exchange failed");
  }
  return data.access_token;
}

async function addAttendees(token, emails) {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${encodeURIComponent(EVENT_ID)}?sendUpdates=all`;
  const current = await calendarFetch(token, url);
  const attendees = Array.isArray(current.attendees) ? [...current.attendees] : [];
  const have = new Set(attendees.map((row) => String(row.email || "").toLowerCase()));
  const added = [];
  for (const email of emails) {
    if (have.has(email)) continue;
    attendees.push({ email, responseStatus: "needsAction" });
    added.push(email);
  }
  if (!added.length) return [];
  await calendarFetch(token, url, {
    method: "PATCH",
    body: JSON.stringify({ attendees }),
  });
  return added;
}

async function calendarFetch(token, url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `calendar ${response.status}`);
  }
  return data;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
