'use strict';

/**
 * Renders the prospect radar as a single self-contained HTML page.
 *
 * This is a UI, not a document: it gets scanned at 7am to answer one question —
 * who do we build for today — so the summary comes before the detail and state
 * is encoded in form (stripe, chip, meter) as well as number.
 *
 * Design system is derived from the subject rather than applied to it: the score
 * scale IS the palette, running rust → orange → ochre → slate → teal, so a row's
 * colour is its grade. Trend colours come from the same scale's ends, which keeps
 * semantic colour and accent from fighting.
 *
 * No external resources of any kind — no font CDN, no script tag, no image host.
 * The page is written to disk by bin/radar-refresh.js and can be opened straight
 * from the vault or published as an artifact.
 */

const BAND_COLORS = {
  broken: 'var(--s-broken)',
  decayed: 'var(--s-decayed)',
  dated: 'var(--s-dated)',
  unconfirmed: 'var(--s-unconfirmed)',
  strong: 'var(--s-strong)',
  elite: 'var(--s-strong)',
  ungraded: 'var(--fg-faint)',
};

const VERDICT_LABEL = {
  rebuild: 'Rebuild',
  verify: 'Needs render',
  polish: 'Polish',
  ads_seo: 'Ads / SEO',
  nurture: 'Nurture',
  enrich: 'Re-audit',
  suppress: 'Suppressed',
};

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const num = (v, fallback = '—') => (Number.isFinite(Number(v)) ? String(Math.round(Number(v))) : fallback);

/** Score meter: the row's grade as a bar, coloured by band. */
function meter(score, band) {
  if (!Number.isFinite(Number(score))) {
    return '<span class="meter meter--empty" aria-label="ungraded">not graded</span>';
  }
  const s = Math.max(0, Math.min(100, Number(score)));
  return (
    `<span class="meter" role="img" aria-label="site quality ${Math.round(s)} of 100, ${esc(band)}">` +
    `<span class="meter__track"><span class="meter__fill" style="width:${s}%;background:${BAND_COLORS[band] || 'var(--fg-faint)'}"></span></span>` +
    `<span class="meter__num">${Math.round(s)}</span></span>`
  );
}

/** Sparkline over a prospect's grade history. Only drawn when there is a line to draw. */
function sparkline(grades) {
  const pts = (grades || []).map((g) => g.sqs).filter((v) => Number.isFinite(Number(v)));
  if (pts.length < 2) return '<span class="spark spark--none" aria-hidden="true">·</span>';
  const w = 54;
  const h = 18;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const coords = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * (w - 2) + 1;
    const y = h - 1 - ((v - min) / span) * (h - 2);
    return [x, y];
  });
  const d = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${d} L${coords[coords.length - 1][0].toFixed(1)} ${h} L${coords[0][0].toFixed(1)} ${h} Z`;
  const last = coords[coords.length - 1];
  const delta = pts[pts.length - 1] - pts[0];
  const stroke = delta <= -8 ? 'var(--s-decayed)' : delta >= 8 ? 'var(--s-strong)' : 'var(--fg-faint)';
  return (
    `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" ` +
    `aria-label="grade history, ${pts.join(' then ')}">` +
    `<path d="${area}" fill="${stroke}" opacity="0.12"/>` +
    `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2" fill="${stroke}"/>` +
    '</svg>'
  );
}

function trendChip(p) {
  if (p.trend === 'declined') {
    return `<span class="chip chip--down">▼ ${Math.abs(p.trend_delta)}</span>`;
  }
  if (p.trend === 'improved') {
    return `<span class="chip chip--up">▲ ${p.trend_delta}</span>`;
  }
  if (p.trend === 'new') return '<span class="chip chip--new">new</span>';
  return '<span class="chip chip--flat">—</span>';
}

function queueRow(p, i) {
  const c = p.current || {};
  const fault = (p.top_faults || [])[0] || '';
  const where = [p.city, p.area && p.area !== p.city ? p.area : ''].filter(Boolean).join(' · ');
  return `<tr>
  <td class="c-rank">${i + 1}</td>
  <td class="c-biz">
    <a href="${esc(p.website)}" target="_blank" rel="noopener noreferrer">${esc(p.business_name)}</a>
    <span class="sub">${esc(p.vertical || p.vertical_group)}${where ? ` · ${esc(where)}` : ''}</span>
  </td>
  <td class="c-score">${meter(c.sqs, c.band)}</td>
  <td class="c-spark">${sparkline(p.grades)}</td>
  <td class="c-trend">${trendChip(p)}</td>
  <td class="c-prio"><strong>${num(p.priority_score)}</strong></td>
  <td class="c-why">${esc(fault)}</td>
</tr>`;
}

