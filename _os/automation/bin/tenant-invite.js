#!/usr/bin/env node
'use strict';
/**
 * Issue a client an invite to their own environment inside Momentum's.
 *
 * The managed service model: Momentum operates every client's agents. A
 * client is a VIEWER of their own slice, never an operator, and never sees
 * another client. Isolation that matters here is client from client.
 *
 * The token is printed ONCE to this terminal and never stored anywhere in
 * readable form: D1 holds only its sha256. Nothing is written to the repo,
 * to a log, or to any file. If the operator loses it, rotate, do not
 * recover. That is deliberate, matching System/api-keys-setup.md.
 *
 * Usage:
 *   node _os/automation/bin/tenant-invite.js list
 *   node _os/automation/bin/tenant-invite.js create <tenant-id> "<Display Name>"
 *   node _os/automation/bin/tenant-invite.js rotate <tenant-id>
 *   node _os/automation/bin/tenant-invite.js revoke <tenant-id>
 *
 * Needs CLOUDFLARE_API_TOKEN (with D1 Edit) + CLOUDFLARE_ACCOUNT_ID. Neither
 * is on this desktop by design, so this prints the exact SQL to run instead
 * when they are absent: the operator pastes it, the token still only ever
 * exists in their terminal.
 */

const crypto = require('crypto');

const DB_ID = 'e9e219c7-740c-4573-8008-f192317ed992';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || null;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || null;

function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }

// URL-safe, no ambiguous characters, ~186 bits.
function mintToken() {
  return crypto.randomBytes(24).toString('base64').replace(/[+/=]/g, '');
}

async function d1(sql) {
  if (!API_TOKEN || !ACCOUNT_ID) return null;
  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}/query`,
    {
      method: 'POST',
      headers: { authorization: `Bearer ${API_TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify({ sql }),
    },
  );
  const j = await r.json();
  if (!j.success) throw new Error(`D1: ${JSON.stringify(j.errors)}`);
  return j.result;
}

function sqlEscape(s) { return String(s).replace(/'/g, "''"); }

async function runOrPrint(sql, what) {
  const res = await d1(sql);
  if (res) { console.log(`  ${what}: done`); return res; }
  console.log(`\n  CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID not set, so nothing was written.`);
  console.log(`  Run this SQL against D1 "momentum-console" to finish:\n`);
  console.log(`  ${sql}\n`);
  return null;
}

async function main() {
  const [cmd, id, name] = process.argv.slice(2);

  if (cmd === 'list') {
    const res = await d1('SELECT id, display_name, is_operator, status, invited_at, last_seen_at FROM tenants ORDER BY is_operator DESC, id');
    if (!res) { console.log('  needs CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID to read.'); return; }
    const rows = res[0].results || [];
    console.log(`  ${rows.length} tenant(s):`);
    for (const t of rows) {
      console.log(`    ${t.id.padEnd(22)} ${t.is_operator ? 'OPERATOR' : 'client  '} ${t.status.padEnd(8)} ${t.display_name}`);
    }
    return;
  }

  if (cmd === 'create' || cmd === 'rotate') {
    if (!id) { console.error('  need a tenant id'); process.exit(1); }
    if (cmd === 'create' && !name) { console.error('  need a display name'); process.exit(1); }
    const token = mintToken();
    const hash = sha256(token);
    const now = new Date().toISOString();

    const sql = cmd === 'create'
      ? `INSERT OR REPLACE INTO tenants (id, display_name, token_hash, is_operator, status, created_at, invited_at) VALUES ('${sqlEscape(id)}','${sqlEscape(name)}','${hash}',0,'active','${now}','${now}');`
      : `UPDATE tenants SET token_hash='${hash}', invited_at='${now}', status='active' WHERE id='${sqlEscape(id)}';`;

    await runOrPrint(sql, cmd === 'create' ? `tenant ${id} created` : `tenant ${id} rotated`);

    console.log('\n  ' + '='.repeat(64));
    console.log(`  INVITE TOKEN for ${id}, shown once, never stored in readable form:`);
    console.log(`\n    ${token}\n`);
    console.log(`  Send it to the client over a channel you trust, NOT Slack or email`);
    console.log(`  in plain text. They enter it at the console login.`);
    console.log(`  If it is lost: rotate, do not try to recover it.`);
    console.log('  ' + '='.repeat(64) + '\n');
    return;
  }

  if (cmd === 'revoke') {
    if (!id) { console.error('  need a tenant id'); process.exit(1); }
    await runOrPrint(
      `UPDATE tenants SET status='revoked', token_hash=NULL WHERE id='${sqlEscape(id)}';`,
      `tenant ${id} revoked`,
    );
    console.log(`  ${id} can no longer log in. Their data is untouched.`);
    return;
  }

  console.log(`  usage:
    node _os/automation/bin/tenant-invite.js list
    node _os/automation/bin/tenant-invite.js create <tenant-id> "<Display Name>"
    node _os/automation/bin/tenant-invite.js rotate <tenant-id>
    node _os/automation/bin/tenant-invite.js revoke <tenant-id>`);
  process.exit(1);
}

main().catch((e) => { console.error(`  failed: ${e.message}`); process.exit(1); });
