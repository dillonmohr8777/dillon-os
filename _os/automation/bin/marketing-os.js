#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildResearchPrompt,
  buildXaiProfile,
  createCreativeManifest,
  resolveRepoPath,
  scanFreshness,
  validateCreativeManifest,
  validateEvidencePacket,
  validateWatchlist,
  writeCreativeManifest,
  writeEvidenceMarkdown,
} = require('../lib/marketing-os');

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function usage() {
  return `Usage:
  marketing-os.js watchlist --from <watchlist.json> [--out <xai-profile.json>]
  marketing-os.js packet --from <packet.json> --client-id <id> --out <packet.md> [--dry-run]
  marketing-os.js creative --from <creative.json> --client-id <id> [--out <manifest.json>] [--dry-run]
  marketing-os.js freshness --from <freshness.json>`;
}

function readInput() {
  const file = argValue('--from');
  if (!file) throw new Error(usage());
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function requireValid(validation, label) {
  if (!validation.ok) throw new Error(`${label}: ${validation.errors.join('; ')}`);
  return validation.value;
}

function main() {
  const command = process.argv[2];
  if (!['watchlist', 'packet', 'creative', 'freshness'].includes(command)) throw new Error(usage());
  const input = readInput();

  if (command === 'watchlist') {
    const watchlist = requireValid(validateWatchlist(input), 'Invalid watchlist');
    const profile = buildXaiProfile(watchlist);
    const output = argValue('--out');
    let outputPath = null;
    if (output) {
      const target = resolveRepoPath(output);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, `${JSON.stringify(profile, null, 2)}\n`, 'utf8');
      outputPath = output;
    }
    console.log(JSON.stringify({
      status: 'valid',
      dry_run: !output,
      external_calls: 0,
      watchlist,
      profile,
      prompt: buildResearchPrompt(watchlist),
      output_path: outputPath,
    }, null, 2));
    return;
  }

  if (command === 'packet') {
    const clientId = argValue('--client-id');
    const output = argValue('--out');
    if (!clientId || !output) throw new Error(usage());
    const packet = input.marketing_packet || input;
    requireValid(validateEvidencePacket(packet, clientId), 'Invalid evidence packet');
    if (process.argv.includes('--dry-run')) {
      console.log(JSON.stringify({
        status: 'dry-run',
        client_id: clientId,
        output_path: output,
        external_actions: false,
      }, null, 2));
      return;
    }
    console.log(JSON.stringify({
      status: 'local-draft-written',
      client_id: clientId,
      ...writeEvidenceMarkdown(packet, clientId, output),
      external_actions: false,
    }, null, 2));
    return;
  }

  if (command === 'creative') {
    const clientId = argValue('--client-id');
    if (!clientId) throw new Error(usage());
    const manifest = createCreativeManifest(input);
    const validated = requireValid(validateCreativeManifest(manifest, clientId), 'Invalid creative manifest');
    const output = argValue('--out');
    const dryRun = process.argv.includes('--dry-run') || !output;
    console.log(JSON.stringify({
      status: dryRun ? 'dry-run' : 'local-manifest-written',
      manifest: validated,
      output_path: dryRun ? null : writeCreativeManifest(manifest, clientId, output),
      external_actions: false,
    }, null, 2));
    return;
  }

  console.log(JSON.stringify({
    status: 'dry-run',
    external_calls: 0,
    result: scanFreshness(input),
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
