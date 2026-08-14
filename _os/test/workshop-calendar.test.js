/**
 * Growth Workshop calendar URLs, ICS, and invite-batch guards.
 * Run: node --test _os/test/workshop-calendar.test.js
 */
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const {
  WORKSHOP_EVENT,
  eventTimes,
  googleCalendarUrl,
  outlookCalendarUrl,
  buildIcs,
  extractRegistrationEmails,
  calendarInvitePatch,
  utcStamp,
} = require("../automation/lib/workshop-calendar");

const VAULT = path.resolve(__dirname, "../..");
const ICS = path.join(
  VAULT,
  "02_Campaigns/Growth Workshop/lp-date-push/momentum-workshops.ics",
);
const BIN = path.join(VAULT, "_os/automation/bin/workshop-calendar-invite.js");

describe("workshop event times", () => {
  it("locks Aug 27 2026 12:00–13:00 America/New_York to 16:00–17:00 UTC", () => {
    const { start, end } = eventTimes();
    assert.equal(utcStamp(start), "20260827T160000Z");
    assert.equal(utcStamp(end), "20260827T170000Z");
    assert.equal(end.getTime() - start.getTime(), 60 * 60 * 1000);
  });
});

describe("add-to-calendar URLs", () => {
  it("Google template includes title, UTC dates, Meet location, and Eastern ctz", () => {
    const url = googleCalendarUrl();
    assert.match(url, /^https:\/\/calendar\.google\.com\/calendar\/render\?/);
    assert.match(url, /action=TEMPLATE/);
    assert.match(url, /text=Build\+a\+Business/);
    assert.match(url, /dates=20260827T160000Z%2F20260827T170000Z/);
    assert.match(url, /meet\.google\.com%2Five-hkws-xdg/);
    assert.match(url, /ctz=America%2FNew_York/);
  });

  it("Outlook deeplink uses the same UTC instants and Meet location", () => {
    const url = outlookCalendarUrl();
    assert.match(url, /^https:\/\/outlook\.live\.com\/calendar\/0\/deeplink\/compose\?/);
    assert.match(url, /startdt=2026-08-27T16%3A00%3A00\.000Z/);
    assert.match(url, /enddt=2026-08-27T17%3A00%3A00\.000Z/);
    assert.match(url, /meet\.google\.com/);
  });
});

describe("ICS builder", () => {
  it("public ICS is METHOD:PUBLISH with stable UID, TZID, ORGANIZER, and alarms", () => {
    const ics = buildIcs({ method: "PUBLISH" });
    assert.match(ics, /METHOD:PUBLISH/);
    assert.match(ics, /UID:growth-workshop-20260827@momentum-workshop-pilot\.netlify\.app/);
    assert.match(ics, /DTSTART;TZID=America\/New_York:20260827T120000/);
    assert.match(ics, /DTEND;TZID=America\/New_York:20260827T130000/);
    assert.match(ics, /ORGANIZER;CN=Momentum 360:MAILTO:sean@needmomentum\.com/);
    assert.match(ics, /TRIGGER:-PT24H/);
    assert.match(ics, /TRIGGER:-PT1H/);
    assert.match(ics, /LOCATION:https:\/\/meet\.google\.com\/ive-hkws-xdg/);
    assert.doesNotMatch(ics, /ATTENDEE/);
  });

  it("REQUEST ICS requires exactly one attendee and does not scan a list", () => {
    assert.throws(() => buildIcs({ method: "REQUEST" }), /attendeeEmail/);
    const ics = buildIcs({
      method: "REQUEST",
      attendeeEmail: "Owner.Name@Example.COM",
    });
    const unfolded = ics.replace(/\r\n /g, "");
    assert.match(ics, /METHOD:REQUEST/);
    assert.match(unfolded, /ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:MAILTO:owner.name@example.com/);
  });

  it("committed public ICS matches the builder", () => {
    const committed = fs.readFileSync(ICS, "utf8");
    assert.equal(committed, buildIcs({ method: "PUBLISH" }));
  });
});

describe("invite guards", () => {
  it("extracts a single Netlify form email and refuses a dump", () => {
    const emails = extractRegistrationEmails({
      form_name: "workshop-registration",
      data: { email: "Owner@Example.com", first_name: "Pat" },
    });
    assert.deepEqual(emails, ["owner@example.com"]);
    assert.throws(
      () =>
        extractRegistrationEmails({
          data: {
            a: "a@example.com",
            b: "b@example.com",
            c: "c@example.com",
            d: "d@example.com",
            e: "e@example.com",
            f: "f@example.com",
          },
        }),
      /max 5/,
    );
  });

  it("builds a Calendar patch for registrants only", () => {
    const patch = calendarInvitePatch(["Pat@Example.com"]);
    assert.equal(patch.eventId, WORKSHOP_EVENT.eventId);
    assert.equal(patch.sendUpdates, "all");
    assert.deepEqual(patch.addedAttendees, [
      { email: "pat@example.com", responseStatus: "needsAction" },
    ]);
    assert.throws(
      () => calendarInvitePatch(Array.from({ length: 26 }, (_, i) => `u${i}@example.com`)),
      /max 25/,
    );
  });

  it("CLI refuses a CSV without --registrants-only", () => {
    const csv = path.join(VAULT, "_os/test/fixtures/workshop-calendar-refuse.csv");
    fs.mkdirSync(path.dirname(csv), { recursive: true });
    fs.writeFileSync(csv, "email\na@example.com\n", "utf8");
    const result = spawnSync(process.execPath, [BIN, "--dry-run", "--from-csv", csv], {
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /registrants-only/i);
  });

  it("CLI --print-urls and --dry-run do not call Google", () => {
    const urls = spawnSync(process.execPath, [BIN, "--print-urls"], { encoding: "utf8" });
    assert.equal(urls.status, 0, urls.stderr);
    const parsed = JSON.parse(urls.stdout);
    assert.equal(parsed.meetingUrl, WORKSHOP_EVENT.meetingUrl);
    assert.match(parsed.google, /calendar\.google\.com/);

    const dry = spawnSync(
      process.execPath,
      [BIN, "--dry-run", "--email", "owner@example.com"],
      { encoding: "utf8" },
    );
    assert.equal(dry.status, 0, dry.stderr);
    const patch = JSON.parse(dry.stdout);
    assert.equal(patch.dryRun, true);
    assert.equal(patch.addedAttendees[0].email, "owner@example.com");
  });
});

describe("landing page wiring", () => {
  it("defaults calendar open + Meet URL and keeps the stable ICS UID", () => {
    const html = fs.readFileSync(
      path.join(VAULT, "02_Campaigns/Growth Workshop/lp-date-push/index.html"),
      "utf8",
    );
    const js = fs.readFileSync(
      path.join(VAULT, "02_Campaigns/Growth Workshop/lp-date-push/script.js"),
      "utf8",
    );
    assert.match(html, /The workshop lands on your calendar/);
    assert.match(html, /name="calendar_open"[\s\S]*checked/);
    assert.match(js, /momentum-workshop-event-v5/);
    assert.match(js, /https:\/\/meet\.google\.com\/ive-hkws-xdg/);
    assert.match(js, /growth-workshop-20260827@momentum-workshop-pilot\.netlify\.app/);
    assert.doesNotMatch(js, /Nothing is added without/);
  });
});
