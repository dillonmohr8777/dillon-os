/**
 * Align HCM reporting stack — post-auth computer-use driver
 *
 * Prerequisites:
 * - Chrome CDP on http://127.0.0.1:9222 with Align-authenticated sessions
 *   OR set PLAYWRIGHT_CDP_ENDPOINT
 * - Operator completed MFA; no passwords in env/chat
 *
 * Boundaries:
 * - HubSpot portal 242825734 only (abort if 50612503 / Momentum)
 * - GA4 G-0Y6LQTTBRJ / alignhcm.com
 * - No posts, ads spend, site content deletes, credential downloads, mass offline reclass
 *
 * Usage: node handoffs/align-reporting-post-auth-configure.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const CDP = process.env.PLAYWRIGHT_CDP_ENDPOINT || 'http://127.0.0.1:9222';
const OUT = process.env.ALIGN_AUDIT_DIR || '/opt/cursor/artifacts/align-reporting';
const HUBSPOT_PORTAL = '242825734';
const FORBIDDEN_PORTAL = '50612503';
const GA4_STREAM = 'G-0Y6LQTTBRJ';
const SITE = 'alignhcm.com';

fs.mkdirSync(OUT, { recursive: true });
const audit = {
  startedAt: new Date().toISOString(),
  mode: 'post-auth',
  rows: [],
  buckets: {
    activated: [],
    alreadyConfigured: [],
    requiresDillonMfaOrConsent: [],
    requiresHigherHubSpotOrAdmin: [],
    requiresBilling: [],
    platformLimitation: []
  },
  errors: []
};

function add(row, bucket) {
  audit.rows.push(row);
  if (bucket) audit.buckets[bucket].push(`${row.platform}: ${row.setting}`);
}

async function shot(page, name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function main() {
  const browser = await chromium.connectOverCDP(CDP);
  const context = browser.contexts()[0];
  if (!context) throw new Error('No browser context on CDP — start Chrome with --remote-debugging-port=9222');
  const page = context.pages()[0] || await context.newPage();

  // --- HubSpot identity ---
  await page.goto(`https://app.hubspot.com/home?portalId=${HUBSPOT_PORTAL}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await page.waitForTimeout(4000);
  const hubUrl = page.url();
  const hubShot = await shot(page, 'postauth-hubspot-home.png');

  if (/login/i.test(hubUrl)) {
    add({
      platform: 'HubSpot',
      account: HUBSPOT_PORTAL,
      setting: 'Portal identity',
      previous: 'Unauthenticated',
      final: 'Still on login',
      evidence: hubShot,
      blocker: 'MFA/login incomplete',
      dillonAccess: 'Complete HubSpot Align login in CDP browser'
    }, 'requiresDillonMfaOrConsent');
    finish();
    return;
  }

  if (hubUrl.includes(FORBIDDEN_PORTAL) || (await page.content()).includes(`portalId=${FORBIDDEN_PORTAL}`)) {
    add({
      platform: 'HubSpot',
      account: hubUrl,
      setting: 'Portal identity',
      previous: 'n/a',
      final: 'ABORT — Momentum/forbidden portal detected',
      evidence: hubShot,
      blocker: 'Wrong portal',
      dillonAccess: 'Switch to Align portal 242825734 only'
    }, 'requiresDillonMfaOrConsent');
    finish();
    return;
  }

  const portalOk = hubUrl.includes(HUBSPOT_PORTAL) || (await page.content()).includes(HUBSPOT_PORTAL);
  add({
    platform: 'HubSpot',
    account: HUBSPOT_PORTAL,
    setting: 'Portal identity verification',
    previous: 'Unverified',
    final: portalOk ? 'Verified Align portal session' : 'Session active but portal id not visible in URL — confirm in Settings',
    evidence: `${hubUrl} ; ${hubShot}`,
    blocker: portalOk ? null : 'Confirm portal id in account settings UI',
    dillonAccess: null
  }, portalOk ? 'activated' : 'requiresDillonMfaOrConsent');

  // Navigate key HubSpot settings surfaces and record state (safe reads first)
  const hubPaths = [
    ['integrations', `https://app.hubspot.com/integrations-settings/${HUBSPOT_PORTAL}/installed`],
    ['social', `https://app.hubspot.com/social/${HUBSPOT_PORTAL}/manage`],
    ['pipelines', `https://app.hubspot.com/contacts/${HUBSPOT_PORTAL}/objects/0-3/pipelines`],
    ['properties', `https://app.hubspot.com/property-settings/${HUBSPOT_PORTAL}/properties?type=0-1`],
    ['workflows', `https://app.hubspot.com/workflows/${HUBSPOT_PORTAL}`],
    ['reports', `https://app.hubspot.com/reports-dashboard/${HUBSPOT_PORTAL}`]
  ];

  for (const [key, url] of hubPaths) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3000);
      const file = await shot(page, `postauth-hubspot-${key}.png`);
      const title = await page.title();
      const body = (await page.locator('body').innerText().catch(() => '')).slice(0, 500);
      add({
        platform: 'HubSpot',
        account: HUBSPOT_PORTAL,
        setting: `Inspect ${key}`,
        previous: 'Unknown',
        final: `Opened: ${title}`,
        evidence: `${file}; snippet=${body.replace(/\s+/g, ' ').slice(0, 240)}`,
        blocker: /upgrade|permission|don't have access|forbidden/i.test(body) ? 'Permission or plan gate visible' : null,
        dillonAccess: /upgrade|permission|don't have access/i.test(body) ? `Grant admin access or upgrade for ${key}` : null
      }, /upgrade|permission|don't have access/i.test(body) ? 'requiresHigherHubSpotOrAdmin' : 'alreadyConfigured');
    } catch (e) {
      audit.errors.push({ key, error: String(e) });
    }
  }

  // --- GA4 ---
  await page.goto('https://analytics.google.com/analytics/web/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  await page.waitForTimeout(4000);
  const gaUrl = page.url();
  const gaShot = await shot(page, 'postauth-ga4.png');
  if (/accounts\.google\.com|signin/i.test(gaUrl)) {
    add({
      platform: 'GA4',
      account: GA4_STREAM,
      setting: 'Property access',
      previous: 'Unknown',
      final: 'Login required',
      evidence: gaShot,
      blocker: 'Google auth',
      dillonAccess: 'Complete Google MFA for Align Analytics'
    }, 'requiresDillonMfaOrConsent');
  } else {
    add({
      platform: 'GA4',
      account: GA4_STREAM,
      setting: 'Property access',
      previous: 'Unknown',
      final: `Session reached Analytics UI (${gaUrl.slice(0, 120)})`,
      evidence: gaShot,
      blocker: 'Operator/agent must still confirm stream ID G-0Y6LQTTBRJ in Admin → Data Streams',
      dillonAccess: null
    }, 'activated');
  }

  // LinkedIn company limitation reminder
  add({
    platform: 'LinkedIn via HubSpot',
    account: 'Maher personal profile',
    setting: 'Personal-profile analytics',
    previous: 'n/a',
    final: 'Platform limitation — native LinkedIn export required',
    evidence: 'Product boundary',
    blocker: 'Not available via HubSpot Social personal profiles',
    dillonAccess: 'Export Maher Profile Analytics CSV from LinkedIn'
  }, 'platformLimitation');

  finish();
}

function finish() {
  audit.finishedAt = new Date().toISOString();
  const jsonPath = path.join(OUT, 'POSTAUTH-AUDIT.json');
  fs.writeFileSync(jsonPath, JSON.stringify(audit, null, 2));
  const md = [
    '# Align post-auth audit',
    '',
    `Started: ${audit.startedAt}`,
    `Finished: ${audit.finishedAt}`,
    '',
    '| Platform | Account | Setting | Previous | Final | Evidence | Blocker | Dillon access |',
    '|---|---|---|---|---|---|---|---|',
    ...audit.rows.map(r =>
      `| ${r.platform} | ${r.account} | ${r.setting} | ${r.previous} | ${r.final} | ${String(r.evidence).replace(/\|/g, '/')} | ${r.blocker || ''} | ${r.dillonAccess || ''} |`
    ),
    '',
    '## Buckets',
    ...Object.entries(audit.buckets).map(([k, v]) => `- **${k}**: ${v.length ? v.join('; ') : 'None'}`),
    '',
    `Stream target: ${GA4_STREAM}; site: ${SITE}; portal: ${HUBSPOT_PORTAL}`
  ].join('\n');
  fs.writeFileSync(path.join(OUT, 'POSTAUTH-AUDIT.md'), md);
  console.log(JSON.stringify({ rows: audit.rows.length, buckets: Object.fromEntries(Object.entries(audit.buckets).map(([k, v]) => [k, v.length])), jsonPath }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
