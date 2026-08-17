'use strict';

/**
 * Contact discovery — from the prospect's own website, and nowhere else.
 *
 * ## What this does and does not do
 *
 * It reads what a business has **published on its own site** for the purpose of
 * being contacted: the address on their contact page, the form they put there,
 * the practitioners they list on their team page. That is ordinary B2B research.
 *
 * It deliberately does **not**:
 *
 * - **Guess addresses.** No `firstname@domain` permutation, no pattern
 *   inference. Guessed addresses bounce, and bounces are what destroy a sending
 *   domain's reputation — one campaign to invented addresses can cost more
 *   deliverability than the campaign was ever worth.
 * - **Scrape third parties.** No LinkedIn, no data aggregators, no places whose
 *   terms forbid it. Only the business's own pages.
 * - **Collect people who are not published business contacts.** A named
 *   practitioner on a practice's "Our Team" page is a business contact. Anything
 *   that looks like a private individual is dropped.
 *
 * ## Where the data lives
 *
 * **Never in the tracked repository.** This repo is public; email addresses and
 * personal names are exactly the class of data already stripped from the
 * registry by `sanitizeForGit`. Contacts are written to `12_Brain/private/`
 * (gitignored) and the registry keeps only booleans — the same `has_phone`
 * pattern already used for telephone numbers.
 *
 * ## What the measurement actually showed
 *
 * On 19 reachable rebuild targets: **26% published an email**, 21% offered a
 * contact form, 21% named a person. Most small businesses route contact through
 * a form precisely so their address cannot be harvested. Anyone promising near
 * total email coverage of a local-business list is either guessing addresses or
 * buying them, and the first of those is actively harmful.
 *
 * ## An unexpectedly useful by-product
 *
 * One prospect's published contact address was at a marketing agency's domain.
 * That is not a contact — it is a **disqualifying signal**: the business already
 * has an agency, so a cold redesign pitch walks into an incumbent. Those are
 * detected, kept out of the contact list, and surfaced as their own flag.
 */

const { httpGet } = require('./net');

/** Pages worth checking, in the order a human would try them. */
const CONTACT_PATHS = ['', '/contact', '/contact-us', '/about', '/about-us', '/our-team', '/team', '/staff'];

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

/** Filename-looking matches and obvious template placeholders. */
const NOT_AN_ADDRESS =
  /\.(png|jpe?g|gif|webp|svg|css|js|woff2?)$/i;
/**
 * Template placeholders and demo addresses.
 *
 * The domain alternatives are anchored to a full label (`@wix.`, not `@wix`).
 * Unanchored, this silently discarded real addresses whose domain merely started
 * with one of the keywords — verified: hello@emailus.com, info@testkitchen.com,
 * contact@domainhome.com and jane@wixomlaw.com were all being dropped. On a
 * module whose measured yield is only ~26%, losing valid addresses to a substring
 * match is a real recall loss and invisible from the run summary.
 */
const PLACEHOLDER =
  /^(?:you|your|name|email|someone|user|example|test|first\.last|john\.doe|username)@|@(?:example|sentry|wix|domain|email|yourdomain|test|sentry-next|localhost)\./i;
/** Addresses that reach a vendor's robot rather than the business. */
const ROBOT = /^(?:no-?reply|donotreply|do-not-reply|postmaster|abuse|bounce|mailer-daemon|notifications?|automated)@/i;

/**
 * Domains belonging to marketing/web agencies and site vendors.
 *
 * An address here means the enquiry goes to whoever already handles their
 * marketing. That is a reason not to pitch, not a way to pitch.
 */
const AGENCY_DOMAINS = [
  'askmagnify.com', 'prosites.com', 'officite.com', 'sesamecommunications.com',
  'pbhs.com', 'greatdentalwebsites.com', 'roadsidedentalmarketing.com', 'tntdental.com',
  'smiledoctors.com', 'einsteinmedical.com', 'idagent.com', 'scorpion.co', 'scorpioninc.com',
  'blueprintmarketing.com', 'thrivehive.com', 'yodle.com', 'webfx.com', 'thriveagency.com',
  'godaddy.com', 'wix.com', 'squarespace.com', 'weebly.com', 'duda.co', 'vistaprint.com',
];

/**
 * Named business contacts.
 *
 * Deliberately narrow: a credential or an explicit business title has to be
 * present. "Dr. Jane Smith" and "John Doe, Owner" qualify; two capitalised words
 * in a sentence do not, and an earlier looser pattern produced entries like
 * "Meet Dr" and "What Parents" from ordinary page copy.
 */
const PERSON_RE = new RegExp(
  [
    // Dr. Firstname Lastname
    String.raw`\b(?:Dr\.|Doctor)\s+([A-Z][a-z]{1,15}(?:\s+[A-Z][a-z']{1,18}){1,2})\b`,
    // Firstname Lastname, CREDENTIAL/TITLE
    String.raw`\b([A-Z][a-z]{1,15}\s+(?:[A-Z]\.\s+)?[A-Z][a-z']{1,18})\s*,\s*(?:DMD|DDS|MD|DO|VMD|DVM|Esq\.?|CPA|PE|RN|LMT|Owner|President|Founder|Co-Founder|Partner|Principal|Managing Partner|Practice Manager|Office Manager)\b`,
  ].join('|'),
  'g'
);

