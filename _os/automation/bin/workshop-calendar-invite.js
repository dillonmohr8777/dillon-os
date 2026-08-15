#!/usr/bin/env node
/**
 * workshop-calendar-invite.js — registrant calendar invites + ICS export.
 *
 * Writes the public ICS, prints add-to-calendar URLs, or (with a token)
 * adds registrant emails to the canonical Google Calendar event so Gmail
 * users receive a real invitation.
 *
 * Never invite the cold franchise list. Caps: 25 emails per CLI run,
 * 5 per webhook-shaped payload.
 *
 * Usage:
 *   node _os/automation/bin/workshop-calendar-invite.js --write-ics
 *   node _os/automation/bin/workshop-calendar-invite.js --print-urls
 *   node _os/automation/bin/workshop-calendar-invite.js --write-markup
 *   node _os/automation/bin/workshop-calendar-invite.js --print-markup --email a@b.co --name Pat
 *   node _os/automation/bin/workshop-calendar-invite.js --dry-run --email a@b.co
 *   node _os/automation/bin/workshop-calendar-invite.js --invite --email a@b.co
 */
const fs = require("node:fs");
const path = require("node:path");
const {
  WORKSHOP_EVENT,
  MAX_CLI_INVITES,
  buildIcs,
  googleCalendarUrl,
  outlookCalendarUrl,
  eventJsonLd,
  buildConfirmationMarkupHtml,
  extractRegistrationEmails,
  calendarInvitePatch,
  normalizeEmail,
} = require("../lib/workshop-calendar");

const VAULT = path.resolve(__dirname, "../../..");
const DEFAULT_ICS = path.join(
  VAULT,
  "02_Campaigns/Growth Workshop/lp-date-push/momentum-workshops.ics",
);
const DEFAULT_MARKUP = path.join(
  VAULT,
  "02_Campaigns/Growth Workshop/c1-gmail-event.html",
);

function argValue(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? "" : args[index + 1] || "";
}

function collectEmails(args) {
  const emails = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--email" && args[i + 1]) {
      emails.push(args[i + 1]);
      i += 1;
    }
  }
  const jsonPath = argValue(args, "--from-json");
  if (jsonPath) {
    const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    emails.push(...extractRegistrationEmails(payload, { max: MAX_CLI_INVITES }));
  }
  const csvPath = argValue(args, "--from-csv");
  if (csvPath) {
    if (!args.includes("--registrants-only")) {
      throw new Error(
        "CSV import requires --registrants-only. This tool will not load the franchise list.",
      );
    }
    const text = fs.readFileSync(csvPath, "utf8");
    const rows = text.split(/\r?\n/).filter(Boolean);
    if (rows.length > MAX_CLI_INVITES + 1) {
      throw new Error(
        `CSV has ${rows.length - 1} data rows; max ${MAX_CLI_INVITES}. Registrants only.`,
      );
    }
    emails.push(
      ...extractRegistrationEmails(text, { max: MAX_CLI_INVITES }),
    );
  }
  return emails;
}

async function inviteViaApi(patch) {
  const token = process.env.GOOGLE_CALENDAR_ACCESS_TOKEN || "";
  if (!token) {
    const error = new Error(
      "GOOGLE_CALENDAR_ACCESS_TOKEN is not set. Use --dry-run, or add attendees via the connected Google Calendar MCP (addedAttendees + notificationLevel ALL).",
    );
    error.code = "NO_TOKEN";
    throw error;
  }
  const existing = await calendarFetch(
    token,
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(patch.calendarId)}/events/${encodeURIComponent(patch.eventId)}?conferenceDataVersion=1`,
  );
  const current = Array.isArray(existing.attendees) ? existing.attendees : [];
  const have = new Set(
    current.map((row) => String(row.email || "").toLowerCase()),
  );
  const next = [...current];
  for (const attendee of patch.addedAttendees) {
    if (!have.has(attendee.email)) next.push(attendee);
  }
  if (next.length === current.length) {
    return { skipped: true, reason: "already invited", eventId: patch.eventId };
  }
  const updated = await calendarFetch(
    token,
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(patch.calendarId)}/events/${encodeURIComponent(patch.eventId)}?sendUpdates=${patch.sendUpdates}&conferenceDataVersion=1`,
    {
      method: "PATCH",
      body: JSON.stringify({ attendees: next }),
    },
  );
  return {
    skipped: false,
    eventId: updated.id,
    attendeeCount: Array.isArray(updated.attendees) ? updated.attendees.length : next.length,
    hangoutLink: updated.hangoutLink || updated.conferenceData?.entryPoints?.[0]?.uri || "",
  };
}

async function calendarFetch(token, url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    const error = new Error(
      `Calendar API ${response.status}: ${body.error?.message || text.slice(0, 200)}`,
    );
    error.code = "CALENDAR_API";
    throw error;
  }
  return body;
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes("--help") || args.includes("-h")) {
    console.log(`Usage:
  node _os/automation/bin/workshop-calendar-invite.js --write-ics [--out path]
  node _os/automation/bin/workshop-calendar-invite.js --print-urls
  node _os/automation/bin/workshop-calendar-invite.js --write-markup [--out path]
  node _os/automation/bin/workshop-calendar-invite.js --print-markup --email name@domain.tld [--name Pat]
  node _os/automation/bin/workshop-calendar-invite.js --dry-run --email name@domain.tld
  node _os/automation/bin/workshop-calendar-invite.js --invite --email name@domain.tld

Registrants only. Caps at ${MAX_CLI_INVITES} emails. Never pass the franchise CSV.`);
    process.exit(args.length ? 0 : 1);
  }

  if (args.includes("--write-ics")) {
    const out = argValue(args, "--out") || DEFAULT_ICS;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, buildIcs({ method: "PUBLISH" }));
    console.log(`Wrote ${out}`);
    return;
  }

  if (args.includes("--print-urls")) {
    console.log(
      JSON.stringify(
        {
          eventId: WORKSHOP_EVENT.eventId,
          meetingUrl: WORKSHOP_EVENT.meetingUrl,
          google: googleCalendarUrl(),
          outlook: outlookCalendarUrl(),
          ics: WORKSHOP_EVENT.icsUrl,
          eventJsonLd: eventJsonLd(),
        },
        null,
        2,
      ),
    );
    return;
  }

  if (args.includes("--write-markup")) {
    const out = argValue(args, "--out") || DEFAULT_MARKUP;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(
      out,
      buildConfirmationMarkupHtml({
        template: true,
        attendeeName: "{{first_name}}",
        attendeeEmail: "{{email}}",
      }),
    );
    console.log(`Wrote ${out}`);
    return;
  }

  if (args.includes("--print-markup")) {
    const email = argValue(args, "--email");
    const name = argValue(args, "--name") || "there";
    process.stdout.write(
      buildConfirmationMarkupHtml({ attendeeEmail: email, attendeeName: name }),
    );
    return;
  }

  const emails = collectEmails(args).map(normalizeEmail).filter(Boolean);
  const patch = calendarInvitePatch(emails);
  if (args.includes("--dry-run") || !args.includes("--invite")) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          ...patch,
          icsRequest: emails[0]
            ? "METHOD:REQUEST available via buildIcs({ method: 'REQUEST', attendeeEmail })"
            : "",
        },
        null,
        2,
      ),
    );
    return;
  }

  const result = await inviteViaApi(patch);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(error.code === "NO_TOKEN" ? 2 : 1);
});
