// Single source of truth: geometry + content -> renderer-agnostic scene graph.
// Consumed by render-pptx.js (PowerPoint) and render-html.js (visual QA preview).
// Copy is transcribed verbatim from the original WCK_Win_Story deck.
const path = require("path");
const ASSETS = path.join(__dirname, "..", "assets");

const NAVY = "0F2138";
const INK = "3A4756";
const SLIDEBG = "EEF1F5";

const metrics = [
  ["EMPLOYEES", "350 FTE + 2K Surge"],
  ["SECTOR", "Nonprofit / Humanitarian"],
  ["COUNTRIES", "24 Nations"],
  ["COMPETITION", "Lavasource & PwC"],
  ["REPLACING", "BambooHR + Airtable"],
  ["DEAL VALUE", "$424,375"],
];

const columns = [
  {
    title: "CLIENT CHALLENGES", sub: "Why WCK Needed a New Platform",
    hbg: "1E3A5F", fill: "EDF3FB", border: "2E4C7E", tcolor: "1E3A6B",
    cards: [
      { t: "Fragmented Systems, No Single Source of Truth",
        b: "WCK operated across BambooHR, Airtable, Gmail-based approvals, and A3innuva with no unified HR platform -- creating data gaps, manual errors, and compliance exposure across 24 countries and multiple entity structures." },
      { t: "Surge Workforce Complexity at Global Scale",
        b: "800-2,000 relief contractors mobilized on short notice across 18+ nations. Field offices in Jordan, Ukraine, Egypt, and Israel each operated independently with no scalable onboarding infrastructure or centralized visibility." },
      { t: "Aggressive Jan 1 Go-Live with Day 1 Finance Integration",
        b: "A hard January 1 go-live date required simultaneous Sage Intacct integration from day one -- leaving zero runway for a phased finance cutover. Bilingual (EN/ES) delivery was also required from the start." },
    ],
  },
  {
    title: "WHY ALIGN HCM + DAYFORCE?", sub: "What Differentiated the Pursuit",
    hbg: "E0652F", fill: "FDF2EA", border: "E2682F", tcolor: "C85A28",
    cards: [
      { t: "Purpose-Built RC Surge Onboarding Model",
        b: "Align designed a scalable Relief Contractor onboarding workflow built for humanitarian surge operations -- bilingual, field-deployable, and configured for multi-country compliance from day one. No other bidder offered this." },
      { t: "Mission Alignment + Give-Back Commitment",
        b: "\"Align HCM has clearly done its homework on WCK's complexity... The RC surge onboarding model, bilingual delivery, Sage Intacct Day 1 integration, and the mission give-back commitment all stood out.\" -- Adam Reusing, WCK" },
      { t: "Sage Intacct Day 1 Integration Expertise",
        b: "Align's proven Sage Intacct integration capability directly resolved WCK's highest-risk requirement. Paired with bilingual delivery, Align was the only vendor that could credibly commit to the full scope on the Jan 1 timeline." },
    ],
  },
  {
    title: "SALES CYCLE IMPACT", sub: "How Align HCM Won the Room",
    hbg: "1F7A48", fill: "EAF4EE", border: "2A7C50", tcolor: "1B7343",
    cards: [
      { t: "Beat PwC (Big 4) and Lavasource",
        b: "Align competed head-to-head against a Big 4 consulting firm and a specialized HCM implementation partner. WCK selected Align HCM based on operational depth, mission alignment, and superior proposal specificity." },
      { t: "8+ Co-Authoring Sessions Built Unmatched Trust",
        b: "Align and WCK co-developed a detailed Implementation Solutions Design and Statement of Work across 8+ working sessions. WCK had line-by-line ownership of scope, timeline, and deliverables -- a depth of collaboration no competitor came close to replicating." },
      { t: "Contracting & Pricing Flexibility Closed the Deal",
        b: "Align demonstrated flexibility on both commercial terms and rate structure Willingness to adapt without compromising delivery quality sealed the partnership." },
    ],
  },
];

