'use strict';

/**
 * Renders the prospect radar as a single self-contained HTML page.
 *
 * This is a UI, not a document: it gets scanned at 7am to answer one question —
 * who do we build for today — so the summary comes before the detail and state
 * is encoded in form (stripe, chip, meter) as well as number.
 *
 * It used to be a report: six static sections showing the top 40 of a registry
 * that now holds 700 prospects and grows by ~200 a day. Everything below the
 * masthead is now driven by an embedded projection of the *whole* registry, so
 * the 333 `polish` prospects and the 144 rows blocked on a render are reachable
 * rather than merely counted.
 *
 * Design system is derived from the subject rather than applied to it: the score
 * scale IS the palette, running rust → orange → ochre → slate → teal, so a row's
 * colour is its grade. Trend colours come from the same scale's ends, which keeps
 * semantic colour and accent from fighting.
 *
 * **No external resources of any kind** — no font CDN, no image host, no script
 * `src`. There is exactly one inline script and one inline stylesheet, so the
 * page works from `file://` in the vault, from Netlify, and with no network at
 * all. That property is asserted in tests/radar.test.js and is the reason the
 * client code is embedded as a function body rather than fetched.
 */

const { DIMENSIONS } = require('./site-grader');
const { BRAND, TOKENS, cssVariables, lockup, LOCKUP_CSS } = require('./brand');

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

/** Queues, in the order they appear in the switcher. */
const QUEUES = [
  { key: 'rebuild', label: 'Rebuild', verdicts: ['rebuild'], sort: 'p', desc: 'Ranked by opportunity, weighted for Philadelphia. Only these consume a build slot.' },
  { key: 'verify', label: 'Needs render', verdicts: ['verify'], sort: 'lg', desc: 'Markup found no disqualifying fault, but nobody has seen the design. Not decisions yet.' },
  { key: 'polish', label: 'Polish', verdicts: ['polish'], sort: 'p', desc: 'Working sites with fixable gaps. A retainer or a paid tune-up, not a rebuild pitch.' },
  { key: 'traffic', label: 'Traffic', verdicts: ['ads_seo', 'nurture'], sort: 'q', desc: 'Sorted by site quality, best first. A genuinely good site means sell traffic, not a redesign.' },
  { key: 'enrich', label: 'Re-audit', verdicts: ['enrich'], sort: 'p', desc: 'Not enough signal to route. These need another pass before they mean anything.' },
  { key: 'all', label: 'Everything', verdicts: null, sort: 'p', desc: 'The whole registry. Search and filter to find anything the queues do not surface.' },
];

/** Evidence is stored as a code to keep the payload small. */
const EVIDENCE_LABEL = ['not measured', 'partial', 'measured'];
const EVIDENCE_CODE = { unknown: 0, partial: 1, measured: 2 };

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const num = (v, fallback = '—') => (Number.isFinite(Number(v)) ? String(Math.round(Number(v))) : fallback);

/**
 * Serialise for a `<script type="application/json">` island.
 *
 * JSON's own syntax contains no `<`, so escaping every `<` to `<` can only
 * ever touch string contents — and it is what stops a business literally named
 * `</script><img onerror=...>` from breaking out of the island. U+2028/2029 are
 * escaped because they are valid in JSON but terminate a JavaScript line.
 */
