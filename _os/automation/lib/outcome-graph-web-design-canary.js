'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');
const { REPO_ROOT } = require('./fsutil');
const { sha256, stableJson } = require('./outcome-graph');
const {
  REQUIRED_CRAFT_DIMENSIONS,
  REQUIRED_GATES,
  runWebDesignLoopDurable,
} = require('./outcome-graph-web-design');

const BRIEF_PATH = 'System/outcome-graph/source-snapshots/web-design-loop-canary-brief-2026-08-24.json';
const AUTHORITY_PATHS = [
  BRIEF_PATH,
  'automation/prospect-radar-next20/PRODUCT.md',
  'automation/prospect-radar-next20/DESIGN.md',
  '12_Brain/03_Concepts/High Craft Website Factory.md',
];
const detectorCache = new Map();

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function sourceEntry(repoRoot, locator) {
  const file = path.join(repoRoot, locator);
  const bytes = fs.readFileSync(file);
  return {
    locator: normalizePath(locator),
    sha256: sha256(bytes),
    bytes: bytes.length,
  };
}

function collectWebDesignCanarySources(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const sourceManifest = AUTHORITY_PATHS.map((locator) => sourceEntry(repoRoot, locator))
    .sort((a, b) => a.locator.localeCompare(b.locator));
  const brief = JSON.parse(fs.readFileSync(path.join(repoRoot, BRIEF_PATH), 'utf8'));
  return {
    captured_at: new Date(options.asOf || new Date()).toISOString(),
    binding_version: 'closed-loop-canary-2026-08-24-v1',
    source_manifest: sourceManifest,
    source_set_sha256: sha256(stableJson(sourceManifest)),
    surfaces: [{
      id: brief.surface_id,
      mode: brief.mode,
      production_intent: brief.production_intent,
      brief: {
        audience: brief.audience,
        job: brief.job,
        primary_action: brief.primary_action,
        art_direction_thesis: brief.art_direction_thesis,
      },
      authority: sourceManifest.map((source) => ({
        locator: source.locator,
        sha256: source.sha256,
        role: source.locator === BRIEF_PATH ? 'surface-brief' : 'design-authority',
      })),
      deployment: { state: 'local_only', authorized: false },
    }],
  };
}

function draftHtml() {
  return `<!doctype html>
<html lang="en" data-design-state="draft">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Design loop draft</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font: 14px Arial, sans-serif; color: #262626; background: linear-gradient(135deg, #f5f7ff, #dfe7ff); }
    header, main { width: 980px; margin: 0 auto; padding: 24px; }
    header { display: flex; justify-content: space-between; }
    .hero, .card { padding: 24px; margin: 16px 0; border-radius: 22px; background: rgba(255,255,255,.72); box-shadow: 0 18px 50px rgba(0,0,0,.12); }
    h1 { font-size: 42px; }
    .button { display: inline-flex; height: 30px; align-items: center; padding: 0 12px; color: white; background: #635bff; border-radius: 999px; text-decoration: none; }
    .loop { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; width: 920px; }
    .node { min-height: 120px; padding: 16px; border-radius: 18px; background: white; animation: float 1.8s infinite alternate ease-in-out; }
    @keyframes float { to { transform: translateY(-8px); } }
    a:focus { outline: none; }
  </style>
</head>
<body>
  <header><span>DESIGN LOOP</span><a href="#proof">Proof</a></header>
  <main>
    <section class="hero"><p>Graph engineering</p><p>Build things better with a loop.</p><a class="button" href="#proof">See more</a></section>
    <section class="card"><h1>Everything is a card and everything has equal weight</h1><div class="loop"><div class="node">Brief</div><div class="node">Build</div><div class="node">Look</div><div class="node">Fix</div><div class="node">Test</div><div class="node">Done</div></div></section>
    <section class="card" id="proof">Synthetic local canary. Not production proof.</section>
  </main>
</body>
</html>`;
}

