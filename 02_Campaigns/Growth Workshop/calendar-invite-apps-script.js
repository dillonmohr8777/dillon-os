/**
 * Paste into script.google.com (Dillon's Google account that owns the workshop event).
 *
 * Setup:
 * 1. New project → paste this file → Services → add "Google Calendar API" (Advanced).
 * 2. Project Settings → Script properties:
 *      WEBHOOK_SECRET          = a long random string (not in Git)
 *      WORKSHOP_EVENT_ID       = 3onjuqp9rcgc5p346bc67h59vs
 * 3. Deploy → New deployment → Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 4. Netlify → Forms → Form notifications → URL
 *      https://script.google.com/macros/s/DEPLOYMENT_ID/exec?secret=WEBHOOK_SECRET
 *      Form: workshop-registration
 *
 * Effect: each Netlify registration adds that email as a guest on the canonical
 * event. Google then emails a calendar invitation. Gmail often places it on the
 * calendar as tentative; other clients get an invite they can accept.
 *
 * Hard rules: one (or few) emails per POST. Never point this at the franchise list.
 */
var MAX_EMAILS = 5;
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: "workshop-calendar-invite" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty("WEBHOOK_SECRET") || "";
  var given = (e && e.parameter && e.parameter.secret) || "";
  if (!secret || given !== secret) {
    return json_({ ok: false, error: "unauthorized" });
  }

  var emails = extractEmails_(e);
  if (emails.length > MAX_EMAILS) {
    return json_({ ok: false, error: "too many emails" });
  }
  if (!emails.length) {
    return json_({ ok: true, skipped: "no email" });
  }

  var eventId = props.getProperty("WORKSHOP_EVENT_ID") || "3onjuqp9rcgc5p346bc67h59vs";
  var calendarId = props.getProperty("WORKSHOP_CALENDAR_ID") || "primary";
  var event = Calendar.Events.get(calendarId, eventId);
  var attendees = event.attendees || [];
  var have = {};
  attendees.forEach(function (row) {
    if (row.email) have[String(row.email).toLowerCase()] = true;
  });
  var added = [];
  emails.forEach(function (email) {
    if (have[email]) return;
    attendees.push({ email: email, responseStatus: "needsAction" });
    added.push(email);
  });
  if (!added.length) {
    return json_({ ok: true, skipped: "already invited" });
  }
  Calendar.Events.patch(
    { attendees: attendees },
    calendarId,
    eventId,
    { sendUpdates: "all" },
  );
  return json_({ ok: true, invited: added.length });
}

function extractEmails_(e) {
  var found = {};
  var push = function (value) {
    var email = String(value || "").trim().toLowerCase();
    if (EMAIL_RE.test(email)) found[email] = true;
  };
  var raw = (e && e.postData && e.postData.contents) || "";
  try {
    var payload = JSON.parse(raw);
    push(payload.email);
    if (payload.data) push(payload.data.email);
  } catch (err) {
    // Netlify may send form-encoded bodies.
  }
  var matches = raw.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
  matches.forEach(push);
  return Object.keys(found);
}

function json_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