function jsonIsland(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

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
 * Project the registry into the compact row shape the client works with.
 *
 * Keys are short because there are 700 of these and every byte ships to a phone;
 * the mapping is documented here rather than inferred from the client code. This
 * function is pure and exported so tests can assert the round-trip without
 * parsing HTML.
 *
 * d domain · n name · w website · c city · a area/county · v vertical
 * g vertical group · q site quality · b band · r verdict · o opportunity
 * cf confidence · p priority · l lifecycle · t tier reached · pv provisional
 * lg last graded · nr next recheck · fs first seen · td times discovered
 * tr trend · tl trend delta · hp has phone · f faults · hl headline
 * of offer · na next action · dm dimensions [score, evidenceCode]
 * gh grade history [date, sqs, band]
 */
function projectRows(prospects) {
  return (prospects || []).map((p) => {
    const c = p.current || {};
    const dm = {};
    for (const [key, d] of Object.entries(c.dimensions || {})) {
      dm[key] = [Number.isFinite(Number(d?.score)) ? Math.round(Number(d.score)) : null, EVIDENCE_CODE[d?.evidence] ?? 0];
    }
    const row = {
      d: p.domain || '',
      n: p.business_name || p.domain || '',
      w: p.website || '',
      c: p.city || '',
      a: p.area || '',
      v: p.vertical || '',
      g: p.vertical_group || '',
      q: Number.isFinite(Number(c.sqs)) ? Math.round(Number(c.sqs)) : null,
      b: c.band || 'ungraded',
      r: c.verdict || '',
      o: Number.isFinite(Number(c.opportunity)) ? Math.round(Number(c.opportunity)) : null,
      cf: Number.isFinite(Number(c.confidence)) ? Math.round(Number(c.confidence) * 100) : null,
      p: Number.isFinite(Number(p.priority_score)) ? Math.round(Number(p.priority_score)) : 0,
      l: p.lifecycle || '',
      t: Number.isFinite(Number(c.tier)) ? Number(c.tier) : null,
      pv: c.provisional === true ? 1 : 0,
      lg: p.last_graded || '',
      nr: p.next_recheck || '',
      fs: p.first_seen || '',
      td: Number(p.times_discovered) || 0,
      tr: p.trend || '',
      tl: Number.isFinite(Number(p.trend_delta)) ? Number(p.trend_delta) : null,
      hp: p.has_phone ? 1 : 0,
      f: (p.top_faults || []).filter(Boolean),
      hl: p.headline || '',
      of: p.offer || '',
      na: p.next_action || '',
    };
    if (Object.keys(dm).length) row.dm = dm;
    const hist = (p.grades || []).filter((g) => g && g.date);
    if (hist.length) row.gh = hist.map((g) => [g.date, Number.isFinite(Number(g.sqs)) ? Math.round(Number(g.sqs)) : null, g.band || '']);
    return row;
  });
}

/** County × vertical counts, computed once server-side. */
function crossTab(rows) {
  const areas = new Map();
  const groups = new Map();
  const cells = new Map();
  for (const r of rows) {
    const a = r.a || 'unknown';
    const g = r.g || 'unknown';
    areas.set(a, (areas.get(a) || 0) + 1);
    groups.set(g, (groups.get(g) || 0) + 1);
    const k = `${a} ${g}`;
    const cur = cells.get(k) || { n: 0, rebuild: 0 };
    cur.n += 1;
    if (r.r === 'rebuild') cur.rebuild += 1;
    cells.set(k, cur);
  }
  const areaKeys = [...areas.entries()].sort((x, y) => y[1] - x[1]).map(([k]) => k);
  const groupKeys = [...groups.entries()].sort((x, y) => y[1] - x[1]).map(([k]) => k);
  return { areaKeys, groupKeys, areas, groups, cells };
}

/**
 * The gap worth naming in prose.
 *
 * A matrix shows you everything and therefore emphasises nothing. Philadelphia
 * is the stated priority for this pipeline, so the sentence that matters is the
 * one comparing it against whichever county the rotation has over-served.
 */
function coverageGap(ct) {
  const phl = ct.areas.get('Philadelphia') || 0;
  let biggest = null;
  for (const [k, v] of ct.areas) {
    if (k === 'Philadelphia') continue;
    if (!biggest || v > biggest[1]) biggest = [k, v];
  }
  const lines = [];
  if (phl && biggest && biggest[1] > phl) {
    lines.push(
      `<strong>${esc(biggest[0])} holds ${biggest[1]} rows against Philadelphia's ${phl}</strong> — coverage is running ` +
        `${(biggest[1] / phl).toFixed(1)}:1 away from the priority market. Point the next sweep at Philadelphia.`
    );
  } else if (phl && biggest) {
    lines.push(`Philadelphia leads coverage at ${phl} rows; ${esc(biggest[0])} is next at ${biggest[1]}.`);
  }
  const thinAreas = [...ct.areas.entries()].sort((a, b) => a[1] - b[1]).slice(0, 1);
  const thinGroups = [...ct.groups.entries()].sort((a, b) => a[1] - b[1]).slice(0, 1);
  if (thinAreas.length) lines.push(`Thinnest county: <strong>${esc(thinAreas[0][0])}</strong> at ${thinAreas[0][1]}.`);
  if (thinGroups.length) {
    lines.push(`Thinnest vertical: <strong>${esc(String(thinGroups[0][0]).replace(/-/g, ' '))}</strong> at ${thinGroups[0][1]}.`);
  }
  return lines.join(' ');
}

/**
 * Client-side behaviour.
 *
 * Written as a real function and emitted via `.toString()` so that template
 * literals and `${...}` inside it are JavaScript rather than something Node
 * interpolates on the way out. Nothing here closes over a Node value; every
 * input is read from the DOM.
 */
function clientScript() {
  var D = JSON.parse(document.getElementById('radar-rows').textContent);
  var ROWS = D.rows;
  var META = D.meta;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function n(v, f) { return v === null || v === undefined || v !== v ? (f === undefined ? '—' : f) : String(v); }

  var PAGE = 100;
  var state = {
    queue: META.queues[0].key,
    q: '',
    filters: { a: [], g: [], b: [], l: [], r: [] },
    sort: META.queues[0].sort,
    dir: 'desc',
    page: 1,
    open: null,
  };

  // ---- URL hash so a filtered view is a link someone can send -------------
  function writeHash(replace) {
    var parts = [];
    if (state.queue !== META.queues[0].key) parts.push('queue=' + state.queue);
    if (state.q) parts.push('q=' + encodeURIComponent(state.q));
    Object.keys(state.filters).forEach(function (k) {
      if (state.filters[k].length) parts.push(k + '=' + state.filters[k].map(encodeURIComponent).join('|'));
    });
    if (state.sort) parts.push('sort=' + state.sort + ':' + state.dir);
    if (state.open) parts.push('open=' + encodeURIComponent(state.open));
    var h = parts.length ? '#' + parts.join('&') : ' ';
    if (replace) history.replaceState(null, '', h); else history.replaceState(null, '', h);
  }
  function readHash() {
    var h = location.hash.replace(/^#/, '');
    if (!h) return;
    h.split('&').forEach(function (pair) {
      var i = pair.indexOf('=');
      if (i < 0) return;
      var k = pair.slice(0, i), v = decodeURIComponent(pair.slice(i + 1));
      if (k === 'queue') state.queue = v;
      else if (k === 'q') state.q = v;
      else if (k === 'open') state.open = v;
      else if (k === 'sort') { var s = v.split(':'); state.sort = s[0]; state.dir = s[1] === 'asc' ? 'asc' : 'desc'; }
      else if (state.filters[k]) state.filters[k] = v.split('|').map(decodeURIComponent).filter(Boolean);
    });
  }

  // ---- selection ----------------------------------------------------------
  function queueDef(key) {
    for (var i = 0; i < META.queues.length; i++) if (META.queues[i].key === key) return META.queues[i];
    return META.queues[0];
  }

  function matches(r) {
    var qd = queueDef(state.queue);
    if (qd.verdicts && qd.verdicts.indexOf(r.r) < 0) return false;
    var f = state.filters;
    if (f.a.length && f.a.indexOf(r.a) < 0) return false;
    if (f.g.length && f.g.indexOf(r.g) < 0) return false;
    if (f.b.length && f.b.indexOf(r.b) < 0) return false;
    if (f.l.length && f.l.indexOf(r.l) < 0) return false;
    if (f.r.length && f.r.indexOf(r.r) < 0) return false;
    if (state.q) {
      var hay = (r.n + ' ' + r.c + ' ' + r.a + ' ' + r.v + ' ' + r.g + ' ' + r.d).toLowerCase();
      var terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < terms.length; i++) if (hay.indexOf(terms[i]) < 0) return false;
    }
    return true;
  }

  function compare(a, b) {
    var k = state.sort, mul = state.dir === 'asc' ? 1 : -1;
    var av = a[k], bv = b[k];
    // Nulls always sink, whichever way the column is pointing: an ungraded row
    // is not "the worst site", it is an absence, and floating it to the top of a
    // worst-first sort would be a lie about the data.
    var an = av === null || av === undefined || av === '';
    var bn = bv === null || bv === undefined || bv === '';
    if (an && bn) return a.n.localeCompare(b.n);
    if (an) return 1;
    if (bn) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mul || a.n.localeCompare(b.n);
    return String(av).localeCompare(String(bv)) * mul || a.n.localeCompare(b.n);
  }

  function selected() { return ROWS.filter(matches).sort(compare); }

  // ---- rendering ----------------------------------------------------------
  function bandColor(b) { return META.bandColors[b] || 'var(--fg-faint)'; }

  function meterHtml(q, b) {
    if (q === null || q === undefined) return '<span class="meter meter--empty">not graded</span>';
    var s = Math.max(0, Math.min(100, q));
    return '<span class="meter" role="img" aria-label="site quality ' + s + ' of 100, ' + esc(b) + '">' +
      '<span class="meter__track"><span class="meter__fill" style="width:' + s + '%;background:' + bandColor(b) + '"></span></span>' +
      '<span class="meter__num">' + s + '</span></span>';
  }

  function trendHtml(r) {
    if (r.tr === 'declined') return '<span class="chip chip--down">▼ ' + Math.abs(r.tl) + '</span>';
    if (r.tr === 'improved') return '<span class="chip chip--up">▲ ' + r.tl + '</span>';
    if (r.tr === 'new') return '<span class="chip chip--new">new</span>';
    return '<span class="chip chip--flat">—</span>';
  }

  function sparkHtml(gh) {
    if (!gh || gh.length < 2) return '<span class="spark--none">·</span>';
    var pts = gh.map(function (g) { return g[1]; }).filter(function (v) { return v !== null; });
    if (pts.length < 2) return '<span class="spark--none">·</span>';
    var w = 54, h = 18, min = Math.min.apply(null, pts), max = Math.max.apply(null, pts), span = (max - min) || 1;
    var co = pts.map(function (v, i) {
      return [(i / (pts.length - 1)) * (w - 2) + 1, h - 1 - ((v - min) / span) * (h - 2)];
    });
    var d = co.map(function (c, i) { return (i ? 'L' : 'M') + c[0].toFixed(1) + ' ' + c[1].toFixed(1); }).join(' ');
    var delta = pts[pts.length - 1] - pts[0];
    var stroke = delta <= -8 ? 'var(--s-decayed)' : delta >= 8 ? 'var(--s-strong)' : 'var(--fg-faint)';
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="grade history">' +
      '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="1.4"/></svg>';
  }

  function rowHtml(r, i) {
    var where = [r.c, r.a && r.a !== r.c ? r.a : ''].filter(Boolean).join(' · ');
    var open = state.open === r.d;
    return '<tr class="row' + (open ? ' row--open' : '') + '" data-d="' + esc(r.d) + '" tabindex="0" aria-expanded="' + open + '">' +
      '<td class="c-rank">' + (i + 1) + '</td>' +
      '<td class="c-biz"><span class="biz">' + esc(r.n) + '</span>' +
        '<span class="sub">' + esc(r.v || r.g) + (where ? ' · ' + esc(where) : '') + '</span></td>' +
      '<td class="c-score">' + meterHtml(r.q, r.b) + '</td>' +
      '<td class="c-spark">' + sparkHtml(r.gh) + '</td>' +
      '<td class="c-trend">' + trendHtml(r) + '</td>' +
      '<td class="c-prio"><strong>' + n(r.p) + '</strong></td>' +
      '<td class="c-why">' + esc((r.f && r.f[0]) || r.hl || '') + '</td>' +
    '</tr>';
  }

  function dimsHtml(r) {
    if (!r.dm) {
      return '<p class="det__none">No dimension breakdown stored for this grade. It predates the breakdown, or the audit never completed.</p>';
    }
    var out = '';
    META.dimensions.forEach(function (dim) {
      var v = r.dm[dim.key];
      if (!v) return;
      var score = v[0], ev = v[1];
      var evLabel = META.evidence[ev];
      out += '<div class="dim' + (ev === 0 ? ' dim--unknown' : '') + '">' +
        '<div class="dim__head"><span class="dim__label" title="' + esc(dim.about) + '">' + esc(dim.label) + '</span>' +
          '<span class="dim__ev">' + esc(evLabel) + ' · weight ' + dim.weight + '</span>' +
          '<span class="dim__n">' + (score === null ? '—' : score) + '</span></div>' +
        '<div class="dim__track"><div class="dim__fill" style="width:' + (score === null ? 0 : Math.max(0, Math.min(100, score))) +
          '%;background:' + (ev === 0 ? 'var(--fg-faint)' : bandColor(r.b)) + '"></div></div>' +
      '</div>';
    });
    return out || '<p class="det__none">No dimension breakdown stored.</p>';
  }

  function detailHtml(r) {
    var maps = 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent([r.n, r.c, r.a].filter(Boolean).join(' '));
    var facts = [
      ['Verdict', META.verdictLabel[r.r] || r.r || '—'],
      ['Opportunity', n(r.o)],
      ['Confidence', r.cf === null ? '—' : r.cf + '%'],
      ['Tier reached', r.t === null ? '—' : r.t + (r.t === 0 ? ' (markup only)' : ' (rendered)')],
      ['Lifecycle', r.l || '—'],
      ['Last graded', r.lg || 'never'],
      ['Next re-audit', r.nr || '—'],
      ['First seen', r.fs || '—'],
      ['Times discovered', n(r.td)],
      ['Phone on file', r.hp ? 'yes' : 'no'],
    ];
    var faults = (r.f || []).length
      ? '<ul class="det__faults">' + r.f.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>'
      : '<p class="det__none">No faults recorded.</p>';
    var hist = (r.gh || []).length
      ? '<ul class="det__hist">' + r.gh.slice().reverse().map(function (g) {
          return '<li><span class="det__date">' + esc(g[0]) + '</span><span class="det__band" style="color:' + bandColor(g[2]) + '">' +
            esc(g[2]) + '</span><span class="det__sqs">' + (g[1] === null ? '—' : g[1]) + '</span></li>';
        }).join('') + '</ul>'
      : '<p class="det__none">Graded once. A trend needs two.</p>';

    return '<tr class="det" data-det="' + esc(r.d) + '"><td colspan="7"><div class="det__in">' +
      '<div class="det__col">' +
        '<h3>Why this score</h3>' +
        (r.pv ? '<p class="det__warn">Provisional — this grade rests on markup alone and is capped. It is not a decision.</p>' : '') +
        dimsHtml(r) +
      '</div>' +
      '<div class="det__col">' +
        '<h3>Faults found</h3>' + faults +
        '<h3>Grade history</h3>' + hist +
      '</div>' +
      '<div class="det__col">' +
        '<h3>Read</h3>' +
        (r.hl ? '<p class="det__head">' + esc(r.hl) + '</p>' : '') +
        (r.of ? '<p><span class="det__k">Offer</span> ' + esc(r.of) + '</p>' : '') +
        (r.na ? '<p><span class="det__k">Next</span> ' + esc(r.na) + '</p>' : '') +
        '<dl class="det__facts">' + facts.map(function (f) {
          return '<dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd>';
        }).join('') + '</dl>' +
        '<p class="det__links">' +
          (r.w ? '<a href="' + esc(r.w) + '" target="_blank" rel="noopener noreferrer">their site ↗</a> ' : '') +
          '<a href="' + esc(maps) + '" target="_blank" rel="noopener noreferrer">maps ↗</a>' +
        '</p>' +
      '</div>' +
    '</div></td></tr>';
  }

  function render() {
    var rows = selected();
    var qd = queueDef(state.queue);
    var total = rows.length;
    var shown = Math.min(total, state.page * PAGE);
    var body = '';
    if (!total) {
      body = '<tr><td colspan="7" class="empty">' +
        (state.q || anyFilter()
          ? 'Nothing matches. <button type="button" class="linkish" data-act="clear">Clear the filters</button> to see all ' + ROWS.length + '.'
          : 'This queue is empty.') +
        '</td></tr>';
    } else {
      for (var i = 0; i < shown; i++) {
        body += rowHtml(rows[i], i);
        if (state.open === rows[i].d) body += detailHtml(rows[i]);
      }
    }
    $('#tbody').innerHTML = body;
    $('#qdesc').textContent = qd.desc;
    $('#count').textContent = total === ROWS.length
      ? total + ' prospects'
      : total + ' of ' + ROWS.length + ' prospects';
    $('#more').hidden = shown >= total;
    $('#more').textContent = 'Show ' + Math.min(PAGE, total - shown) + ' more (' + (total - shown) + ' hidden)';
    $('#showall').hidden = shown >= total;

    $$('.qtab').forEach(function (b) {
      var on = b.dataset.queue === state.queue;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $$('.fchip').forEach(function (b) {
      var on = state.filters[b.dataset.k].indexOf(b.dataset.v) >= 0;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    $$('th[data-sort]').forEach(function (th) {
      th.setAttribute('aria-sort', th.dataset.sort === state.sort
        ? (state.dir === 'asc' ? 'ascending' : 'descending') : 'none');
    });
    $('#clear').hidden = !(state.q || anyFilter());
    writeHash();
  }

  function anyFilter() {
    return Object.keys(state.filters).some(function (k) { return state.filters[k].length; });
  }

  // ---- CSV of exactly what is on screen -----------------------------------
  function csvCell(v) {
    var s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function exportCsv() {
    var cols = [
      ['priority', 'p'], ['business', 'n'], ['website', 'w'], ['site_quality', 'q'], ['band', 'b'],
      ['verdict', 'r'], ['opportunity', 'o'], ['confidence_pct', 'cf'], ['vertical', 'v'], ['group', 'g'],
      ['city', 'c'], ['county', 'a'], ['lifecycle', 'l'], ['tier', 't'], ['last_graded', 'lg'],
      ['next_recheck', 'nr'], ['has_phone', 'hp'], ['worst_fault', null], ['next_action', 'na'],
    ];
    var rows = selected();
    var out = [cols.map(function (c) { return c[0]; }).join(',')];
    rows.forEach(function (r) {
      out.push(cols.map(function (c) {
        return csvCell(c[1] === null ? (r.f && r.f[0]) || '' : r[c[1]]);
      }).join(','));
    });
    var blob = new Blob([out.join('\n')], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'radar-' + state.queue + '-' + META.generated + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  // ---- events -------------------------------------------------------------
  function toggleOpen(d) {
    state.open = state.open === d ? null : d;
    render();
    if (state.open) {
      var el = $('tr[data-d="' + CSS.escape(state.open) + '"]');
      if (el) el.focus();
    }
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var tab = t.closest ? t.closest('.qtab') : null;
    if (tab) {
      state.queue = tab.dataset.queue;
      state.sort = queueDef(state.queue).sort;
      state.dir = 'desc';
      state.page = 1;
      state.open = null;
      render();
      return;
    }
    var chip = t.closest ? t.closest('.fchip') : null;
    if (chip) {
      var arr = state.filters[chip.dataset.k];
      var i = arr.indexOf(chip.dataset.v);
      if (i >= 0) arr.splice(i, 1); else arr.push(chip.dataset.v);
      state.page = 1;
      render();
      return;
    }
    var th = t.closest ? t.closest('th[data-sort]') : null;
    if (th) {
      if (state.sort === th.dataset.sort) state.dir = state.dir === 'desc' ? 'asc' : 'desc';
      else { state.sort = th.dataset.sort; state.dir = th.dataset.sort === 'n' ? 'asc' : 'desc'; }
      render();
      return;
    }
    if (t.closest && t.closest('#more')) { state.page += 1; render(); return; }
    if (t.closest && t.closest('#showall')) { state.page = Math.ceil(ROWS.length / PAGE) + 1; render(); return; }
    if (t.closest && t.closest('#csv')) { exportCsv(); return; }
    if (t.dataset && t.dataset.act === 'clear') { clearAll(); return; }
    if (t.closest && t.closest('#clear')) { clearAll(); return; }
    if (t.closest && t.closest('a')) return;
    var row = t.closest ? t.closest('tr.row') : null;
    if (row) toggleOpen(row.dataset.d);
  });

  function clearAll() {
    state.q = '';
    $('#search').value = '';
    Object.keys(state.filters).forEach(function (k) { state.filters[k] = []; });
    state.page = 1;
    render();
  }

  var searchTimer = null;
  $('#search').addEventListener('input', function (e) {
    var v = e.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { state.q = v; state.page = 1; render(); }, 120);
  });

  document.addEventListener('keydown', function (e) {
    var inField = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (e.key === '/' && !inField) { e.preventDefault(); $('#search').focus(); $('#search').select(); return; }
    if (e.key === 'Escape') {
      if (inField) { document.activeElement.blur(); return; }
      if (state.open) { state.open = null; render(); return; }
      if (state.q || anyFilter()) clearAll();
      return;
    }
    if (inField) return;
    if (e.key === 'j' || e.key === 'k') {
      e.preventDefault();
      var rows = $$('tr.row');
      if (!rows.length) return;
      var cur = rows.indexOf(document.activeElement.closest ? document.activeElement.closest('tr.row') : null);
      var next = e.key === 'j' ? Math.min(rows.length - 1, cur + 1) : Math.max(0, cur - 1);
      if (cur < 0) next = 0;
      rows[next].focus();
      return;
    }
    if (e.key === 'Enter') {
      var row = document.activeElement.closest ? document.activeElement.closest('tr.row') : null;
      if (row) { e.preventDefault(); toggleOpen(row.dataset.d); }
    }
  });

  readHash();
  if (state.q) $('#search').value = state.q;
  render();
}

/**
 * @param {object} summary  radar.summarize() output
 * @param {object} opts     { queueLimit, run, maxBytes }
 */
function renderDashboard(summary, opts = {}) {
  const s = summary;
  const prospects = s.prospects || [];
  const rows = projectRows(prospects);
  const movers = (s.movers || []).slice(0, 8);
  const run = opts.run || null;

  const areaEntries = Object.entries(s.by_area || {}).sort((a, b) => b[1].total - a[1].total);
  const areaMax = Math.max(1, ...areaEntries.map(([, v]) => v.total));
  const groupEntries = Object.entries(s.by_vertical_group || {}).sort((a, b) => b[1].rebuild - a[1].rebuild);
  const groupMax = Math.max(1, ...groupEntries.map(([, v]) => v.total));

  const bandOrder = ['broken', 'decayed', 'dated', 'unconfirmed', 'strong', 'elite'];
  const bandTotal = bandOrder.reduce((t, b) => t + (s.by_band?.[b] || 0), 0);

  const ct = crossTab(rows);
  const cellMax = Math.max(1, ...[...ct.cells.values()].map((c) => c.n));

  // Queue counts come from the projected rows so the tab numbers can never
  // disagree with what clicking the tab actually shows.
  const queueCounts = {};
  for (const q of QUEUES) {
    queueCounts[q.key] = q.verdicts ? rows.filter((r) => q.verdicts.includes(r.r)).length : rows.length;
  }

  const lifecycleOrder = ['new', 'graded', 'queued_build', 'built', 'mailed', 'client', 'excluded'];
  const lifecycle = s.lifecycle || {};
  // A zero is only a stall if work has actually reached this far. `new: 0` means
  // everything discovered has been graded — that is flow, not a blockage — so
  // flagging it red would point at the one stage that is working.
  let upstream = 0;
  const funnel = lifecycleOrder
    .filter((k) => k !== 'excluded')
    .map((k) => {
      const n = lifecycle[k] || 0;
      const stalled = n === 0 && upstream > 0;
      upstream = Math.max(upstream, n);
      return { k, n, stalled };
    });
  const funnelMax = Math.max(1, ...funnel.map((f) => f.n), s.total || 1);

  const graded = Number(s.graded) || 0;
  const ungraded = Number(s.ungraded) || 0;
  const gradedPct = s.total ? Math.round((graded / s.total) * 100) : 0;

  const filterFacets = [
    { k: 'a', label: 'County', values: ct.areaKeys },
    { k: 'g', label: 'Vertical', values: ct.groupKeys },
    { k: 'b', label: 'Band', values: bandOrder.filter((b) => rows.some((r) => r.b === b)) },
    { k: 'l', label: 'Lifecycle', values: lifecycleOrder.filter((l) => rows.some((r) => r.l === l)) },
  ];

  const payload = {
    meta: {
      generated: s.generated || '',
      queues: QUEUES.map((q) => ({ key: q.key, label: q.label, verdicts: q.verdicts, sort: q.sort, desc: q.desc })),
      bandColors: BAND_COLORS,
      verdictLabel: VERDICT_LABEL,
      evidence: EVIDENCE_LABEL,
      dimensions: Object.entries(DIMENSIONS).map(([key, d]) => ({
        key,
        label: d.label,
        about: d.about,
        weight: d.weight,
      })),
    },
    rows,
  };

  const html = `<title>Prospect Radar — NeedMomentum</title>
<meta name="robots" content="noindex,nofollow">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- This page names hundreds of real businesses next to a judgement about their
     website. It is an internal worksheet and must never be indexed, whatever
     host it ends up on. lib/netlify.js refuses to publish it without this. -->
<style>
  /* Brand tokens come from lib/brand.js — measured from the NeedMomentum mark
     and WCAG-checked there, so this file never hand-picks a colour. Legacy
     aliases keep older selectors pointing at the new names. */
  ${cssVariables()}
  :root { --bg-panel: var(--panel); --bg-sunk: var(--sunk); --accent: var(--brand-ink); }
  ${LOCKUP_CSS}

  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--fg);
    font-family: var(--sans);
    font-size: 15px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  /* Depth without an image: two brand-tinted pools bleeding in from the top
     corners — blue from the left, gold from the right — over a flat base. Fixed,
     so it reads as a lit field the content sits on rather than something that
     scrolls with the table. */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: -1;
    background:
      radial-gradient(1150px 660px at 2% -12%, var(--field-blue), transparent 66%),
      radial-gradient(1050px 620px at 100% 2%, var(--field-gold), transparent 64%),
      radial-gradient(780px 540px at 46% 110%, var(--field-blue), transparent 70%);
  }
  /* A whisper of grain over the gradients. Large flat washes band on cheap
     panels; the texture breaks the ramp up without reading as a pattern. */
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: -1;
    opacity: .5;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.035'/%3E%3C/svg%3E");
  }

  /* Motion is opt-out, and every transform below is disabled wholesale for
     anyone who asked for less of it. */
  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; animation: none !important; }
    .stat:hover, .qtab:hover, tr.row:hover, .fchip:hover, .btn:hover { transform: none !important; }
  }
  .wrap { max-width: 1280px; margin: 0 auto; padding: 0 24px 88px; }
  a { color: var(--brand-ink); text-decoration-thickness: 1px; text-underline-offset: 2px; }
  a:focus-visible, [tabindex]:focus-visible, button:focus-visible { outline: 2px solid var(--brand-ink); outline-offset: 2px; border-radius: 3px; }
  button { font: inherit; color: inherit; }

  /* Brand bar: the lockup sits on its own rule above the page title, so the
     agency identity reads first and the working title reads second. */
  .topbar { border-bottom: 1px solid var(--rule); padding: 18px 0 14px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .topbar .spacer { flex: 1; }
  .topbar__meta { font-family: var(--mono); font-size: 11.5px; color: var(--fg-faint); text-align: right; line-height: 1.6; }
  .topbar__meta b { color: var(--fg-mid); font-weight: 500; }

  /* Masthead — a ledger heading, not a hero. */
  .mast { padding: 26px 0 16px; display: flex; flex-wrap: wrap; align-items: flex-end; gap: 10px 24px; }
  .mast h1 { font-family: var(--display); font-size: clamp(28px, 4vw, 40px); font-weight: 700; letter-spacing: -0.028em; margin: 0; text-wrap: balance; line-height: 1.05; }
  .mast h1 em { font-style: normal; color: var(--brand-ink); }
  .mast .lede { color: var(--fg-mid); font-size: 14px; max-width: 54ch; margin: 8px 0 0; }
  .eyebrow { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--brand-ink); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .eyebrow::before { content: ''; width: 22px; height: 2px; background: linear-gradient(90deg, var(--brand), var(--gold)); flex: none; border-radius: 999px; }

  /* Run health: silence here is how a broken sweep went unnoticed for a week. */
  .health { display: flex; flex-wrap: wrap; align-items: center; gap: 7px 18px; margin: 20px 0 0; padding: 11px 15px;
    border: 1px solid var(--rule); border-left: 3px solid var(--s-strong); border-radius: 8px;
    background: var(--panel); font-family: var(--mono); font-size: 11.5px; color: var(--fg-mid); }
  .health--bad { border-left-color: var(--s-broken); background: color-mix(in srgb, var(--s-broken) 6%, var(--panel)); }
  .health__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--s-strong); display: inline-block; flex: none; }
  .health--bad .health__dot { background: var(--s-broken); }
  .health__state { font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; font-size: 10px; color: var(--s-strong); }
  .health--bad .health__state { color: var(--s-broken); }
  .health__err { color: var(--s-broken); flex-basis: 100%; }

  /* The four numbers that decide the morning. Cards, not a fused strip — each
     one is a separate claim and reads better with air around it. */
  .decide { display: grid; grid-template-columns: repeat(auto-fit, minmax(168px, 1fr)); gap: 12px; margin: 22px 0 10px; perspective: 900px; }
  .stat { background: var(--panel); padding: 16px 18px 15px; border: 1px solid var(--rule); border-radius: 10px; position: relative; overflow: hidden;
    transform-style: preserve-3d; will-change: transform;
    transition: transform .28s cubic-bezier(.2,.7,.3,1), box-shadow .28s ease, border-color .28s ease; }
  /* Tilt away from the viewer's cursor side and lift — the shadow is what sells
     it, so it grows with the rotation rather than being a constant drop. */
  .stat:hover { transform: translateY(-4px) rotateX(6deg) scale(1.014);
    box-shadow: 0 16px 34px -14px rgba(8,14,22,.55), 0 3px 10px -4px rgba(8,14,22,.3);
    border-color: var(--brand); }
  .stat:hover .stat__n { transform: translateZ(14px); }
  .stat__n, .stat__l { transition: transform .28s cubic-bezier(.2,.7,.3,1); }
  .stat:hover .stat__l { transform: translateZ(6px); }
  .stat::after { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0;
    background: linear-gradient(115deg, transparent 38%, var(--gold-wash) 50%, transparent 62%);
    transition: opacity .32s ease; }
  .stat:hover::after { opacity: 1; }
  .stat::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 3px; background: var(--fg-faint); }
  .stat__n { font-family: var(--display); font-size: 34px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1; letter-spacing: -0.035em; }
  .stat__l { font-size: 12.5px; color: var(--fg-mid); margin-top: 6px; line-height: 1.35; }
  .stat--act::before { background: var(--s-decayed); }
  .stat--act .stat__n { color: var(--s-decayed); }
  .stat--hold::before { background: var(--s-unconfirmed); }
  .stat--hold .stat__n { color: var(--s-unconfirmed); }
  .stat--brand::before { background: var(--brand); }
  .stat--brand .stat__n { color: var(--brand-ink); }

  h2 { font-family: var(--display); font-size: 21px; font-weight: 700; margin: 46px 0 5px; letter-spacing: -0.022em; }
  h3 { font-family: var(--mono); font-size: 10px; letter-spacing: 0.11em; text-transform: uppercase; color: var(--fg-faint); margin: 0 0 9px; font-weight: 500; }
  .note { color: var(--fg-mid); font-size: 13.5px; margin: 0 0 16px; max-width: 78ch; }
  .note strong { color: var(--fg); }

  .dist { display: flex; height: 32px; border-radius: 8px; overflow: hidden; }
  .dist__seg { display: flex; align-items: center; justify-content: center; font-family: var(--mono); font-size: 11px; color: #fff; min-width: 0; }
  .dist__legend { display: flex; flex-wrap: wrap; gap: 4px 18px; margin-top: 8px; font-family: var(--mono); font-size: 11.5px; color: var(--fg-mid); }
  .dist__legend i { display: inline-block; width: 9px; height: 9px; border-radius: 2px; margin-right: 6px; }

  /* ---- Workbench --------------------------------------------------------- */
  /* The panel is one continuous surface: tabs, controls and table share a card
     so the whole thing reads as a single instrument rather than stacked blocks. */
  .work { background: var(--panel); border: 1px solid var(--rule); border-radius: 12px; overflow: hidden;
    box-shadow: 0 24px 50px -30px rgba(8,14,22,.5), 0 2px 6px -3px rgba(8,14,22,.18); position: relative; }
  .work::before { content: ''; position: absolute; inset: 0 0 auto 0; height: 2px; z-index: 3;
    background: linear-gradient(90deg, var(--brand) 0%, var(--brand) 34%, var(--gold) 72%, var(--gold) 100%); }
  .tabs { display: flex; flex-wrap: wrap; gap: 2px; padding: 8px 10px 0; background: var(--sunk); border-bottom: 1px solid var(--rule); }
  .qtab { background: none; border: 0; border-radius: 7px 7px 0 0; padding: 9px 15px; cursor: pointer;
    font-size: 13.5px; color: var(--fg-mid); position: relative; }
  .qtab b { font-family: var(--mono); font-variant-numeric: tabular-nums; margin-left: 8px; font-weight: 400; color: var(--fg-faint); font-size: 12px; }
  .qtab { transition: background .2s ease, color .2s ease, transform .2s cubic-bezier(.2,.7,.3,1); }
  .qtab[aria-selected="true"] { background: var(--panel); color: var(--fg); font-weight: 600;
    box-shadow: inset 0 2px 0 var(--gold), 0 -6px 16px -10px rgba(8,14,22,.5); }
  .qtab[aria-selected="true"] b { color: var(--brand-ink); }
  .qtab:hover:not([aria-selected="true"]) { color: var(--fg); background: var(--brand-wash); transform: translateY(-2px); }

  .bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; padding: 14px 16px 12px; }
  .search { flex: 1 1 280px; min-width: 200px; padding: 9px 12px 9px 34px; background: var(--sunk); color: var(--fg);
    border: 1px solid var(--rule-strong); border-radius: 8px; font-size: 14px; font-family: var(--sans);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237A8798' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='M20 20l-4.3-4.3'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: 10px center; background-size: 15px; }
  .search:focus { border-color: var(--brand); outline: none; box-shadow: 0 0 0 3px var(--brand-wash); }
  .search::placeholder { color: var(--fg-faint); }
  .bar__n { font-family: var(--mono); font-size: 12.5px; color: var(--fg-mid); font-variant-numeric: tabular-nums; }
  .btn { background: var(--sunk); border: 1px solid var(--rule-strong); border-radius: 8px; padding: 8px 13px; cursor: pointer; font-size: 12.5px; color: var(--fg-mid);
    transition: transform .16s cubic-bezier(.2,.7,.3,1), box-shadow .16s ease, border-color .16s ease, color .16s ease; }
  .btn:hover { border-color: var(--brand); color: var(--fg); transform: translateY(-2px); box-shadow: 0 8px 18px -10px rgba(8,14,22,.5); }
  .btn:active { transform: translateY(0); box-shadow: none; }
  /* The one gold call-to-action on the page. Gold is a fill with ink on it,
     which is the only way it clears contrast. */
  .btn--brand { background: var(--gold); border-color: var(--gold); color: var(--on-gold); font-weight: 650; }
  .btn--brand:hover { filter: brightness(1.06); color: var(--on-gold); box-shadow: 0 8px 20px -8px rgba(255,198,59,.5); }
  .linkish { background: none; border: 0; color: var(--brand-ink); cursor: pointer; text-decoration: underline; padding: 0; font-size: inherit; }

  .facets { display: flex; flex-direction: column; gap: 7px; padding: 0 16px 14px; }
  .facet { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
  .facet__l { font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.11em; text-transform: uppercase; color: var(--fg-faint); width: 66px; flex: none; }
  .fchip { background: none; border: 1px solid var(--rule); border-radius: 999px; color: var(--fg-mid); padding: 3px 11px; font-size: 12px; cursor: pointer;
    transition: transform .16s cubic-bezier(.2,.7,.3,1), background .16s ease, border-color .16s ease, color .16s ease; }
  .fchip:hover { border-color: var(--brand); color: var(--fg); transform: translateY(-1px); }
  .fchip[aria-pressed="true"] { background: var(--brand-fill); border-color: var(--brand-fill); color: var(--on-brand); font-weight: 550;
    box-shadow: 0 4px 12px -5px rgba(42,128,194,.7); }

  /* What this queue means, sitting on the seam between controls and data. */
  .qdesc { margin: 0; padding: 11px 16px; font-size: 12.5px; color: var(--fg-mid);
    background: var(--brand-wash); border-top: 1px solid var(--rule); }
  .scroll { overflow-x: auto; border: 1px solid var(--rule); border-radius: 10px; background: var(--panel); }
  .work .scroll { border: 0; border-radius: 0; }
  table { border-collapse: collapse; width: 100%; font-size: 13.5px; }
  thead th { position: sticky; top: 0; z-index: 2; background: var(--sunk); text-align: left; font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.11em; text-transform: uppercase; color: var(--fg-faint); padding: 10px 12px; border-bottom: 1px solid var(--rule); white-space: nowrap; font-weight: 500; }
  th[data-sort] { cursor: pointer; user-select: none; }
  th[data-sort]:hover { color: var(--brand-ink); }
  th[data-sort]::after { content: ' ↕'; opacity: 0.28; }
  th[aria-sort="descending"]::after { content: ' ↓'; opacity: 1; color: var(--brand-ink); }
  th[aria-sort="ascending"]::after { content: ' ↑'; opacity: 1; color: var(--brand-ink); }
  tbody td { padding: 10px 12px; border-bottom: 1px solid var(--rule); vertical-align: middle; }
  tr.row { cursor: pointer; transition: transform .18s cubic-bezier(.2,.7,.3,1); }
  tr.row td { transition: background .18s ease, box-shadow .18s ease; }
  tr.row:hover td { background: var(--brand-wash); }
  /* Nudge, not a leap: a row is 40px tall and anything larger turns a scan
     down the list into a wobble. */
  tr.row:hover { transform: translateX(3px); }
  tr.row:hover td:first-child { box-shadow: inset 3px 0 0 var(--gold); }
  tr.row--open td { background: var(--brand-wash); box-shadow: inset 3px 0 0 var(--brand); }
  .c-rank { font-family: var(--mono); color: var(--fg-faint); font-size: 11.5px; width: 38px; font-variant-numeric: tabular-nums; }
  .c-biz .biz { font-weight: 600; letter-spacing: -0.008em; }
  tr.row:hover .c-biz .biz { color: var(--brand-ink); }
  .c-biz .sub { display: block; font-size: 11px; color: var(--fg-faint); font-family: var(--mono); margin-top: 2px; }
  .c-prio { font-family: var(--mono); font-variant-numeric: tabular-nums; text-align: right; width: 66px; }
  .c-prio strong { font-size: 14px; font-weight: 600; }
  .c-why { color: var(--fg-mid); font-size: 12.5px; max-width: 34ch; }
  .c-spark { width: 60px; } .c-trend { width: 64px; } .c-score { width: 138px; }
  .empty { padding: 34px 14px; color: var(--fg-faint); text-align: center; }

  .meter { display: flex; align-items: center; gap: 9px; }
  .meter__track { flex: 1; height: 6px; background: var(--sunk); border-radius: 999px; min-width: 56px; overflow: hidden; }
  .meter__fill { display: block; height: 100%; border-radius: 999px; }
  .meter__num { font-family: var(--mono); font-size: 13px; font-variant-numeric: tabular-nums; width: 22px; text-align: right; font-weight: 500; }
  .meter--empty { font-family: var(--mono); font-size: 11px; color: var(--fg-faint); }
  .spark { display: block; } .spark--none { color: var(--fg-faint); font-family: var(--mono); }

  .chip { font-family: var(--mono); font-size: 10.5px; padding: 2px 7px; border: 1px solid currentColor; border-radius: 999px; white-space: nowrap; }
  .chip--down { color: var(--s-decayed); } .chip--up { color: var(--s-strong); }
  .chip--flat, .chip--new { color: var(--fg-faint); }

  /* ---- Detail drawer ----------------------------------------------------- */
  .det td { background: var(--sunk); padding: 0; box-shadow: inset 3px 0 0 var(--brand); }
  .det__in { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 28px; padding: 20px 18px 22px; }
  .det__col p { margin: 0 0 8px; font-size: 13px; color: var(--fg-mid); }
  .det__head { color: var(--fg) !important; font-size: 13.5px !important; }
  .det__k { font-family: var(--mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--fg-faint); margin-right: 5px; }
  .det__warn { color: var(--s-dated) !important; font-size: 12.5px !important; }
  .det__none { color: var(--fg-faint) !important; font-size: 12.5px !important; font-style: italic; }
  .det__faults { margin: 0 0 4px; padding-left: 17px; font-size: 12.5px; color: var(--fg-mid); }
  .det__faults li { margin-bottom: 3px; }
  .det__hist { list-style: none; margin: 0; padding: 0; font-family: var(--mono); font-size: 12px; }
  .det__hist li { display: flex; gap: 10px; padding: 3px 0; border-bottom: 1px solid var(--rule); }
  .det__date { color: var(--fg-mid); } .det__band { flex: 1; } .det__sqs { font-variant-numeric: tabular-nums; }
  .det__facts { display: grid; grid-template-columns: auto 1fr; gap: 2px 12px; margin: 8px 0 10px; font-size: 12.5px; }
  .det__facts dt { font-family: var(--mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-faint); align-self: center; }
  .det__facts dd { margin: 0; color: var(--fg-mid); }
  .det__links a { font-family: var(--mono); font-size: 12px; margin-right: 12px; }

  .dim { margin-bottom: 9px; }
  .dim__head { display: flex; align-items: baseline; gap: 8px; font-size: 12.5px; }
  .dim__label { font-weight: 550; }
  .dim__ev { font-family: var(--mono); font-size: 10.5px; color: var(--fg-faint); margin-left: auto; }
  .dim__n { font-family: var(--mono); font-variant-numeric: tabular-nums; width: 24px; text-align: right; }
  .dim__track { height: 6px; background: var(--bg); border-radius: 999px; margin-top: 4px; overflow: hidden; }
  .dim__fill { height: 100%; border-radius: 999px; }
  .dim--unknown .dim__label, .dim--unknown .dim__n { color: var(--fg-faint); }
  .dim--unknown .dim__fill { opacity: 0.3; background-image: repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(128,128,128,.6) 3px, rgba(128,128,128,.6) 6px); }

  /* ---- Matrix ------------------------------------------------------------ */
  .mx { width: auto; font-size: 12.5px; }
  .mx th { position: static; text-transform: none; letter-spacing: 0; font-size: 11px; }
  .mx thead th { text-align: center; }
  .mx tbody th { text-align: left; font-family: var(--sans); font-size: 12.5px; color: var(--fg); background: none; border-bottom: 1px solid var(--rule); padding: 6px 10px 6px 0; white-space: nowrap; }
  .mx td { text-align: center; padding: 0; border-bottom: 1px solid var(--rule); }
  .mx__c { display: block; padding: 8px 5px; font-family: var(--mono); font-variant-numeric: tabular-nums; min-width: 54px; position: relative; border-radius: 4px; }
  .mx__c i { position: absolute; inset: auto 0 0 0; height: 2px; background: var(--s-decayed); border-radius: 999px; }
  .mx__z { color: var(--fg-faint); }

  .rails { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 34px; }
  .cov { margin-bottom: 12px; }
  .cov__head { display: flex; justify-content: space-between; align-items: baseline; font-size: 13px; gap: 10px; }
  .cov__n { font-family: var(--mono); font-variant-numeric: tabular-nums; font-size: 12.5px; }
  .cov__sub { color: var(--fg-faint); }
  .cov__track { position: relative; height: 7px; background: var(--sunk); border-radius: 999px; margin-top: 6px; overflow: hidden; }
  .cov__fill { position: absolute; inset: 0 auto 0 0; background: var(--brand); opacity: 0.34; }
  .cov__mark { position: absolute; inset: 0 auto 0 0; background: var(--s-decayed); }

  /* ---- Funnel ------------------------------------------------------------ */
  .fun { list-style: none; margin: 0; padding: 0; }
  .fun li { display: grid; grid-template-columns: 110px 1fr 52px; gap: 12px; align-items: center; padding: 5px 0; }
  .fun__l { font-size: 13px; }
  .fun__t { height: 10px; background: var(--sunk); border-radius: 999px; position: relative; overflow: hidden; }
  .fun__f { position: absolute; inset: 0 auto 0 0; background: var(--brand); border-radius: 999px; }
  .fun__n { font-family: var(--mono); font-variant-numeric: tabular-nums; text-align: right; font-size: 13px; }
  .fun li.stall .fun__n { color: var(--s-broken); }

  .list { list-style: none; padding: 0; margin: 0; }
  .list li { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid var(--rule); font-size: 13.5px; }
  .list li:last-child { border-bottom: 0; }
  .list .n { font-family: var(--mono); font-variant-numeric: tabular-nums; color: var(--fg-mid); font-size: 12.5px; white-space: nowrap; }
  /* nowrap keeps a score chip on one line; an empty-state sentence in the same
     slot must be allowed to wrap or it drags the whole page sideways on a phone. */
  .list .n--wrap { white-space: normal; }
  .list a { text-decoration: none; } .list a:hover { text-decoration: underline; }

  .callout { border: 1px solid var(--rule); border-left: 3px solid var(--s-unconfirmed); border-radius: 8px; background: var(--panel); padding: 14px 17px; margin: 18px 0; font-size: 13.5px; color: var(--fg-mid); }
  .callout strong { color: var(--fg); }
  .keys { font-family: var(--mono); font-size: 11.5px; color: var(--fg-faint); margin-top: 10px; }
  .keys kbd { border: 1px solid var(--rule); border-radius: 4px; padding: 1px 5px; background: var(--panel); }
  footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid var(--rule); font-size: 11.5px; color: var(--fg-faint);
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  footer span { flex: 1; min-width: 240px; max-width: 78ch; line-height: 1.6; }
  footer code { font-family: var(--mono); color: var(--fg-mid); }
  footer .lock__word { font-size: 13px; }

  @media (max-width: 720px) {
    .c-spark, .c-why { display: none; }
    .wrap { padding: 20px 14px 60px; }
    .facet__l { width: 100%; }
    .mast .meta { margin-left: 0; text-align: left; }
  }

  /* Print: Mac wants one link, and a page that prints cleanly is the fallback. */
  @media print {
    :root { --bg: #fff; --panel: #fff; --sunk: #f6f8fa; --bg-panel: #fff; --bg-sunk: #f6f8fa; --fg: #000; --fg-mid: #333; --fg-faint: #666; --rule: #ccc; --rule-strong: #999; --brand-wash: transparent; }
    .tabs, .bar, .facets, #more, #showall, .keys { display: none !important; }
    .scroll { overflow: visible; border: 0; }
    thead th { position: static; }
    tr.row { page-break-inside: avoid; }
    .wrap { max-width: none; padding: 0; }
    a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 9px; color: #666; word-break: break-all; }
  }
</style>

<div class="wrap">
  <div class="topbar">
    ${lockup({ size: 30, subtitle: 'Prospect Radar' })}
    <span class="spacer"></span>
    <div class="topbar__meta">
      <b>${esc(s.generated)}</b> · ${num(s.total)} tracked<br>
      ${num(s.new_today)} found today · ${num(s.graded_today)} re-graded
    </div>
  </div>

  <header class="mast">
    <div>
      <div class="eyebrow">Philadelphia metro · site quality</div>
      <h1>Who to build for <em>today</em></h1>
      <p class="lede">Two numbers per business: how good their site already is, and whether it is worth a build slot. A great site is a traffic pitch, not a redesign.</p>
    </div>
  </header>
${run ? healthStrip(run) : ''}
  <div class="decide">
    <div class="stat stat--act">
      <div class="stat__n">${num(s.build_queue_size)}</div>
      <div class="stat__l">Rebuild targets ready to brief</div>
    </div>
    <div class="stat stat--hold">
      <div class="stat__n">${num((s.needs_render || []).length)}</div>
      <div class="stat__l">Blocked on a render pass</div>
    </div>
    <div class="stat stat--brand">
      <div class="stat__n">${num(s.mean_site_quality)}</div>
      <div class="stat__l">Mean site quality, graded set</div>
    </div>
    <div class="stat">
      <div class="stat__n">${num(s.due_now)}</div>
      <div class="stat__l">Due for a re-audit</div>
    </div>
  </div>

  <h2>The registry</h2>
  <p class="note">All ${num(s.total)} tracked businesses. Pick a queue, filter it, click any row to see why it scored what it scored. Every number below is from the last audit of that specific site — nothing is modelled or inferred.</p>

  <div class="work">
    <div class="tabs" role="tablist" aria-label="Prospect queues">
      ${QUEUES.map(
        (q, i) =>
          `<button type="button" class="qtab" role="tab" data-queue="${esc(q.key)}" aria-selected="${i === 0}">${esc(q.label)}<b>${queueCounts[q.key]}</b></button>`
      ).join('')}
    </div>

    <div class="bar">
      <input id="search" class="search" type="search" placeholder="Search name, city, county, vertical, domain…" aria-label="Search prospects" autocomplete="off">
      <span class="bar__n" id="count" aria-live="polite">${rows.length} prospects</span>
      <button type="button" class="btn" id="clear" hidden>Clear filters</button>
      <button type="button" class="btn btn--brand" id="csv">Export CSV</button>
    </div>

    <div class="facets">
      ${filterFacets
        .filter((f) => f.values.length > 1)
        .map(
          (f) => `<div class="facet"><span class="facet__l">${esc(f.label)}</span>${f.values
            .map(
              (v) =>
                `<button type="button" class="fchip" data-k="${esc(f.k)}" data-v="${esc(v)}" aria-pressed="false">${esc(String(v).replace(/-/g, ' ').replace(/_/g, ' '))}</button>`
            )
            .join('')}</div>`
        )
        .join('')}
    </div>

    <p class="qdesc" id="qdesc">${esc(QUEUES[0].desc)}</p>

    <div class="scroll">
      <table>
        <thead><tr>
          <th>#</th>
          <th data-sort="n">Business</th>
          <th data-sort="q">Their site</th>
          <th>History</th>
          <th data-sort="tl">Trend</th>
          <th data-sort="p">Priority</th>
          <th data-sort="lg">Worst fault</th>
        </tr></thead>
        <tbody id="tbody">
          <tr><td colspan="7" class="empty">Loading ${rows.length} prospects…</td></tr>
        </tbody>
      </table>
    </div>
    <div class="bar">
      <button type="button" class="btn" id="more" hidden>Show more</button>
      <button type="button" class="btn" id="showall" hidden>Show all</button>
      <span class="spacer" style="flex:1"></span>
      <span class="keys" style="margin:0">
        <kbd>/</kbd> search · <kbd>j</kbd><kbd>k</kbd> move · <kbd>Enter</kbd> expand · <kbd>Esc</kbd> close
      </span>
    </div>
  </div>

  ${
    (s.needs_render || []).length
      ? `<div class="callout"><strong>${num((s.needs_render || []).length)} prospects are blocked on a render pass.</strong>
      Markup checks found no disqualifying fault, but nobody has seen the design — and source HTML cannot tell a beautifully art-directed site from a dated template.
      Until a Tier 1 audit runs, none of these can be cleared for a pitch or safely written off.</div>`
      : ''
  }

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

  <h2>Where the coverage is thin</h2>
  <p class="note">${coverageGap(ct)} Cell shading is prospect count; the orange rule under a cell is its rebuild rate. Thin cells are where to point tomorrow's sweep.</p>
  <div class="scroll">
    <table class="mx">
      <thead><tr><th></th>${ct.groupKeys.map((g) => `<th>${esc(String(g).replace(/-/g, ' '))}</th>`).join('')}<th>all</th></tr></thead>
      <tbody>
        ${ct.areaKeys
          .map((a) => {
            const tds = ct.groupKeys
              .map((g) => {
                const cell = ct.cells.get(`${a} ${g}`) || { n: 0, rebuild: 0 };
                const shade = cell.n > 0 ? 0.08 + (cell.n / cellMax) * 0.5 : 0;
                const rr = cell.n > 0 ? (cell.rebuild / cell.n) * 100 : 0;
                return `<td><span class="mx__c${cell.n ? '' : ' mx__z'}" style="background:rgba(76,107,138,${shade.toFixed(2)})" title="${esc(a)} · ${esc(g)}: ${cell.n} prospects, ${cell.rebuild} rebuild">${cell.n || '·'}${cell.n ? `<i style="width:${rr.toFixed(0)}%"></i>` : ''}</span></td>`;
              })
              .join('');
            return `<tr><th>${esc(a)}</th>${tds}<td><span class="mx__c"><strong>${ct.areas.get(a)}</strong></span></td></tr>`;
          })
          .join('')}
        <tr><th>all</th>${ct.groupKeys.map((g) => `<td><span class="mx__c"><strong>${ct.groups.get(g)}</strong></span></td>`).join('')}<td><span class="mx__c"><strong>${rows.length}</strong></span></td></tr>
      </tbody>
    </table>
  </div>
  <p class="note" style="margin-top:12px">
    <strong>${gradedPct}% graded</strong> — ${num(graded)} audited, ${num(ungraded)} never audited, ${num(s.due_now)} past their re-audit date.
  </p>

  <div class="rails">
    <section>
      <h2>Pipeline</h2>
      <p class="note">Where work actually stops. A number that never leaves one row is the constraint, not a statistic.</p>
      <ul class="fun">
        ${funnel
          .map(
            (f) =>
              `<li${f.stalled ? ' class="stall"' : ''}><span class="fun__l">${esc(f.k.replace(/_/g, ' '))}</span>` +
              `<span class="fun__t"><span class="fun__f" style="width:${((f.n / funnelMax) * 100).toFixed(1)}%"></span></span>` +
              `<span class="fun__n">${f.n}</span></li>`
          )
          .join('')}
      </ul>
      ${
        (lifecycle.built || 0) === 0 && (lifecycle.queued_build || 0) > 0
          ? `<p class="note" style="margin-top:10px"><strong>${lifecycle.queued_build} briefed, none built.</strong> Everything upstream is working; the constraint is entirely at the build step.</p>`
          : ''
      }
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
          : '<li><span class="n n--wrap">No movement yet — trends appear once a prospect has two grades.</span></li>'}
      </ul>
    </section>
  </div>

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

  <footer>
    ${lockup({ size: 22 })}
    <span>Generated ${esc(s.generated)} by <code>_os/automation/bin/radar-refresh.js</code>.
    Grades expire and re-audit on a per-verdict schedule. Nothing here is outbound-ready — a human approves every send.</span>
  </footer>
</div>

<script type="application/json" id="radar-rows">${jsonIsland(payload)}</script>
<script>${String(clientScript).replace(/<\/script/gi, '<\\/script')}
clientScript();</script>
`;

  // A registry that grows until the page is unopenable should fail loudly at
  // generation, not silently at 7am on a phone.
  const maxBytes = opts.maxBytes || 1_500_000;
  const bytes = Buffer.byteLength(html, 'utf8');
  if (bytes > maxBytes) {
    throw new Error(
      `dashboard is ${(bytes / 1e6).toFixed(2)}MB, over the ${(maxBytes / 1e6).toFixed(2)}MB limit — ` +
        `${rows.length} prospects. Trim projectRows() or paginate server-side before shipping this.`
    );
  }
  return html;
}

/** Last sweep, rendered so a failure is impossible to scroll past. */
function healthStrip(run) {
  const bad = run.status && run.status !== 'ok';
  const r = run.run || {};
  const bits = [
    run.date ? `last sweep ${esc(run.date)}` : '',
    run.rotation_slot ? `slot ${esc(run.rotation_slot)}` : '',
    `+${num(r.discovered_new, '0')} new`,
    `${num(r.regraded, '0')} re-graded`,
    `${num(r.enriched, '0')} enriched`,
  ].filter(Boolean);
  const errors = (run.errors || []).slice(0, 3);
  return `  <div class="health${bad ? ' health--bad' : ''}">
    <span class="health__dot" aria-hidden="true"></span>
    <span>${bad ? 'SWEEP FAILED' : 'sweep ok'}</span>
    ${bits.map((b) => `<span>${b}</span>`).join('')}
    ${errors.map((e) => `<span class="health__err">${esc(e)}</span>`).join('')}
  </div>
`;
}

module.exports = { renderDashboard, projectRows, crossTab, BAND_COLORS, VERDICT_LABEL, QUEUES };