function resolvedHtml() {
  return `<!doctype html>
<html lang="en" data-design-state="resolved">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="A synthetic local proof of the closed-loop web-design runtime.">
  <title>The page is not done when it renders</title>
  <style>
    :root {
      --paper: #dfe6dc;
      --ink: #101512;
      --moss: #214b3b;
      --signal: #ffc3a6;
      --mist: #cbd8cb;
      --bright: #fffaf0;
      --line: rgba(16, 21, 18, .22);
      --measure: 78rem;
      --pad: clamp(1.25rem, 4vw, 4.5rem);
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; background: var(--ink); }
    body { margin: 0; min-width: 0; color: var(--ink); background: var(--paper); font-family: Georgia, Cambria, serif; font-size: 18px; line-height: 1.5; }
    a { color: inherit; }
    a:focus-visible { outline: 3px solid var(--signal); outline-offset: 5px; }
    .mast { min-height: 4.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0 var(--pad); border-bottom: 1px solid var(--line); font: 650 .9rem/1.1 Bahnschrift, 'Franklin Gothic Medium', sans-serif; letter-spacing: .04em; }
    .mast a { min-height: 48px; display: inline-flex; align-items: center; }
    .signal { display: inline-flex; align-items: center; gap: .55rem; }
    .signal::before { width: 1.1rem; height: .24rem; background: var(--signal); content: ''; }
    main { overflow: clip; }
    .hero { max-width: var(--measure); min-height: min(48rem, calc(100vh - 4.5rem)); margin: 0 auto; padding: clamp(3rem, 7vw, 7rem) var(--pad) 3rem; display: grid; align-content: space-between; gap: 4rem; }
    .eyebrow { margin: 0; font: 650 .9rem/1.1 Bahnschrift, 'Franklin Gothic Medium', sans-serif; letter-spacing: .04em; }
    h1 { max-width: 12ch; margin: 0; font-size: clamp(3.6rem, 9.7vw, 9.4rem); font-weight: 400; line-height: .84; letter-spacing: -.035em; text-wrap: balance; }
    .hero-foot { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(15rem, .65fr); align-items: end; gap: 2rem; border-top: 1px solid var(--line); padding-top: 1.5rem; }
    .hero-foot p { max-width: 52ch; margin: 0; font-family: Verdana, Geneva, sans-serif; }
    .primary { min-height: 52px; display: inline-flex; align-items: center; justify-content: space-between; gap: 2rem; padding: .7rem 1rem; background: var(--signal); color: var(--ink); font: 750 .9rem/1 Bahnschrift, 'Franklin Gothic Medium', sans-serif; letter-spacing: .04em; text-decoration: none; }
    .primary::after { content: '↘'; font-size: 1.2rem; transition: transform .2s ease; }
    .primary:hover::after, .primary:focus-visible::after { transform: translate(.2rem, .2rem); }
    .current { padding: 1rem; color: var(--bright); background: var(--moss); }
    .current-inner { max-width: var(--measure); margin: 0 auto; padding: clamp(4rem, 9vw, 8rem) var(--pad); }
    .current-head { display: grid; grid-template-columns: .42fr 1.58fr; gap: 2rem; align-items: end; margin-bottom: clamp(3rem, 8vw, 7rem); }
    .current h2 { max-width: 13ch; margin: 0; font-size: clamp(2.7rem, 6vw, 6.2rem); font-weight: 400; line-height: .94; letter-spacing: -.03em; }
    .loop-map { position: relative; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0; border-top: 1px solid rgba(242,237,221,.4); }
    .loop-map::before { position: absolute; top: -2px; left: 0; width: 16.66%; height: 3px; background: var(--signal); content: ''; animation: travel 1.4s cubic-bezier(.2,.8,.2,1) 1 both; }
    .node { min-width: 0; padding: 1.4rem .9rem 3rem; border-right: 1px solid rgba(223,230,220,.22); }
    .node:last-child { border-right: 0; }
    .node b { display: block; margin-bottom: 1.7rem; color: var(--signal); font: 750 .9rem/1 Bahnschrift, 'Franklin Gothic Medium', sans-serif; letter-spacing: .04em; }
    .node strong { display: block; font-size: clamp(1.05rem, 1.6vw, 1.5rem); font-weight: 400; line-height: 1.05; }
    .proof { padding: 1rem; background: var(--ink); color: var(--bright); }
    .proof-grid { max-width: var(--measure); margin: 0 auto; padding: clamp(4rem, 9vw, 8rem) var(--pad); display: grid; grid-template-columns: 1fr 1fr; gap: clamp(3rem, 8vw, 8rem); }
    .proof h2 { margin: 0; font-size: clamp(3rem, 7vw, 7rem); font-weight: 400; line-height: .9; letter-spacing: -.03em; }
    .proof-list { margin: 0; padding: 0; list-style: none; counter-reset: proof; }
    .proof-list li { display: grid; grid-template-columns: 2.4rem 1fr; gap: .75rem; padding: 1rem 0; border-top: 1px solid rgba(223,230,220,.24); font-family: Verdana, Geneva, sans-serif; }
    .proof-list li::before { counter-increment: proof; content: '0' counter(proof); color: var(--signal); font: 750 .9rem/1.7 Bahnschrift, 'Franklin Gothic Medium', sans-serif; }
    .disclosure { max-width: var(--measure); margin: 0 auto; padding: 1.25rem var(--pad); border-top: 1px solid rgba(223,230,220,.24); color: var(--mist); font: 550 .9rem/1.5 Bahnschrift, 'Franklin Gothic Medium', sans-serif; letter-spacing: .025em; }
    @keyframes travel { to { transform: translateX(500%); } }
    @media (max-width: 760px) {
      .hero { min-height: calc(100svh - 4.5rem); gap: 3rem; }
      h1 { font-size: clamp(3.7rem, 19vw, 6.2rem); }
      .hero-foot, .current-head, .proof-grid { grid-template-columns: 1fr; }
      .primary { width: 100%; }
      .loop-map { grid-template-columns: 1fr 1fr; }
      .loop-map::before { width: 50%; animation-name: travel-mobile; }
      .node:nth-child(2n) { border-right: 0; }
      .node { min-height: 8.5rem; border-bottom: 1px solid rgba(223,230,220,.22); }
      .node:nth-last-child(-n+2) { border-bottom: 0; }
      .proof-grid { gap: 3rem; }
    }
    @keyframes travel-mobile { to { transform: translateX(100%); } }
    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
  </style>
</head>
<body>
  <header class="mast"><span class="signal">Local canary / loop active</span><a href="#proof">Inspect proof</a></header>
  <main>
    <section class="hero" aria-labelledby="hero-title">
      <h1 id="hero-title">The page is not done when it renders.</h1>
      <div class="hero-foot"><p>A build becomes a candidate only after the rendered surface is criticized, repaired, captured again, and reproduced from the same source truth.</p><a class="primary" href="#proof">Inspect the evidence</a></div>
    </section>
    <section class="current" aria-labelledby="loop-title">
      <div class="current-inner">
        <div class="current-head"><p class="eyebrow">One visible current</p><h2 id="loop-title">Every defect has somewhere to go next.</h2></div>
        <div class="loop-map" aria-label="Closed-loop design sequence">
          <div class="node"><b>01</b><strong>Bind the brief</strong></div>
          <div class="node"><b>02</b><strong>Make in isolation</strong></div>
          <div class="node"><b>03</b><strong>Render the truth</strong></div>
          <div class="node"><b>04</b><strong>Critique precisely</strong></div>
          <div class="node"><b>05</b><strong>Repair the cause</strong></div>
          <div class="node"><b>06</b><strong>Reprove the finish</strong></div>
        </div>
      </div>
    </section>
    <section class="proof" id="proof" aria-labelledby="proof-title">
      <div class="proof-grid"><h2 id="proof-title">Proof before promotion.</h2><ol class="proof-list"><li>Desktop and mobile renders are hash-bound.</li><li>Keyboard, motion, overflow, content, and build states are checked separately.</li><li>Checker defects feed the next maker attempt.</li><li>A terminal replay verifies the final candidate again.</li><li>Adoption and deployment remain separate decisions.</li></ol></div>
      <p class="disclosure">Synthetic local canary. No client, public deployment, performance claim, or production approval.</p>
    </section>
  </main>
</body>
</html>`;
}