/** Words that betray a false positive from ordinary page copy. */
const NOT_A_NAME = /\b(?:Meet|Our|The|What|Welcome|About|Contact|Team|Staff|New|Your|Why|How|Book|Call|Read|More|Home|Dental|Office|Practice|Clinic|Center|Centre)\b/;

function classifyEmail(addr) {
  const e = String(addr).toLowerCase().trim();
  if (!e || e.length > 64) return null;
  if (NOT_AN_ADDRESS.test(e) || PLACEHOLDER.test(e) || ROBOT.test(e)) return null;
  const domain = e.split('@')[1] || '';
  if (!domain.includes('.')) return null;
  const agency = AGENCY_DOMAINS.find((d) => domain === d || domain.endsWith(`.${d}`));
  return { email: e, domain, agency: agency || null };
}

function cleanName(raw) {
  const n = String(raw || '').replace(/\s+/g, ' ').trim();
  if (n.length < 5 || n.length > 42) return null;
  if (NOT_A_NAME.test(n)) return null;
  if (!/^[A-Z][a-z']+(?:\s+[A-Z][a-z'.]+){1,2}$/.test(n)) return null;
  return n;
}

/**
 * Find published contact routes for one prospect.
 *
 * @returns {Promise<{emails:Array, people:Array, form:string|null,
 *                    agencyDomains:Array, pagesRead:number, reachable:boolean}>}
 */
async function findContacts(website, opts = {}) {
  const out = { emails: [], people: [], form: null, agencyDomains: [], pagesRead: 0, reachable: false };
  if (!website) return out;

  const base = String(website).replace(/\/+$/, '');
  const seenEmail = new Set();
  const seenPerson = new Set();
  const ownDomain = (() => {
    try {
      return new URL(base).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  })();

  for (const p of opts.paths || CONTACT_PATHS) {
    // Stop once there is enough to act on — every extra path is a request
    // against someone else's server.
    if (out.emails.length >= 3 && out.people.length >= 2) break;
    let res;
    try {
      res = await httpGet(base + p, { timeoutMs: opts.timeoutMs || 10000 });
    } catch {
      continue;
    }
    if (!res.ok || res.status >= 400 || typeof res.body !== 'string') continue;
    out.reachable = true;
    out.pagesRead += 1;
    const html = res.body;

    if (!out.form && /<form[^>]*>[\s\S]{0,4000}?(?:type=["']email|name=["'](?:email|your-email|e-mail))/i.test(html)) {
      out.form = base + p;
    }

    for (const raw of html.match(EMAIL_RE) || []) {
      const c = classifyEmail(raw);
      if (!c || seenEmail.has(c.email)) continue;
      seenEmail.add(c.email);
      if (c.agency) {
        if (!out.agencyDomains.includes(c.agency)) out.agencyDomains.push(c.agency);
        continue;
      }
      out.emails.push({
        email: c.email,
        // An address on the business's own domain is worth more than a free
        // mailbox: it is likelier to be monitored and likelier to be the owner.
        //
        // Must match on a label boundary. A bare endsWith made
        // info@notsmilecare.com read as smilecare.com's own address — and since
        // own-domain sorts first, the lookalike became the *primary* row in the
        // mail-merge sheet. The AGENCY_DOMAINS check above already does this
        // correctly; this now uses the same shape.
        onOwnDomain: !!ownDomain && (c.domain === ownDomain || c.domain.endsWith(`.${ownDomain}`)),
        source: base + p,
      });
    }

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ');
    for (const m of text.matchAll(PERSON_RE)) {
      const name = cleanName(m[1] || m[2]);
      if (!name || seenPerson.has(name)) continue;
      seenPerson.add(name);
      out.people.push({ name, source: base + p });
    }
  }

  out.emails.sort((a, b) => Number(b.onOwnDomain) - Number(a.onOwnDomain));
  out.people = out.people.slice(0, 6);
  return out;
}

/**
 * Summarise a contact result into the flags the tracked registry may hold.
 *
 * Booleans and counts only — no address, no name. Everything identifying stays
 * in the private store.
 */
function toRegistryFlags(result, { today }) {
  return {
    checked: today,
    has_email: result.emails.length > 0,
    email_count: result.emails.length,
    // The distinction that matters for reply rate.
    email_on_own_domain: result.emails.some((e) => e.onOwnDomain),
    has_form: !!result.form,
    named_contacts: result.people.length,
    // Not a contact route — a reason to think twice about the pitch.
    has_agency: result.agencyDomains.length > 0,
  };
}

module.exports = {
  findContacts,
  toRegistryFlags,
  classifyEmail,
  cleanName,
  CONTACT_PATHS,
  AGENCY_DOMAINS,
};