function buildScene() {
  const W = 13.333, H = 7.5;
  const el = [];
  const CARD_X = 0.30, CARD_Y = 0.30, CARD_W = 12.733, CARD_H = 6.90, CARD_R = 0.14;
  const HDR_H = 1.10, MB_H = 0.58;
  const PAD = 0.32;
  const LX = CARD_X + PAD;
  const RIGHT = CARD_X + CARD_W - PAD;

  el.push({ type: "roundRect", x: CARD_X, y: CARD_Y, w: CARD_W, h: CARD_H, r: CARD_R, fill: "FFFFFF", shadow: true });
  el.push({ type: "roundRect", x: CARD_X, y: CARD_Y, w: CARD_W, h: HDR_H, r: CARD_R, fill: NAVY });
  el.push({ type: "rect", x: CARD_X, y: CARD_Y + CARD_R, w: CARD_W, h: HDR_H - CARD_R, fill: NAVY });

  // Client logo (World Central Kitchen), left; subtitle to its right, both vertically centered
  const wckH = 0.72, wckW = wckH * 1.76;
  el.push({ type: "image", path: path.join(ASSETS, "wck_logo.png"), x: LX, y: CARD_Y + (HDR_H - wckH) / 2, w: wckW, h: wckH });
  el.push({ type: "text", x: LX + wckW + 0.30, y: CARD_Y, w: 6.0, h: HDR_H, align: "left", valign: "middle",
    runs: [{ text: "Dayforce Full-Suite Implementation   |   Nonprofit   |   Global Humanitarian", size: 10.5, italic: true, color: "C7D2E0" }] });

  // vendor logos (right), transparent, with WIN STORY pill centered above
  const dfW = 1.227, dfH = dfW / 4.091, alH = 0.46, alW = alH * 2.346, vgap = 0.32;
  const rowCenter = 1.00;
  const dfX = RIGHT - dfW;
  const alX = dfX - vgap - alW;
  el.push({ type: "image", path: path.join(ASSETS, "align_logo.png"), x: alX, y: rowCenter - alH / 2, w: alW, h: alH });
  el.push({ type: "image", path: path.join(ASSETS, "dayforce_logo.png"), x: dfX, y: rowCenter - dfH / 2, w: dfW, h: dfH });
  const pillW = 1.02, pillH = 0.24;
  const pillX = (alX + dfX + dfW) / 2 - pillW / 2;
  el.push({ type: "roundRect", x: pillX, y: 0.42, w: pillW, h: pillH, r: 0.05, fill: "E0652F" });
  el.push({ type: "text", x: pillX, y: 0.42, w: pillW, h: pillH, align: "center", valign: "middle",
    runs: [{ text: "WIN STORY", size: 8.5, bold: true, color: "FFFFFF", cs: 1 }] });

  // metric bar
  const MB_Y = CARD_Y + HDR_H;
  el.push({ type: "rect", x: CARD_X, y: MB_Y, w: CARD_W, h: MB_H, fill: "EAEFF5" });
  const mW = CARD_W / metrics.length;
  metrics.forEach((m, i) => {
    const cx = CARD_X + mW * i;
    if (i > 0) el.push({ type: "line", x: cx, y: MB_Y + 0.13, w: 0, h: MB_H - 0.26, color: "D5DDE7", width: 0.75 });
    el.push({ type: "text", x: cx, y: MB_Y + 0.08, w: mW, h: 0.20, align: "center", valign: "middle",
      runs: [{ text: m[0], size: 8, bold: true, color: "6E7B8C", cs: 1.2 }] });
    el.push({ type: "text", x: cx, y: MB_Y + 0.28, w: mW, h: 0.26, align: "center", valign: "middle",
      runs: [{ text: m[1], size: 11.5, bold: true, color: NAVY }] });
  });

  // columns
  const COLS_Y = MB_Y + MB_H + 0.16;
  const CH_H = 0.56, GAP = 0.24;
  const COL_W = (CARD_W - 2 * PAD - 2 * GAP) / 3;
  const CARDS_Y = COLS_Y + CH_H + 0.12;
  const CARDS_BOTTOM = CARD_Y + CARD_H - 0.16;
  const CARD_GAP = 0.11, N = 3;
  const cardH = (CARDS_BOTTOM - CARDS_Y - (N - 1) * CARD_GAP) / N;
  const IP = 0.14;

  columns.forEach((col, ci) => {
    const x = LX + ci * (COL_W + GAP);
    el.push({ type: "roundRect", x, y: COLS_Y, w: COL_W, h: CH_H, r: 0.06, fill: col.hbg });
    el.push({ type: "text", x, y: COLS_Y + 0.05, w: COL_W, h: 0.30, align: "center", valign: "middle",
      runs: [{ text: col.title, size: 11.5, bold: true, color: "FFFFFF", cs: 0.6 }] });
    el.push({ type: "text", x, y: COLS_Y + 0.31, w: COL_W, h: 0.22, align: "center", valign: "middle",
      runs: [{ text: col.sub, size: 8.5, italic: true, color: "FFFFFF" }] });
    col.cards.forEach((c, ri) => {
      const cy = CARDS_Y + ri * (cardH + CARD_GAP);
      el.push({ type: "roundRect", x, y: cy, w: COL_W, h: cardH, r: 0.055, fill: col.fill, line: { color: col.border, width: 1 } });
      const runs = [
        { text: c.t, size: 10.5, bold: true, color: col.tcolor, br: true, spAfter: 4 },
        { text: c.b, size: 9, color: INK },
      ];
      el.push({ type: "text", x: x + IP, y: cy + 0.10, w: COL_W - 2 * IP, h: cardH - 0.19, align: "left", valign: "top", lh: 0.98, runs });
    });
  });

  return { W, H, bg: SLIDEBG, el };
}

module.exports = { buildScene };