async function makeWebDesignCanary({ attempt, previous_findings: previousFindings, attempt_root: attemptRoot }) {
  const buildRoot = path.join(attemptRoot, 'build');
  fs.mkdirSync(buildRoot, { recursive: true });
  const repaired = attempt > 1 && previousFindings.length > 0;
  fs.writeFileSync(path.join(buildRoot, 'index.html'), repaired ? resolvedHtml() : draftHtml(), 'utf8');
  return {
    maker_id: 'deterministic-canary-builder',
    build_root: buildRoot,
    implementation_summary: repaired
      ? `Applied ${previousFindings.length} exact checker finding(s) to the isolated canary candidate.`
      : 'Produced the intentionally weak first canary draft so the repair path is exercised.',
  };
}

function runImpeccableDetector(file, repoRoot) {
  const digest = sha256(fs.readFileSync(file));
  if (detectorCache.has(digest)) return detectorCache.get(digest);
  const npxCli = process.platform === 'win32'
    ? path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npx-cli.js')
    : null;
  const executable = npxCli ? process.execPath : 'npx';
  const args = npxCli
    ? [npxCli, 'impeccable', 'detect', '--json', file]
    : ['impeccable', 'detect', '--json', file];
  const result = spawnSync(executable, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 120000,
    windowsHide: true,
  });
  let findings = null;
  try {
    findings = JSON.parse(String(result.stdout || '').trim() || '[]');
  } catch {
    findings = null;
  }
  const verdict = {
    passed: result.status === 0 && Array.isArray(findings) && findings.length === 0,
    finding_count: Array.isArray(findings) ? findings.length : null,
    exit_code: result.status,
    invocation_error: result.error ? result.error.code || result.error.message : null,
  };
  detectorCache.set(digest, verdict);
  return verdict;
}

