import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const baseUrl = process.argv[2] || 'http://127.0.0.1:4178/'
const outputDir = path.resolve('.qa')
await fs.mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const results = []

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 1 },
]) {
  const context = await browser.newContext({ viewport, colorScheme: 'dark', reducedMotion: 'no-preference' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`))

  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.waitForSelector('.client-particle-sequence__controls button:not([disabled])', { timeout: 30_000 })
  await page.waitForTimeout(1_700)
  await page.screenshot({ path: path.join(outputDir, `${viewport.name}-hero.png`) })

  const pause = page.locator('.client-particle-sequence__controls button').first()
  const pauseLabel = await pause.textContent()
  await pause.click()
  const paused = await pause.getAttribute('aria-pressed')
  await page.locator('.client-particle-sequence__controls button').last().click()

  await page.waitForTimeout(14_250)
  await page.screenshot({ path: path.join(outputDir, `${viewport.name}-full.png`), fullPage: true })

  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: [...document.querySelectorAll('body *')]
      .filter((node) => node.getBoundingClientRect().right > window.innerWidth + 2 || node.getBoundingClientRect().left < -2)
      .slice(0, 12)
      .map((node) => `${node.tagName.toLowerCase()}.${node.className}`),
  }))
  const accessibility = await new AxeBuilder({ page }).analyze()
  results.push({ viewport: viewport.name, pauseLabel, paused, overflow, errors, violations: accessibility.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })) })
  await context.close()
}

const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
const reducedPage = await reducedContext.newPage()
await reducedPage.goto(baseUrl, { waitUntil: 'networkidle' })
const reducedLogos = await reducedPage.locator('.client-particle-sequence__static-grid img').count()
const reducedYou = await reducedPage.locator('.client-particle-sequence__you').textContent()
results.push({ viewport: 'reduced-mobile', reducedLogos, reducedYou })
await reducedContext.close()
await browser.close()

await fs.writeFile(path.join(outputDir, 'qa-results.json'), `${JSON.stringify(results, null, 2)}\n`)
console.log(JSON.stringify(results, null, 2))
