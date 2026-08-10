import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import * as CONFIG from "../src/config.mjs";

const { SITES, ORDER } = CONFIG;
const META = CONFIG.META ?? {
  labTitle: "Scroll Lab — Next Ten Cinematic Builds",
  labHeading: "Ten worlds,<br />one grammar.",
  labLede: "Builds 169–178 of the Prospect Radar. Each homepage is a composited scroll world — a synthetic cinematic plate, business-specific 3D choreography, and editorial stills sharing one camera. Concept work only: every page carries its own source boundary.",
  labPath: "/labs/prospect-3d-scroll-next10/",
  labBackLabel: "Scroll Lab",
};

/*
  Renders the ten prospect pages plus the lab index from src/config.mjs.
  The generated HTML is committed: the repo's convention is that pages are
  reviewable artifacts, not build ephemera. Copy lives in the config; this
  file owns only structure.
*/

const root = resolve(import.meta.dirname, "..");
const esc = (s) => String(s).replace(/&(?![a-z]+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&lt;br \/&gt;/g, "<br />");

const favicon = (spec) => "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${spec.bg}"/><circle cx="16" cy="16" r="10.5" fill="none" stroke="${spec.accent}" stroke-width="2"/><text x="16" y="20.5" text-anchor="middle" font-family="Arial Narrow, sans-serif" font-size="11" font-weight="700" fill="${spec.accent}">${spec.initials}</text></svg>`
);

function chapterSection(ch, index, spec) {
  const side = index % 2 ? "chapter-right" : "chapter-left";
  const id = `ch-${index}`;
  let extra = "";
  if (ch.ledger) {
    extra = `<dl class="material-ledger">${ch.ledger.map(([dt, dd]) => `<div><dt>${esc(dt)}</dt><dd>${esc(dd)}</dd></div>`).join("")}</dl>`;
  } else if (ch.list) {
    extra = `<ul class="detail-list">${ch.list.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>`;
  } else if (ch.cta) {
    extra = `<a class="primary-action" href="${ch.cta[1]}" target="_blank" rel="noopener">${esc(ch.cta[0])}</a>`;
  } else {
    extra = `<blockquote>Visual confidence should sharpen the next question — not disguise what still needs verification.</blockquote>`;
  }
  const visual = index === 1
    ? `\n        <figure class="chapter-visual chapter-visual-macro" data-reveal="fade" aria-label="Synthetic concept plate: process detail for ${esc(spec.name)}">
          <div></div><figcaption><span>02 / Process</span><strong>${esc(spec.panels[0].meta)}</strong></figcaption>
        </figure>`
    : index === 2
      ? `\n        <figure class="chapter-visual chapter-visual-material chapter-visual-surface" data-reveal="fade" aria-label="Synthetic concept plate: material study for ${esc(spec.name)}">
          <div></div><figcaption><span>03 / Material</span><strong>${esc(spec.panels[1].meta)}</strong></figcaption>
        </figure>`
      : "";
  return `      <section class="chapter ${side}" id="${id}" data-scene-state="${esc(ch.state)}" aria-labelledby="${id}-title">
        <div class="chapter-copy">
          <span class="chapter-step">${esc(ch.step)}</span>
          <h2 id="${id}-title">${esc(ch.title)}</h2>
          <p>${esc(ch.body)}</p>
          ${extra}
        </div>${visual}
      </section>`;
}

/* Optional per-brand type system: spec.fonts = { display: {family, file},
   text: {family, file} }. Emits sites/<slug>/site.css with @font-face and the
   two font vars; pages without spec.fonts keep the batch defaults. */
function renderSiteCss(spec) {
  if (!spec.fonts) return null;
  const face = (f) => `@font-face { font-family: "${f.family}"; src: url("${f.file}") format("woff2"); font-weight: ${f.weightRange ?? "100 900"}; font-display: swap; }`;
  return [
    face(spec.fonts.display),
    face(spec.fonts.text),
    `:root { --font-display: "${spec.fonts.display.family}", "Arial Narrow", sans-serif; --font-text: "${spec.fonts.text.family}", "Segoe UI", sans-serif; }`,
    "",
  ].join("\n");
}

/* Optional long-form sections rendered between the sequence band and the
   measures strip: services (dl), area (prose), faq (h3+p pairs). All static,
   fully visible without JS, and word-count carriers for the 1,100-1,700 target. */
function extraSections(c, spec) {
  const parts = [];
  if (c.services?.items?.length) {
    parts.push(`      <section class="index-band services-band" aria-labelledby="services-title">
        <header>
          <span data-reveal="up">${esc(c.services.kicker ?? "What this covers")}</span>
          <h2 id="services-title">${esc(c.services.heading)}</h2>
          <p data-reveal="up" style="--d:1">${esc(c.services.lede ?? "")}</p>
        </header>
        <div class="index-grid">
${c.services.items.map(([t, b], i) => `          <article class="index-card" data-reveal="up" style="--d:${i % 3}">
            <b>${String(i + 1).padStart(2, "0")}</b>
            <h3>${esc(t)}</h3>
            <p>${esc(b)}</p>
          </article>`).join("\n")}
        </div>
      </section>`);
  }
  if (c.area?.body) {
    parts.push(`      <section class="brief-panel area-panel" aria-labelledby="area-title">
        <div><h2 id="area-title">${esc(c.area.heading)}</h2></div>
        <div>
${(Array.isArray(c.area.body) ? c.area.body : [c.area.body]).map((p, i) => `          <p data-reveal="up" style="--d:${i}">${esc(p)}</p>`).join("\n")}
        </div>
      </section>`);
  }
  if (c.faq?.items?.length) {
    parts.push(`      <section class="brief-panel faq-panel" aria-labelledby="faq-title">
        <div><h2 id="faq-title">${esc(c.faq.heading ?? "Questions worth asking first.")}</h2></div>
        <div class="faq-list">
${c.faq.items.map(([q, a], i) => `          <div class="faq-item" data-reveal="up" style="--d:${i % 4}">
            <h3>${esc(q)}</h3>
            <p>${esc(a)}</p>
          </div>`).join("\n")}
        </div>
      </section>`);
  }
  return parts.join("\n\n");
}

/* Verified contact actions (tel/directions/site) — only what the evidence
   ledger verified reaches this array; the generator renders whatever it gets. */
function contactActions(c) {
  const links = [...(c.contact ?? []), ...c.verify.links];
  const seen = new Set();
  return links.filter(([t, u]) => !seen.has(u) && seen.add(u))
    .map(([t, u]) => `<a href="${u}"${u.startsWith("tel:") ? "" : ' target="_blank" rel="noopener"'}>${esc(t)}</a>`).join("");
}

function renderSite(slug) {
  const spec = SITES[slug];
  const c = spec.copy;
  const railNames = c.chapters.map((ch) => ch.step);
  const bodyVars = [
    `--accent:${spec.accent}`, `--accent-strong:${spec.accent2}`, `--accent2:${spec.accent2}`,
    `--plate:url(${spec.plates.hero})`, `--plate-mobile:url(${spec.plates.hero900})`,
    `--macro:url(${spec.plates.macro})`, `--material:url(${spec.plates.material})`,
    `--plate-position:64% 42%`, `background:${spec.bg}`
  ].join(";");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <link rel="icon" href="${favicon(spec)}" />
    <meta name="theme-color" content="${spec.bg}" />
    <meta name="description" content="A private cinematic scroll concept for ${esc(spec.name)}." />
    <title>${esc(spec.name)} — Cinematic Scroll Concept</title>
    <script type="module" src="/src/site.js"></script>${spec.fonts ? `\n    <link rel="stylesheet" href="/sites/${slug}/site.css" />` : ""}
  </head>
  <body data-site="${slug}" style="${bodyVars}">
    <!--
      THESIS: One composited world per business — plate, geometry, and editorial stills share a single camera.
      FACTS: name and locale verified from the radar brief; everything else stays a question for the business.
      IMAGES: synthetic concept plates from the momentum-next10 image system; disclosed on-page, never presented as photography.
      FINISH: unreviewed and undocumented is unfinished; this build ends with QA receipts and KAGE-REBUILD notes.
    -->
    <a class="skip-link" href="#story">Skip to content</a>

    <header class="site-header">
      <a class="brand-lockup" href="/sites/${slug}/" aria-label="${esc(spec.name)} concept home">
        <span class="brand-coin" aria-hidden="true">${esc(spec.initials)}</span>
        <span class="brand-name">${esc(spec.lockup[0])}<b><i>${esc(spec.lockup[1])}</i> · concept mark</b></span>
      </a>
      <nav aria-label="Primary navigation"><a href="#sequence">Sequence</a><a href="#verify">Source</a></nav>
      <a class="lab-back" href="${META.labPath}">Build ${spec.build} <span>${esc(META.labBackLabel)}</span></a>
    </header>

    <div class="scene-stage" aria-hidden="true">
      <div class="scene-plate"></div>
      <canvas id="scene-canvas"></canvas>
      <div class="panel-anchors"></div>
      <div class="scene-scrim"></div>
      <div class="scene-foreground"></div>
      <div class="film-grain"></div>
      <div class="scene-hud">
        <span class="hud-axis hud-axis-x"></span><span class="hud-axis hud-axis-y"></span>
        <div class="hud-reticle"><i></i></div>
      </div>
    </div>
    <div class="scene-fallback" role="img" aria-label="${esc(spec.heroAlt)}"></div>
    <div class="progress-rail" aria-hidden="true"><span></span></div>
    <dl class="data-strip" aria-hidden="true">
      <div><dt>Chapters</dt><dd>04</dd></div>
      <div><dt>Lens</dt><dd>${esc(spec.lens)}</dd></div>
      <div><dt>Subject</dt><dd>${esc(spec.vertical)}</dd></div>
      <div><dt>State</dt><dd><b id="scene-state">${esc(spec.states[0])}</b></dd></div>
      <div class="strip-beat"><dt>Beat</dt><dd id="scene-beat">01</dd></div>
    </dl>
    <ol class="chapter-rail" aria-hidden="true">${railNames.map((n, i) => `<li${i === 0 ? ' class="is-on"' : ""}><span>${esc(n)}</span><i></i></li>`).join("")}</ol>

    <main id="story">
      <section class="hero-panel" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="hero-context">${esc(c.context)}</p>
          <h1 id="page-title">${esc(c.h1)}</h1>
          <div class="hero-actions"><a class="primary-action" href="#sequence">Walk the sequence</a><a class="secondary-action" href="${spec.copy.verify.links[0][1]}" target="_blank" rel="noopener">Business source</a></div>
        </div>
        <p class="hero-wordmark" aria-hidden="true">${esc(spec.verb)}</p>
        <div class="verb-chip" aria-hidden="true"><span>${esc(spec.city)}</span><strong>${esc(spec.verb)}</strong></div>
        <div class="hero-inset" data-reveal="scale"><span class="inset-index">03 / 03</span><span>Material study</span><strong>${esc(spec.panels[1].meta)}</strong><i aria-hidden="true"></i></div>
        <a class="scroll-cue" href="#ch-0"><span>Scroll to ${esc(spec.verb.toLowerCase())}</span><i aria-hidden="true"></i></a>
      </section>

${c.chapters.map((ch, i) => chapterSection(ch, i, spec)).join("\n\n")}

      <section class="final-frame" data-reveal="fade" aria-label="Synthetic concept plate revisited as the closing frame">
        <div class="final-frame-image" role="img" aria-label="${esc(spec.heroAlt)}"></div>
        <p><span>${esc(spec.verb)} / Closing frame</span><strong>${esc(c.h1)}</strong></p>
      </section>

      <section class="index-band" aria-labelledby="sequence-title" id="sequence">
        <header>
          <span data-reveal="up">The sequence</span>
          <h2 id="sequence-title">${esc(c.sequence.heading)}</h2>
          <p data-reveal="up" style="--d:1">${esc(c.sequence.lede)}</p>
        </header>
        <div class="index-grid">
${c.sequence.cards.map(([n, t, b], i) => `          <article class="index-card" data-reveal="up" style="--d:${i % 3}">
            <b>${n}</b>
            <h3>${esc(t)}</h3>
            <p>${esc(b)}</p>
          </article>`).join("\n")}
        </div>
      </section>

${extraSections(c, spec)}

      <dl class="measures" aria-label="How this concept page was built">
        <div data-reveal="up"><dt>Chapters</dt><dd>04<small>Directed camera beats across one continuous world.</small></dd></div>
        <div data-reveal="up" style="--d:1"><dt>Plates</dt><dd>03<small>Synthetic concept images, each placed more than once.</small></dd></div>
        <div data-reveal="up" style="--d:2"><dt>Focal length</dt><dd>${esc(spec.lens)}<small>The working lens this sequence was framed on.</small></dd></div>
        <div data-reveal="up" style="--d:3"><dt>Stock photos</dt><dd>0<small>Nothing here is presented as the business's photography.</small></dd></div>
      </dl>

      <section class="brief-panel" aria-labelledby="brief-title">
        <div><h2 id="brief-title">What we would confirm before building the real thing.</h2></div>
        <div>
${c.brief.map((par, i) => `          <p data-reveal="up" style="--d:${i}">${esc(par)}</p>`).join("\n")}
          <p class="brief-note" data-reveal="up" style="--d:2">${esc(c.note)}</p>
        </div>
      </section>

      <section class="verification-panel" data-reveal="up" id="verify" aria-labelledby="verify-title">
        <div><span>Source boundary</span><h2 id="verify-title">The name is real. The imagery is synthetic.</h2></div>
        <p>${esc(spec.name)} — ${esc(spec.city)}. ${esc(c.verify.line)} Every image on this page is generated concept art direction; none of it depicts the business, its premises, its people, or its work.</p>
        <div class="verification-actions">${contactActions(c)}</div>
      </section>
    </main>
    <footer class="site-footer"><a href="${META.labPath}">${esc(META.labFooterLabel ?? "All builds in this batch")}</a><span>Concept only · noindex · mail hold · synthetic imagery</span></footer>
  </body>
</html>
`;
}

function renderLab() {
  const cards = ORDER.map((slug) => {
    const spec = SITES[slug];
    return `      <a class="lab-card" href="/sites/${slug}/" style="--accent:${spec.accent}">
        <span class="lab-card-build">Build ${spec.build}</span>
        <strong>${esc(spec.name)}</strong>
        <span class="lab-card-verb">${esc(spec.verb)} · ${esc(spec.vertical)}</span>
      </a>`;
  }).join("\n");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#07090a"/><rect x="7" y="7" width="18" height="18" fill="none" stroke="#e8b84a" stroke-width="2"/><circle cx="16" cy="16" r="3.5" fill="#e8b84a"/></svg>')}" />
    <meta name="theme-color" content="#07090a" />
    <meta name="description" content="Ten cinematic scroll builds for the Prospect Radar next-ten batch." />
    <title>${esc(META.labTitle)}</title>
    <style>
      @font-face { font-family: "Alumni Sans"; src: url("/assets/fonts/alumni-sans-var.woff2") format("woff2"); font-weight: 100 900; font-display: swap; }
      @font-face { font-family: "Public Sans"; src: url("/assets/fonts/public-sans-var.woff2") format("woff2"); font-weight: 100 900; font-display: swap; }
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100svh; padding: clamp(28px, 6vw, 90px); color: #f5f2ea; background: #07090a; font-family: "Public Sans", sans-serif; }
      h1 { max-width: 12ch; margin: 0 0 10px; font-family: "Alumni Sans", "Arial Narrow", sans-serif; font-size: clamp(3.4rem, 9vw, 8rem); font-weight: 680; line-height: .84; letter-spacing: -.01em; text-transform: uppercase; }
      .lede { max-width: 52ch; margin: 0 0 44px; color: rgba(245,242,234,.68); font-size: 15px; line-height: 1.7; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1px; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.14); }
      .lab-card { display: grid; gap: 10px; align-content: start; padding: 26px 24px 30px; background: #0a0d0f; color: inherit; text-decoration: none; transition: background .4s ease, transform .4s cubic-bezier(.16,1,.3,1); position: relative; }
      .lab-card::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 2px; background: var(--accent); transform: scaleY(0); transform-origin: bottom; transition: transform .45s cubic-bezier(.16,1,.3,1); }
      .lab-card:hover { background: #10151a; transform: translateY(-5px); }
      .lab-card:hover::before { transform: scaleY(1); transform-origin: top; }
      .lab-card-build { color: var(--accent); font-size: 9px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; }
      .lab-card strong { font-family: "Alumni Sans", "Arial Narrow", sans-serif; font-size: 26px; font-weight: 660; line-height: .95; letter-spacing: .01em; text-transform: uppercase; }
      .lab-card-verb { color: rgba(245,242,234,.6); font-size: 11.5px; letter-spacing: .04em; }
      footer { margin-top: 46px; color: rgba(245,242,234,.55); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; }
      :focus-visible { outline: 2px solid #e8b84a; outline-offset: 4px; }
    </style>
  </head>
  <body>
    <main>
      <h1>${META.labHeading}</h1>
      <p class="lede">${esc(META.labLede)}</p>
      <nav class="grid" aria-label="The ten builds">
${cards}
      </nav>
      <footer>Concept only · noindex · mail hold · synthetic imagery</footer>
    </main>
  </body>
</html>
`;
}

for (const slug of ORDER) {
  const dir = join(root, "sites", slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), renderSite(slug));
  const css = renderSiteCss(SITES[slug]);
  if (css) writeFileSync(join(dir, "site.css"), css);
  console.log(`page  ${slug}`);
}
writeFileSync(join(root, "index.html"), renderLab());
console.log("page  lab index");