function coverageBar(label, total, rebuild, max) {
  const pct = max > 0 ? (total / max) * 100 : 0;
  const rebuildPct = total > 0 ? (rebuild / total) * 100 : 0;
  return `<div class="cov">
  <div class="cov__head"><span>${esc(label)}</span><span class="cov__n">${total}<span class="cov__sub"> · ${rebuild} rebuild</span></span></div>
  <div class="cov__track" role="img" aria-label="${esc(label)}: ${total} prospects, ${rebuild} rebuild targets">
    <div class="cov__fill" style="width:${pct.toFixed(1)}%"></div>
    <div class="cov__mark" style="width:${(pct * rebuildPct / 100).toFixed(1)}%"></div>
  </div>
</div>`;
}

/**
 * @param {object} summary  radar.summarize() output
 * @param {object} opts     { queueLimit, generatedAt, blockers }
 */
function renderDashboard(summary, opts = {}) {
  const queueLimit = opts.queueLimit || 40;
  const s = summary;
  const queue = (s.build_queue || []).slice(0, queueLimit);
  const traffic = (s.traffic_queue || []).slice(0, 12);
  const movers = (s.movers || []).slice(0, 8);

  const areaEntries = Object.entries(s.by_area || {}).sort((a, b) => b[1].total - a[1].total);
  const areaMax = Math.max(1, ...areaEntries.map(([, v]) => v.total));
  const groupEntries = Object.entries(s.by_vertical_group || {}).sort((a, b) => b[1].rebuild - a[1].rebuild);
  const groupMax = Math.max(1, ...groupEntries.map(([, v]) => v.total));

  const bandOrder = ['broken', 'decayed', 'dated', 'unconfirmed', 'strong', 'elite'];
  const bandTotal = bandOrder.reduce((t, b) => t + (s.by_band?.[b] || 0), 0);

  return `<title>Prospect Radar — Momentum 360</title>
<meta name="robots" content="noindex,nofollow">
<!-- This page names hundreds of real businesses next to a judgement about their
     website. It is an internal worksheet and must never be indexed, whatever
     host it ends up on. lib/netlify.js refuses to publish it without this. -->
<style>
  :root {
    /* The score scale is the palette: a row's colour is its grade. */
    --s-broken: #A63D2F;
    --s-decayed: #C4622D;
    --s-dated: #B08A2E;
    --s-unconfirmed: #4C6B8A;
    --s-strong: #2F7368;

    --bg: #E6E9EC;
    --bg-panel: #EFF1F3;
    --bg-sunk: #DCE0E4;
    --fg: #131A20;
    --fg-mid: #47525C;
    --fg-faint: #7C8892;
    --rule: #C6CCD2;
    --rule-strong: #A9B2BA;
    --accent: #3A5570;

    --serif: ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
    --sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --mono: ui-monospace, "SF Mono", SFMono-Regular, "Cascadia Mono", Menlo, Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #131A20;
      --bg-panel: #1A232B;
      --bg-sunk: #0D1317;
      --fg: #E4E8EB;
      --fg-mid: #A0ACB6;
      --fg-faint: #6C7A85;
      --rule: #2A353F;
      --rule-strong: #3C4954;
      --accent: #7FA3C4;
      --s-broken: #D4614F;
      --s-decayed: #E08145;
      --s-dated: #CFA945;
      --s-unconfirmed: #6E93B8;
      --s-strong: #4A9E90;
    }
  }
  :root[data-theme="dark"] {
    --bg: #131A20; --bg-panel: #1A232B; --bg-sunk: #0D1317;
    --fg: #E4E8EB; --fg-mid: #A0ACB6; --fg-faint: #6C7A85;
    --rule: #2A353F; --rule-strong: #3C4954; --accent: #7FA3C4;
    --s-broken: #D4614F; --s-decayed: #E08145; --s-dated: #CFA945;
    --s-unconfirmed: #6E93B8; --s-strong: #4A9E90;
  }
  :root[data-theme="light"] {
    --bg: #E6E9EC; --bg-panel: #EFF1F3; --bg-sunk: #DCE0E4;
    --fg: #131A20; --fg-mid: #47525C; --fg-faint: #7C8892;
    --rule: #C6CCD2; --rule-strong: #A9B2BA; --accent: #3A5570;
    --s-broken: #A63D2F; --s-decayed: #C4622D; --s-dated: #B08A2E;
    --s-unconfirmed: #4C6B8A; --s-strong: #2F7368;
  }

  body {
    margin: 0;
    background: var(--bg);
    color: var(--fg);
    font-family: var(--sans);
    font-size: 15px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 32px 24px 80px; }
  a { color: var(--accent); text-decoration-thickness: 1px; text-underline-offset: 2px; }
  a:focus-visible, [tabindex]:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  /* Masthead — a ledger heading, not a hero. */
  .mast { border-bottom: 2px solid var(--fg); padding-bottom: 14px; display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px 20px; }
  .mast h1 { font-family: var(--serif); font-size: clamp(26px, 4vw, 38px); font-weight: 600; letter-spacing: -0.015em; margin: 0; text-wrap: balance; }
  .mast .meta { font-family: var(--mono); font-size: 12px; color: var(--fg-mid); margin-left: auto; text-align: right; }
  .eyebrow { font-family: var(--mono); font-size: 11px; letter-spacing: 0.11em; text-transform: uppercase; color: var(--fg-faint); }

  /* The four numbers that decide the morning. */
  .decide { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1px; background: var(--rule); border: 1px solid var(--rule); margin: 24px 0 8px; }
  .stat { background: var(--bg-panel); padding: 14px 16px; }
  .stat__n { font-family: var(--mono); font-size: 30px; font-variant-numeric: tabular-nums; line-height: 1.05; letter-spacing: -0.02em; }
  .stat__l { font-size: 12px; color: var(--fg-mid); margin-top: 3px; }
  .stat--act .stat__n { color: var(--s-decayed); }
  .stat--hold .stat__n { color: var(--s-unconfirmed); }

  h2 { font-family: var(--serif); font-size: 19px; font-weight: 600; margin: 40px 0 4px; letter-spacing: -0.01em; }
  h2 + .note { color: var(--fg-mid); font-size: 13.5px; margin: 0 0 14px; max-width: 66ch; }

  /* Distribution strip: the whole graded set as one bar. */
  .dist { display: flex; height: 30px; border: 1px solid var(--rule-strong); overflow: hidden; }
  .dist__seg { display: flex; align-items: center; justify-content: center; font-family: var(--mono); font-size: 11px; color: #fff; min-width: 0; }
  .dist__legend { display: flex; flex-wrap: wrap; gap: 4px 18px; margin-top: 8px; font-family: var(--mono); font-size: 11.5px; color: var(--fg-mid); }
  .dist__legend i { display: inline-block; width: 9px; height: 9px; margin-right: 5px; }

  .scroll { overflow-x: auto; border: 1px solid var(--rule); background: var(--bg-panel); }
  table { border-collapse: collapse; width: 100%; font-size: 13.5px; }
  thead th { position: sticky; top: 0; background: var(--bg-sunk); text-align: left; font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-mid); padding: 9px 10px; border-bottom: 1px solid var(--rule-strong); white-space: nowrap; }
  tbody td { padding: 9px 10px; border-bottom: 1px solid var(--rule); vertical-align: middle; }
  tbody tr:last-child td { border-bottom: 0; }
  .c-rank { font-family: var(--mono); color: var(--fg-faint); font-size: 12px; width: 34px; font-variant-numeric: tabular-nums; }
  .c-biz a { font-weight: 550; text-decoration: none; }
  .c-biz a:hover { text-decoration: underline; }
  .c-biz .sub { display: block; font-size: 11.5px; color: var(--fg-faint); font-family: var(--mono); }
  .c-prio { font-family: var(--mono); font-variant-numeric: tabular-nums; text-align: right; width: 62px; }
  .c-why { color: var(--fg-mid); font-size: 12.5px; max-width: 34ch; }
  .c-spark { width: 60px; } .c-trend { width: 62px; } .c-score { width: 132px; }

  .meter { display: flex; align-items: center; gap: 8px; }
  .meter__track { flex: 1; height: 7px; background: var(--bg-sunk); border: 1px solid var(--rule); min-width: 56px; }
  .meter__fill { display: block; height: 100%; }
  .meter__num { font-family: var(--mono); font-size: 12.5px; font-variant-numeric: tabular-nums; width: 22px; text-align: right; }
  .meter--empty { font-family: var(--mono); font-size: 11.5px; color: var(--fg-faint); }
  .spark { display: block; } .spark--none { color: var(--fg-faint); font-family: var(--mono); }

  .chip { font-family: var(--mono); font-size: 11px; padding: 2px 6px; border: 1px solid currentColor; white-space: nowrap; }
  .chip--down { color: var(--s-decayed); } .chip--up { color: var(--s-strong); }
  .chip--flat, .chip--new { color: var(--fg-faint); }

  .rails { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 34px; }
  .cov { margin-bottom: 12px; }
  .cov__head { display: flex; justify-content: space-between; align-items: baseline; font-size: 13px; gap: 10px; }
  .cov__n { font-family: var(--mono); font-variant-numeric: tabular-nums; font-size: 12.5px; }
  .cov__sub { color: var(--fg-faint); }
  .cov__track { position: relative; height: 8px; background: var(--bg-sunk); border: 1px solid var(--rule); margin-top: 5px; }
  .cov__fill { position: absolute; inset: 0 auto 0 0; background: var(--fg-faint); opacity: 0.45; }
  .cov__mark { position: absolute; inset: 0 auto 0 0; background: var(--s-decayed); }

  .list { list-style: none; padding: 0; margin: 0; }
  .list li { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid var(--rule); font-size: 13.5px; }
  .list li:last-child { border-bottom: 0; }
  .list .n { font-family: var(--mono); font-variant-numeric: tabular-nums; color: var(--fg-mid); font-size: 12.5px; white-space: nowrap; }
  .list a { text-decoration: none; } .list a:hover { text-decoration: underline; }

  .callout { border-left: 3px solid var(--s-unconfirmed); background: var(--bg-panel); padding: 12px 16px; margin: 14px 0; font-size: 13.5px; color: var(--fg-mid); }
  .callout strong { color: var(--fg); }
  footer { margin-top: 56px; padding-top: 16px; border-top: 1px solid var(--rule); font-family: var(--mono); font-size: 11.5px; color: var(--fg-faint); }
  @media (max-width: 640px) { .c-spark, .c-why { display: none; } .wrap { padding: 20px 14px 60px; } }
</style>

<div class="wrap">
  <header class="mast">
    <div>
      <div class="eyebrow">Momentum 360 · prospect radar</div>
      <h1>Who to build for</h1>
    </div>
    <div class="meta">
      ${esc(s.generated)}<br>
      ${num(s.total)} businesses tracked<br>
      ${num(s.new_today)} found today · ${num(s.graded_today)} re-graded
    </div>
  </header>

  <div class="decide">
    <div class="stat stat--act">
      <div class="stat__n">${num(s.build_queue_size)}</div>
      <div class="stat__l">Rebuild targets ready to brief</div>
    </div>
    <div class="stat stat--hold">
      <div class="stat__n">${num((s.needs_render || []).length)}</div>
      <div class="stat__l">Blocked on a render pass</div>
    </div>
    <div class="stat">
      <div class="stat__n">${num(s.mean_site_quality)}</div>
      <div class="stat__l">Mean site quality, graded set</div>
    </div>
    <div class="stat">
      <div class="stat__n">${num(s.due_now)}</div>
      <div class="stat__l">Due for a re-audit</div>
    </div>
  </div>

  <h2>Grade distribution</h2>
  <p class="note">Every graded prospect, worst on the left. <strong>Unconfirmed</strong> means the markup passed but nobody rendered the page — those are not decisions yet.</p>
  <div class="dist">
    ${bandOrder
      .filter((b) => (s.by_band?.[b] || 0) > 0)
      .map((b) => {
        const n = s.by_band[b];
        const pct = bandTotal > 0 ? (n / bandTotal) * 100 : 0;
        return `<div class="dist__seg" style="width:${pct.toFixed(2)}%;background:${BAND_COLORS[b]}" title="${esc(b)}: ${n}">${pct > 6 ? n : ''}</div>`;
      })
      .join('')}
  </div>
  <div class="dist__legend">
    ${bandOrder
      .filter((b) => (s.by_band?.[b] || 0) > 0)
      .map((b) => `<span><i style="background:${BAND_COLORS[b]}"></i>${esc(b)} ${s.by_band[b]}</span>`)
      .join('')}
  </div>

  <h2>Build queue</h2>
  <p class="note">Ranked by opportunity, weighted for the Philadelphia region. A declining score outranks a consistently poor one — a business whose site just got worse is a warmer call. Only these consume a build slot.</p>
  <div class="scroll">
    <table>
      <thead><tr>
        <th>#</th><th>Business</th><th>Their site</th><th>History</th><th>Trend</th><th>Priority</th><th>Worst fault</th>
      </tr></thead>
      <tbody>
        ${queue.length ? queue.map(queueRow).join('\n') : '<tr><td colspan="7" style="padding:20px;color:var(--fg-faint)">Nothing qualifies for a rebuild right now.</td></tr>'}
      </tbody>
    </table>
  </div>
  ${s.build_queue_size > queueLimit ? `<p class="note" style="margin-top:10px">Showing the top ${queueLimit} of ${s.build_queue_size}. Full set in the CSV.</p>` : ''}

  <div class="rails">
    <section>
      <h2>Coverage by county</h2>
      <p class="note">Philadelphia and the collar counties carry the local-proof advantage, so they are weighted highest in the ranking. Orange marks rebuild targets.</p>
      ${areaEntries.map(([k, v]) => coverageBar(k, v.total, v.rebuild, areaMax)).join('')}
    </section>

    <section>
      <h2>Coverage by vertical</h2>
      <p class="note">Home services, medical, and legal are the high-value verticals the shipped Philadelphia batch barely touched.</p>
      ${groupEntries.map(([k, v]) => coverageBar(k.replace(/-/g, ' '), v.total, v.rebuild, groupMax)).join('')}
    </section>
  </div>

  <div class="rails">
    <section>
      <h2>Sell them traffic, not a rebuild</h2>
      <p class="note">Their sites are good. Pitching a redesign burns credibility — these are Google Ads, local SEO, and GBP prospects.</p>
      <ul class="list">
        ${traffic.length
          ? traffic
              .map(
                (p) =>
                  `<li><a href="${esc(p.website)}" target="_blank" rel="noopener noreferrer">${esc(p.business_name)}</a><span class="n">${num(p.current?.sqs)} · ${esc(VERDICT_LABEL[p.current?.verdict] || '')}</span></li>`
              )
              .join('')
          : '<li><span class="n">None confirmed yet — needs a render pass.</span></li>'}
      </ul>
    </section>

    <section>
      <h2>Moved since last audit</h2>
      <p class="note">Sites that changed materially. A drop is an opening; a rise means pull them out of the queue before we pitch a redesign to someone who just bought one.</p>
      <ul class="list">
        ${movers.length
          ? movers
              .map(
                (p) =>
                  `<li><a href="${esc(p.website)}" target="_blank" rel="noopener noreferrer">${esc(p.business_name)}</a><span class="n">${p.trend_delta > 0 ? '+' : ''}${num(p.trend_delta)} → ${num(p.current?.sqs)}</span></li>`
              )
              .join('')
          : '<li><span class="n">No movement yet — trends appear once a prospect has two grades.</span></li>'}
      </ul>
    </section>
  </div>

  ${
    (s.needs_render || []).length
      ? `<div class="callout"><strong>${num((s.needs_render || []).length)} prospects are blocked on a render pass.</strong>
      Markup checks found no disqualifying fault, but nobody has seen the design — and source HTML cannot tell a beautifully art-directed site from a dated template.
      Until a Tier 1 audit runs, none of these can be cleared for a pitch or safely written off.</div>`
      : ''
  }

  <footer>
    Generated ${esc(s.generated)} by <span style="color:var(--fg-mid)">_os/automation/bin/radar-refresh.js</span>.
    Grades expire and re-audit on a per-verdict schedule. Nothing here is outbound-ready — a human approves every send.
  </footer>
</div>
`;
}

module.exports = { renderDashboard, BAND_COLORS, VERDICT_LABEL };
