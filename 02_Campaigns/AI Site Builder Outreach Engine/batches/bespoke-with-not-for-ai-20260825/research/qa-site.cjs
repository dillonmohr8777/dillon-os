const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const url = process.argv[2] || process.env.WNF_QA_URL || 'http://127.0.0.1:51302/';
const outDir = path.join(__dirname, '..', 'qa', 'shots');
fs.mkdirSync(outDir, { recursive: true });

const wait = (page, milliseconds) => page.waitForTimeout(milliseconds);

async function captureOpening(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`));
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });

  const frames = [700, 1500, 2400, 3300, 4200, 5100, 6200, 7900];
  let elapsed = 0;
  for (const frame of frames) {
    await wait(page, frame - elapsed);
    elapsed = frame;
    await page.screenshot({ path: path.join(outDir, `opening-${frame}ms-mobile.png`) });
  }

  const metrics = await page.evaluate(() => ({
    title: document.title,
    noindex: document.querySelector('meta[name="robots"]')?.content || '',
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    openingComplete: document.querySelector('[data-opening]')?.dataset.complete,
    heroVisible: getComputedStyle(document.querySelector('.hero-message')).opacity,
    robotVisible: getComputedStyle(document.querySelector('[data-robot-control]')).opacity,
    robotPlacements: document.querySelectorAll('[data-robot-control], .robot-theatre__robot, .particle-finale__seed').length,
    duplicateIds: [...document.querySelectorAll('[id]')]
      .map((node) => node.id)
      .filter((id, index, ids) => ids.indexOf(id) !== index),
    missingAlts: [...document.querySelectorAll('img')].filter((image) => !image.hasAttribute('alt')).map((image) => image.src),
  }));

  const robot = page.locator('[data-robot-control]');
  const robotBox = await robot.boundingBox();
  let interaction = { pointerTracked: false, nodded: false, blinked: false };
  if (robotBox) {
    await page.mouse.move(robotBox.x + robotBox.width * 0.82, robotBox.y + robotBox.height * 0.3);
    await wait(page, 80);
    const look = await robot.evaluate((node) => ({
      x: Number.parseFloat(node.style.getPropertyValue('--look-x')),
      y: Number.parseFloat(node.style.getPropertyValue('--look-y')),
    }));
    await robot.click();
    await wait(page, 45);
    interaction = await robot.evaluate((node, look) => ({
      pointerTracked: Number.isFinite(look.x) && Number.isFinite(look.y) && (Math.abs(look.x) > 0.01 || Math.abs(look.y) > 0.01),
      nodded: node.classList.contains('is-nodding'),
      blinked: node.classList.contains('is-blinking'),
    }), look);
  }

  await page.click('[data-menu-open]');
  await page.screenshot({ path: path.join(outDir, 'mobile-menu.png') });
  await page.click('[data-menu-close]');
  await context.close();
  return { metrics, interaction, errors };
}

async function captureViewport(browser, name, viewport, reducedMotion = 'reduce') {
  const context = await browser.newContext({ viewport, reducedMotion });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`));
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await wait(page, reducedMotion === 'reduce' ? 150 : 8200);
  await page.screenshot({ path: path.join(outDir, `${name}-hero.png`) });
  const metrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    heroRect: document.querySelector('.hero-message').getBoundingClientRect().toJSON(),
    robotRect: document.querySelector('[data-robot-control]').getBoundingClientRect().toJSON(),
    detailRect: document.querySelector('.hero-detail').getBoundingClientRect().toJSON(),
  }));
  await context.close();
  return { name, metrics, errors };
}