async function inspectViewport(browser, fileUrl, viewport, evidenceRoot, phase, attempt) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const externalRequests = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('request', (request) => {
    if (!request.url().startsWith('file:')) externalRequests.push(request.url());
  });
  const started = Date.now();
  await page.goto(fileUrl, { waitUntil: 'load' });
  const loadMs = Date.now() - started;
  const screenshot = path.join(evidenceRoot, `${phase}-${viewport.id}-attempt-${attempt}.png`);
  await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
  const metrics = await page.evaluate(() => {
    const cta = document.querySelector('.primary, .button');
    const rect = cta?.getBoundingClientRect();
    return {
      state: document.documentElement.dataset.designState || null,
      h1_count: document.querySelectorAll('h1').length,
      main_present: Boolean(document.querySelector('main')),
      lang: document.documentElement.lang,
      body_font_px: Number.parseFloat(getComputedStyle(document.body).fontSize),
      overflow_px: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      cta_present: Boolean(cta),
      cta_width: rect?.width || 0,
      cta_height: rect?.height || 0,
      css_variable_count: Array.from(document.styleSheets).reduce((count, sheet) => {
        try {
          return count + Array.from(sheet.cssRules).filter((rule) => rule.selectorText === ':root')
            .reduce((sum, rule) => sum + Array.from(rule.style).filter((name) => name.startsWith('--')).length, 0);
        } catch {
          return count;
        }
      }, 0),
      generic_gradient_present: /linear-gradient/i.test(document.documentElement.innerHTML),
      canary_disclosure_present: document.body.textContent.includes('Synthetic local canary'),
    };
  });
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(() => {
    const active = document.activeElement;
    const style = active ? getComputedStyle(active) : null;
    return {
      tag: active?.tagName || null,
      outline_width: Number.parseFloat(style?.outlineWidth || '0'),
      outline_style: style?.outlineStyle || null,
    };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(50);
  const runningAnimations = await page.evaluate(() => document.getAnimations()
    .filter((animation) => animation.playState === 'running' &&
      Number(animation.effect?.getTiming()?.duration || 0) > 1).length);
  await context.close();
  return {
    viewport: viewport.id,
    width: viewport.width,
    height: viewport.height,
    file: screenshot,
    load_ms: loadMs,
    console_errors: consoleErrors.length,
    external_requests: externalRequests.length,
    running_reduced_motion_animations: runningAnimations,
    focus,
    ...metrics,
  };
}

function finding(id, gateId, summary, repairInstruction, learningTarget) {
  return {
    id,
    gate_id: gateId,
    severity: 'major',
    summary,
    repair_instruction: repairInstruction,
    regression_test: `Re-run ${gateId} on desktop and mobile after the repair.`,
    learning_target: learningTarget,
  };
}

async function inspectWebDesignCanary({ phase, build_root: buildRoot, evidence_root: evidenceRoot, attempt }) {
  const { chromium } = require('playwright');
  const indexFile = path.join(buildRoot, 'index.html');
  const browser = await chromium.launch({ headless: true });
  let captures;
  try {
    captures = [];
    for (const viewport of [
      { id: 'desktop', width: 1440, height: 1000 },
      { id: 'mobile', width: 390, height: 844 },
    ]) {
      captures.push(await inspectViewport(
        browser,
        pathToFileURL(indexFile).href,
        viewport,
        evidenceRoot,
        phase,
        attempt
      ));
    }
  } finally {
    await browser.close();
  }
  const html = fs.readFileSync(indexFile, 'utf8');
  const resolved = captures.every((capture) => capture.state === 'resolved');
  const noOverflow = captures.every((capture) => capture.overflow_px === 0);
  const touchTargets = captures.every((capture) => capture.cta_present &&
    capture.cta_width >= 44 && capture.cta_height >= 44);
  const focusVisible = captures.every((capture) =>
    capture.focus.tag === 'A' && capture.focus.outline_width >= 2 && capture.focus.outline_style !== 'none'
  );
  const reducedMotion = captures.every((capture) => capture.running_reduced_motion_animations === 0);
  const cleanRuntime = captures.every((capture) => capture.console_errors === 0 && capture.external_requests === 0);
  const semantics = captures.every((capture) => capture.h1_count === 1 && capture.main_present &&
    capture.lang === 'en' && capture.body_font_px >= 16);
  const performance = captures.every((capture) => capture.load_ms < 2500) && fs.statSync(indexFile).size < 150000;
  const truthful = captures.every((capture) => capture.canary_disclosure_present) &&
    !/(lorem ipsum|trusted by|award-winning|guaranteed results)/i.test(html);
  const detector = runImpeccableDetector(indexFile, REPO_ROOT);
  const systemTrue = resolved && captures.every((capture) =>
    capture.css_variable_count >= 6 && !capture.generic_gradient_present
  ) && detector.passed;
  const craftPass = resolved && noOverflow && touchTargets && focusVisible && reducedMotion &&
    cleanRuntime && semantics && truthful && systemTrue;
  const gatePass = {
    authority: true,
    brief: true,
    build: cleanRuntime,
    responsive: noOverflow && touchTargets,
    interaction: focusVisible && reducedMotion,
    accessibility: semantics && focusVisible && touchTargets,
    performance,
    'content-truth': truthful,
    'design-system': systemTrue,
    'independent-craft': craftPass,
  };
  const findings = [];
  if (!resolved) findings.push(finding(
    'composition-generic-and-flat',
    'independent-craft',
    'The draft uses interchangeable translucent cards and gives every message equal weight.',
    'Commit to the editorial signal-path thesis with one dominant headline, flat fields, and a visible loop sequence.',
    'brief'
  ));
  if (!noOverflow) findings.push(finding(
    'mobile-horizontal-overflow',
    'responsive',
    'The fixed-width composition exceeds the mobile viewport.',
    'Replace fixed canvas widths with bounded fluid grids and verify 390 pixels without horizontal overflow.',
    'component'
  ));
  if (!touchTargets) findings.push(finding(
    'primary-action-below-touch-floor',
    'accessibility',
    'The primary action is shorter than the 44 pixel touch floor.',
    'Give the primary action at least 48 pixels of usable height and preserve it on mobile.',
    'token'
  ));
  if (!focusVisible) findings.push(finding(
    'keyboard-focus-not-visible',
    'interaction',
    'Keyboard focus has no visible authored state.',
    'Add a high-contrast focus-visible treatment that does not depend on hover.',
    'component'
  ));
  if (!reducedMotion) findings.push(finding(
    'reduced-motion-fallback-missing',
    'interaction',
    'Decorative animation continues for reduced-motion users.',
    'Resolve animated elements to their final state inside prefers-reduced-motion.',
    'motion'
  ));
  if (!systemTrue && resolved) findings.push(finding(
    'design-system-gate-failed',
    'design-system',
    `The resolved page did not satisfy the design-system gate: css_variables=${Math.min(...captures.map((capture) => capture.css_variable_count))}; generic_gradient=${captures.some((capture) => capture.generic_gradient_present)}; detector_passed=${detector.passed}; detector_findings=${detector.finding_count}; detector_exit=${detector.exit_code}.`,
    'Repair the exact token or detector finding and rerun the manual Windows detector.',
    'qa_rule'
  ));
  const craftValue = craftPass ? 4.5 : 3;
  return {
    reviewer_id: phase === 'terminal'
      ? 'deterministic-terminal-canary-checker'
      : 'deterministic-visual-canary-checker',
    review_type: 'synthetic_canary',
    production_eligible: false,
    gate_results: REQUIRED_GATES.map((id) => ({
      id,
      passed: gatePass[id] === true,
      detail: gatePass[id] === true ? `${id} passed.` : `${id} requires the recorded repair.`,
    })),
    captures: captures.map((capture) => ({
      viewport: capture.viewport,
      width: capture.width,
      height: capture.height,
      file: capture.file,
    })),
    craft: {
      verdict: craftPass ? 'pass' : 'fail',
      summary: craftPass
        ? 'The resolved canary has a specific editorial thesis, decisive hierarchy, purposeful motion, strong responsive reconstruction, and explicit evidence disclosure.'
        : 'The first draft is intentionally generic, flat, inaccessible, and not responsive enough to pass the craft floor.',
      scores: Object.fromEntries(REQUIRED_CRAFT_DIMENSIONS.map((dimension) => [dimension, craftValue])),
    },
    findings,
    external_action_attempted: false,
  };
}

async function runWebDesignCanaryDurable(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const outputDir = path.resolve(options.outputDir || path.join(
    repoRoot,
    'System',
    'outcome-graph',
    'web-design',
    'closed-loop-canary',
    '2026-08-24-live'
  ));
  return runWebDesignLoopDurable({
    cadenceBucket: options.cadenceBucket || '2026-08-24-live',
    graphId: 'closed-loop-web-design-canary',
    objective: 'Prove the web-design runtime by rendering an intentionally weak local draft, feeding exact visual and engineering defects into one repair, and terminally re-rendering the resolved candidate.',
    valueSignal: 'The design loop itself proves that critique changes the next build and that a synthetic review never promotes a candidate to production-ready.',
    canonicalState: 'The source brief, product/design documents, high-craft factory concept, source project, and deployment state remain canonical and read only.',
    upstreamArtifacts: AUTHORITY_PATHS,
    repoRoot,
    outputDir,
    stateRoot: options.stateRoot,
    logicalRoot: options.logicalRoot,
    safeOutput: options.safeOutput,
    collectSources: () => collectWebDesignCanarySources({ repoRoot, asOf: options.asOf }),
    makeSurface: makeWebDesignCanary,
    inspectSurface: inspectWebDesignCanary,
    terminalInspectSurface: inspectWebDesignCanary,
    maxRepairPasses: 2,
    timeoutSeconds: 900,
    maxParallel: 1,
    onCheckpoint: options.onCheckpoint,
    beforeFinalBindingCheck: options.beforeFinalBindingCheck,
  });
}

module.exports = {
  AUTHORITY_PATHS,
  BRIEF_PATH,
  collectWebDesignCanarySources,
  inspectWebDesignCanary,
  makeWebDesignCanary,
  runImpeccableDetector,
  runWebDesignCanaryDurable,
};
