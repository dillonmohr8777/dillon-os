/**
 * Canonical Growth Workshop calendar payload + ICS / add-to-calendar URLs.
 *
 * Public ICS is METHOD:PUBLISH (download / webcal). METHOD:REQUEST is only for
 * a single registrant invite file — never for the cold franchise list.
 */
const crypto = require("node:crypto");

const WORKSHOP_EVENT = {
  eventId: "3onjuqp9rcgc5p346bc67h59vs",
  uid: "growth-workshop-20260827@momentum-workshop-pilot.netlify.app",
  title: "Build a Business That Grows Without You",
  date: "2026-08-27",
  time: "12:00",
  durationMinutes: 60,
  timeZone: "America/New_York",
  meetingUrl: "https://meet.google.com/ive-hkws-xdg",
  publicUrl:
    "https://momentum-workshop-pilot.netlify.app/?utm_source=calendar&utm_medium=event&utm_campaign=growth-workshop",
  canonicalUrl: "https://momentum-workshop-pilot.netlify.app/",
  icsUrl: "https://momentum-workshop-pilot.netlify.app/momentum-workshops.ics",
  host: "Sean and Mac",
  organizerName: "Momentum 360",
  organizerEmail: "sean@needmomentum.com",
  prodId: "-//Momentum 360//Growth Workshop//EN",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const MAX_WEBHOOK_EMAILS = 5;
const MAX_CLI_INVITES = 25;

function eventTimes(config = WORKSHOP_EVENT) {
  const start = zonedDateTimeToUtc(config.date, config.time, config.timeZone);
  return {
    start,
    end: new Date(start.getTime() + Number(config.durationMinutes) * 60000),
  };
}

function calendarDescription(config = WORKSHOP_EVENT) {
  return [
    `Live Momentum 360 workshop hosted by ${config.host}.`,
    "Bring one active offer and one growth constraint.",
    `Join the live workshop: ${config.meetingUrl}`,
  ].join(" ");
}

function googleCalendarUrl(config = WORKSHOP_EVENT) {
  const { start, end } = eventTimes(config);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: config.title,
    dates: `${utcStamp(start)}/${utcStamp(end)}`,
    details: calendarDescription(config),
    location: config.meetingUrl,
    ctz: config.timeZone,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function outlookCalendarUrl(config = WORKSHOP_EVENT) {
  const { start, end } = eventTimes(config);
  const params = new URLSearchParams({
    rru: "addevent",
    subject: config.title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: calendarDescription(config),
    location: config.meetingUrl,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`;
}

function buildIcs(options = {}) {
  const config = { ...WORKSHOP_EVENT, ...(options.config || {}) };
  const method = options.method === "REQUEST" ? "REQUEST" : "PUBLISH";
  const attendeeEmail = normalizeEmail(options.attendeeEmail);
  if (method === "REQUEST" && !attendeeEmail) {
    throw new Error("METHOD:REQUEST requires a single attendeeEmail");
  }
  const { start, end } = eventTimes(config);
  const stamp = utcStamp(options.dtStamp || new Date("2026-08-14T18:57:35Z"));
  const localStart = `${config.date.replace(/-/g, "")}T${config.time.replace(":", "")}00`;
  const endClock = addMinutesToClock(config.time, config.durationMinutes);
  const localEnd = `${config.date.replace(/-/g, "")}T${endClock}00`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${config.prodId}`,
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    `X-WR-CALNAME:${icsEscape(config.title)}`,
    `X-WR-TIMEZONE:${config.timeZone}`,
    ...vtimezoneAmericaNewYork(),
    "BEGIN:VEVENT",
    `UID:${config.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${config.timeZone}:${localStart}`,
    `DTEND;TZID=${config.timeZone}:${localEnd}`,
    `SUMMARY:${icsEscape(config.title)}`,
    `DESCRIPTION:${icsEscape(calendarDescription(config))}`,
    `LOCATION:${icsEscape(config.meetingUrl)}`,
    `URL:${config.publicUrl}`,
    `ORGANIZER;CN=${icsEscape(config.organizerName)}:MAILTO:${config.organizerEmail}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "SEQUENCE:0",
  ];

  if (method === "REQUEST") {
    lines.push(
      `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:MAILTO:${attendeeEmail}`,
    );
  }

  lines.push(
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Workshop starts in 24 hours",
    "TRIGGER:-PT24H",
    "END:VALARM",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Workshop starts in 1 hour",
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  );

  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}

function vtimezoneAmericaNewYork() {
  return [
    "BEGIN:VTIMEZONE",
    "TZID:America/New_York",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0400",
    "TZNAME:EDT",
    "DTSTART:19700308T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0400",
    "TZOFFSETTO:-0500",
    "TZNAME:EST",
    "DTSTART:19701101T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
}

function extractRegistrationEmails(payload, options = {}) {
  const max = Number(options.max || MAX_WEBHOOK_EMAILS);
  const text =
    typeof payload === "string" ? payload : JSON.stringify(payload || {});
  const found = new Set();

  const push = (value) => {
    const email = normalizeEmail(value);
    if (email) found.add(email);
  };

  if (payload && typeof payload === "object") {
    push(payload.email);
    push(payload.data && payload.data.email);
    if (payload.data && typeof payload.data === "object") {
      for (const [key, value] of Object.entries(payload.data)) {
        if (/^email$/i.test(key) || /e-?mail/i.test(key)) push(value);
      }
    }
  }

  for (const match of text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []) {
    push(match);
  }

  const emails = [...found];
  if (emails.length > max) {
    const error = new Error(
      `Refusing ${emails.length} emails in one payload (max ${max}). Registrants only — never the franchise list.`,
    );
    error.code = "TOO_MANY_EMAILS";
    throw error;
  }
  return emails;
}

function assertInviteBatch(emails, options = {}) {
  const max = Number(options.max || MAX_CLI_INVITES);
  const unique = [...new Set(emails.map(normalizeEmail).filter(Boolean))];
  if (!unique.length) {
    const error = new Error("No valid emails to invite");
    error.code = "NO_EMAILS";
    throw error;
  }
  if (unique.length > max) {
    const error = new Error(
      `Refusing batch of ${unique.length} (max ${max}). This path is for registrants, not the cold list.`,
    );
    error.code = "TOO_MANY_EMAILS";
    throw error;
  }
  return unique;
}

function calendarInvitePatch(emails, options = {}) {
  const attendees = assertInviteBatch(emails, options).map((email) => ({
    email,
    responseStatus: "needsAction",
  }));
  return {
    eventId: options.eventId || WORKSHOP_EVENT.eventId,
    calendarId: options.calendarId || "primary",
    sendUpdates: "all",
    addedAttendees: attendees,
  };
}

function clockWithColon(hhmm) {
  const raw = String(hhmm || "");
  if (raw.includes(":")) return raw.length === 5 ? raw : `${raw}:00`.slice(0, 5);
  return `${raw.slice(0, 2)}:${raw.slice(2, 4) || "00"}`;
}

function eventIsoTimes(config = WORKSHOP_EVENT) {
  // Aug 27 2026 is Eastern Daylight Time (UTC−4). Do not send Z here — Gmail
  // EventReservation and schema.org Event want a local offset.
  const endClock = clockWithColon(addMinutesToClock(config.time, config.durationMinutes));
  return {
    start: `${config.date}T${clockWithColon(config.time)}:00-04:00`,
    end: `${config.date}T${endClock}:00-04:00`,
  };
}

function eventJsonLd(config = WORKSHOP_EVENT) {
  const iso = eventIsoTimes(config);
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: config.title,
    description: calendarDescription(config),
    startDate: iso.start,
    endDate: iso.end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    isAccessibleForFree: true,
    url: config.canonicalUrl || config.publicUrl,
    image: "https://momentum-workshop-pilot.netlify.app/assets/mac-sean-momentum-glass-hero.webp",
    location: {
      "@type": "VirtualLocation",
      url: config.canonicalUrl || config.publicUrl,
    },
    organizer: {
      "@type": "Organization",
      name: config.organizerName,
      url: "https://www.momentumvirtualtours.com/",
    },
    performer: [
      { "@type": "Person", name: "Sean Boyle" },
      { "@type": "Person", name: "Mac Frederick" },
    ],
    offers: {
      "@type": "Offer",
      url: `${(config.canonicalUrl || config.publicUrl).replace(/[?#].*$/, "")}#register`,
      price: 0,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      validFrom: "2026-08-14",
    },
  };
}

function eventJsonLdScript(config = WORKSHOP_EVENT) {
  return `<script type="application/ld+json">\n${JSON.stringify(eventJsonLd(config), null, 2)}\n</script>`;
}

function gmailEventReservation(options = {}) {
  const config = { ...WORKSHOP_EVENT, ...(options.config || {}) };
  const template = options.template === true;
  const email = template
    ? String(options.attendeeEmail || "{{email}}").trim()
    : normalizeEmail(options.attendeeEmail);
  if (!template && !email) {
    throw new Error(
      "EventReservation requires a single attendeeEmail. Registrants only — never the cold list.",
    );
  }
  const name = String(options.attendeeName || "there").trim() || "there";
  const reservationNumber = template
    ? "GW-20260827-{{reservation_id}}"
    : `GW-20260827-${crypto.createHash("sha256").update(email).digest("hex").slice(0, 10)}`;
  const iso = eventIsoTimes(config);
  return {
    "@context": "http://schema.org",
    "@type": "EventReservation",
    reservationNumber,
    reservationStatus: "http://schema.org/Confirmed",
    url: config.publicUrl,
    underName: {
      "@type": "Person",
      name,
      email,
    },
    reservationFor: {
      "@type": "Event",
      name: config.title,
      startDate: iso.start,
      endDate: iso.end,
      url: config.publicUrl,
      location: {
        "@type": "Place",
        name: "Google Meet (live online)",
        url: config.meetingUrl,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Philadelphia",
          addressRegion: "PA",
          addressCountry: "US",
        },
      },
    },
  };
}

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildConfirmationMarkupHtml(options = {}) {
  const config = { ...WORKSHOP_EVENT, ...(options.config || {}) };
  const template = options.template === true;
  const reservation = gmailEventReservation(options);
  const name = htmlEscape(reservation.underName.name);
  const meet = htmlEscape(config.meetingUrl);
  const google = htmlEscape(googleCalendarUrl(config));
  const outlook = htmlEscape(outlookCalendarUrl(config));
  const ics = htmlEscape(config.icsUrl);
  const jsonLd = JSON.stringify(reservation, null, 2);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>You're in — ${htmlEscape(config.title)}</title>
  <script type="application/ld+json">
${jsonLd}
  </script>
</head>
<body>
  <p>Hi ${name},</p>
  <p>You're registered for the Momentum 360 Growth Workshop — <strong>Thursday, August 27, 12:00–1:00 PM ET</strong>.</p>
  <p>Join link: <a href="${meet}">${meet}</a></p>
  <p>Add to calendar:
    <a href="${google}">Google</a> ·
    <a href="${outlook}">Outlook</a> ·
    <a href="${ics}">ICS</a>
  </p>
  <p>One ask before Thursday: hit reply and tell us the single biggest bottleneck at your business right now. Mac and I build the session around what registrants send.</p>
  <p>See you Thursday,<br/>Sean + Mac</p>
  ${template ? "<p style=\"color:#666;font-size:12px\">GHL/HTML send. Gmail cards need DKIM on the From domain, then a one-time markup registration. Cold sequence stays plain text — do not paste this into Touch 1.</p>" : ""}
</body>
</html>
`;
}

function zonedDateTimeToUtc(dateValue, timeValue, timeZone) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let guess = target;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  for (let pass = 0; pass < 3; pass += 1) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date(guess))
        .filter(({ type }) => type !== "literal")
        .map(({ type, value }) => [type, Number(value)]),
    );
    const rendered = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    guess += target - rendered;
  }
  return new Date(guess);
}

function utcStamp(date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function addMinutesToClock(timeValue, minutes) {
  const [hour, minute] = timeValue.split(":").map(Number);
  const total = hour * 60 + minute + Number(minutes);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}`;
}

function icsEscape(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldIcsLine(line) {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts = [];
  let offset = 0;
  let limit = 75;
  while (offset < bytes.length) {
    let end = Math.min(bytes.length, offset + limit);
    while (end < bytes.length && end > offset && (bytes[end] & 0xc0) === 0x80) {
      end -= 1;
    }
    parts.push(bytes.slice(offset, end).toString("utf8"));
    offset = end;
    limit = 74;
  }
  return parts[0] + parts.slice(1).map((part) => `\r\n ${part}`).join("");
}

function normalizeEmail(value) {
  const email = String(value || "")
    .trim()
    .toLowerCase();
  return EMAIL_RE.test(email) ? email : "";
}

function randomSecret() {
  return crypto.randomBytes(16).toString("hex");
}

module.exports = {
  WORKSHOP_EVENT,
  MAX_WEBHOOK_EMAILS,
  MAX_CLI_INVITES,
  eventTimes,
  calendarDescription,
  googleCalendarUrl,
  outlookCalendarUrl,
  buildIcs,
  extractRegistrationEmails,
  assertInviteBatch,
  calendarInvitePatch,
  eventIsoTimes,
  eventJsonLd,
  eventJsonLdScript,
  gmailEventReservation,
  buildConfirmationMarkupHtml,
  zonedDateTimeToUtc,
  utcStamp,
  normalizeEmail,
  randomSecret,
};