async function captureSections(browser, mode, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`));
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await wait(page, 8200);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
  });

  const targets = [
    ['belief', '.belief', 0.52],
    ['highlights-one', '.highlights', 0.06],
    ['highlights-two', '.highlights', 0.52],
    ['highlights-three', '.highlights', 0.96],
    ['robot-theatre-design', '.robot-theatre', 0.22],
    ['robot-theatre-capabilities', '.robot-theatre', 0.58],
    ['robot-theatre-exit', '.robot-theatre', 0.9],
    ['adoption-one', '.adoption-story', 0.1],
    ['adoption-two', '.adoption-story', 0.5],
    ['adoption-three', '.adoption-story', 0.9],
    ['service-rollout', '.service-chapter--rollout', 0.45],
    ['service-systems', '.service-chapter--systems', 0.45],
    ['service-training', '.service-chapter--training', 0.45],
    ['briefing', '.briefing', 0.55],
    ['human-control', '.human-control', 0.45],
    ['closing', '.closing', 0.2],
    ['particle-finale-travel', '.particle-finale', 0.35],
    ['particle-finale-resolved', '.particle-finale', 0.35],
  ];

  const clipping = [];

  for (const [name, selector, progress] of targets) {
    const y = await page.evaluate(({ selector, progress }) => {
      const section = document.querySelector(selector);
      const travel = Math.max(0, section.offsetHeight - window.innerHeight);
      return section.offsetTop + travel * progress;
    }, { selector, progress });
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'auto' }), y);
    const sectionWait = name === 'particle-finale-travel'
      ? 1450
      : name === 'particle-finale-resolved'
        ? 2850
        : 240;
    await wait(page, sectionWait);
    await page.screenshot({ path: path.join(outDir, `${name}-${mode}.png`) });
    const clipped = await page.evaluate(({ selector, name }) => {
      const root = document.querySelector(selector);
      if (!root) return [{ name, selector, reason: 'missing-root' }];
      return [...root.querySelectorAll('h1, h2, h3, p, strong, a, button, span')]
        .filter((element) => element.textContent.trim())
        .filter((element) => !element.closest('.sr-only'))
        .filter((element) => {
          const panel = element.closest('.highlight-panel');
          return !panel || panel.dataset.active === 'true';
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            name,
            selector: `${element.tagName.toLowerCase()}.${element.className || ''}`,
            text: element.textContent.trim().slice(0, 80),
            left: Math.round(rect.left * 10) / 10,
            right: Math.round(rect.right * 10) / 10,
            top: Math.round(rect.top * 10) / 10,
            bottom: Math.round(rect.bottom * 10) / 10,
            opacity: Number.parseFloat(style.opacity),
            display: style.display,
            visibility: style.visibility,
          };
        })
        .filter((entry) => entry.display !== 'none' && entry.visibility !== 'hidden' && entry.opacity > 0.08)
        .filter((entry) => entry.bottom > 0 && entry.top < innerHeight)
        .filter((entry) => entry.left < -1 || entry.right > innerWidth + 1);
    }, { selector, name });
    clipping.push(...clipped);
  }

  await page.evaluate(() => document.querySelector('#tab-followups').focus());
  await page.keyboard.press('ArrowRight');
  const tabs = await page.evaluate(() => ({
    selected: document.querySelector('[role="tab"][aria-selected="true"]')?.id,
    visiblePanel: [...document.querySelectorAll('[role="tabpanel"]')].find((panel) => !panel.hidden)?.id,
  }));
  const particleState = await page.evaluate(() => document.querySelector('[data-particle-finale]')?.dataset.particleState || 'missing');
  await context.close();
  return { tabs, particleState, clipping, errors };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const opening = await captureOpening(browser);
  const responsive = [];
  responsive.push(await captureViewport(browser, 'phone-320', { width: 320, height: 720 }));
  responsive.push(await captureViewport(browser, 'tablet', { width: 768, height: 1024 }));
  responsive.push(await captureViewport(browser, 'desktop', { width: 1440, height: 900 }));
  const sections = await captureSections(browser, 'desktop', { width: 1440, height: 900 });
  const mobileSections = await captureSections(browser, 'mobile', { width: 390, height: 844 });
  await browser.close();

  const report = {
    url,
    capturedAt: new Date().toISOString(),
    opening,
    responsive,
    sections,
    mobileSections,
    pass: [
      ...opening.errors,
      ...responsive.flatMap((entry) => entry.errors),
      ...sections.errors,
      ...mobileSections.errors,
    ].length === 0 &&
      opening.metrics.scrollWidth === opening.metrics.clientWidth &&
      responsive.every((entry) => entry.metrics.scrollWidth === entry.metrics.clientWidth) &&
      opening.metrics.duplicateIds.length === 0 &&
      opening.metrics.missingAlts.length === 0 &&
      opening.metrics.robotPlacements === 3 &&
      opening.interaction.pointerTracked &&
      opening.interaction.nodded &&
      opening.interaction.blinked &&
      sections.clipping.length === 0 &&
      mobileSections.clipping.length === 0 &&
      sections.tabs.selected === 'tab-today' &&
      sections.tabs.visiblePanel === 'briefing-today' &&
      mobileSections.tabs.selected === 'tab-today' &&
      mobileSections.tabs.visiblePanel === 'briefing-today' &&
      sections.particleState === 'resolved' &&
      mobileSections.particleState === 'resolved',
  };
  fs.writeFileSync(path.join(__dirname, '..', 'qa', 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.pass ? 0 : 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
