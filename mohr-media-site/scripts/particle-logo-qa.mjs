import { chromium } from 'playwright'

const baseUrl = process.env.QA_URL ?? 'http://127.0.0.1:4173'
const outputDir = process.env.QA_OUTPUT

if (!outputDir) throw new Error('QA_OUTPUT is required')

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  colorScheme: 'dark',
})
const page = await context.newPage()
const errors = []

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', (error) => errors.push(error.message))

await page.goto(baseUrl, { waitUntil: 'networkidle' })
await page.waitForTimeout(2200)

const stage = page.locator('.hero-logo-stage')
await stage.screenshot({ path: `${outputDir}/particle-logo-resolved.png` })
await page.waitForTimeout(7600)
await stage.screenshot({ path: `${outputDir}/particle-logo-dispersing.png` })
await page.waitForTimeout(1500)
await stage.screenshot({ path: `${outputDir}/particle-logo-regathering.png` })

const report = await page.evaluate(() => ({
  orbitElements: document.querySelectorAll('.hero-orbit').length,
  canvases: document.querySelectorAll('.particle-logo canvas').length,
  label: document.querySelector('.particle-logo')?.getAttribute('aria-label'),
}))

console.log(JSON.stringify({ ...report, errors }, null, 2))

await context.close()
await browser.close()

if (report.orbitElements !== 0 || report.canvases !== 1 || errors.length > 0) process.exitCode = 1
