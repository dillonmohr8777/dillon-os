import { parseCsv } from './input-adapters.mjs';
import { normalizeDomain, normalizeEmail } from './policy.mjs';

function value(row, ...headers) {
  for (const header of headers) {
    const candidate = String(row[header] ?? '').trim();
    if (candidate) return candidate;
  }
  return '';
}

function compact(values) { return values.filter(Boolean); }

function sourceRowId(row, index) {
  return value(row, '') || String(index);
}

export function parseClearedSnapshot(csvText, metadata, capturedAt) {
  const rows = parseCsv(csvText);
  const prospects = [];
  let excludedWithoutEmail = 0;
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const company = value(row, 'Business');
    const email = normalizeEmail(value(row, 'Best email', 'Email'));
    const conceptUrl = value(row, 'Our concept', 'Concept URL');
    if (!company || !email || !conceptUrl) {
      excludedWithoutEmail += 1;
      continue;
    }
    const rowId = sourceRowId(row, index);
    prospects.push({
      prospect_id: `drive-cleared-${rowId}`,
      company_name: company,
      website: conceptUrl,
      website_kind: 'prebuilt_concept',
      market: metadata.default_market,
      category: value(row, 'Vertical') || 'local business',
      contact_email: email,
      contact_name: '',
      contact_role: value(row, 'Contact / role'),
      phone: value(row, 'Phone'),
      allowed_channels: ['email'],
      opt_out: false,
      do_not_contact: false,
      concept_url: conceptUrl,
      observations: compact([
        `A prebuilt homepage concept for ${company} is available at ${conceptUrl}.`,
        'The source row is in the live Drive sheet marked cleared to show.',
        value(row, 'Score') ? `The source record carries an internal concept score of ${value(row, 'Score')}; this is not a client result.` : ''
      ]),
      source_locator: {
        sheet_id: metadata.sources.cleared.sheet_id,
        sheet_title: metadata.sources.cleared.title,
        tab: metadata.sources.cleared.tab,
        row_id: rowId,
        captured_at: capturedAt,
        source_modified_at: metadata.sources.cleared.modified_time
      }
    });
  }
  return { prospects, sourceRowCount: rows.length, excludedWithoutEmail };
}

function suppressionEntries(csvText, source, capturedAt, defaultReason) {
  const rows = parseCsv(csvText);
  const entries = [];
  for (const row of rows) {
    const company = value(row, 'Business');
    const reason = value(row, 'Why', 'Fix', 'Status') || defaultReason;
    if (company) entries.push({ type: 'company', value: company.toLowerCase(), reason, source_sheet_id: source.sheet_id, captured_at: capturedAt });
    const domain = normalizeDomain(value(row, 'Their site', 'Website'));
    if (domain) entries.push({ type: 'domain', value: domain, reason, source_sheet_id: source.sheet_id, captured_at: capturedAt });
  }
  return { entries, sourceRowCount: rows.length };
}

export function buildDriveSnapshot({ clearedText, holdText, doNotPitchText, metadata, capturedAt }) {
  if (Number.isNaN(Date.parse(capturedAt))) throw new Error('capturedAt must be an ISO date.');
  const cleared = parseClearedSnapshot(clearedText, metadata, capturedAt);
  const hold = suppressionEntries(holdText, metadata.sources.hold, capturedAt, 'Held pending requalification.');
  const doNotPitch = suppressionEntries(doNotPitchText, metadata.sources.do_not_pitch, capturedAt, 'Do not pitch.');
  return {
    input: {
      source: {
        source_id: metadata.source_id,
        source_type: 'google_drive_snapshot',
        label: metadata.sources.cleared.title,
        requalified_for_immohrtal: true,
        adapter_status: 'live_snapshot',
        captured_at: capturedAt,
        source_modified_at: metadata.sources.cleared.modified_time,
        sheet_id: metadata.sources.cleared.sheet_id
      },
      prospects: cleared.prospects
    },
    suppressions: {
      source: {
        captured_at: capturedAt,
        hold_sheet_id: metadata.sources.hold.sheet_id,
        do_not_pitch_sheet_id: metadata.sources.do_not_pitch.sheet_id
      },
      entries: [...hold.entries, ...doNotPitch.entries]
    },
    counts: {
      cleared_source_rows: cleared.sourceRowCount,
      email_eligible: cleared.prospects.length,
      excluded_without_email_or_concept: cleared.excludedWithoutEmail,
      hold_rows: hold.sourceRowCount,
      do_not_pitch_rows: doNotPitch.sourceRowCount,
      suppression_keys: hold.entries.length + doNotPitch.entries.length
    }
  };
}
