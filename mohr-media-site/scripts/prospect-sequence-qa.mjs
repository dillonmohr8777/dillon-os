import { chromium } from 'playwright'

const baseUrl = process.env.QA_URL ?? 'http://127.0.0.1:4173'
const outputDir = process.env.QA_OUTPUT
const suffix = process.env.QA_SUFFIX ? `-${process.env.QA_SUFFIX}` : ''
const viewport = {
  width: Number(process.env.QA_WIDTH ?? 1440),
  height: Number(process.env.QA_HEIGHT ?? 1000),
}
if (!outputDir) throw new Error('QA_OUTPUT is required')

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: 'dark' })
const page = await context.newPage()
const errors = []
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
page.on('pageerror', (error) => errors.push(error.message))

await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
await page.evaluate(() => document.fonts.ready)
const stage = page.locator('.prospect-sequence')
const captures = [
  ['01-align-copy', 650],
  ['02-align-converging', 1350],
  ['03-align-resolved', 1100],
  ['04-align-hold', 2100],
  ['05-hrchitect-copy', 1700],
  ['06-hrchitect-converging', 1500],
  ['07-hrchitect-resolved', 1100],
  ['08-hrchitect-hold', 2100],
]

for (const [name, wait] of captures) {
  await page.waitForTimeout(wait)
  await stage.screenshot({ path: `${outputDir}/${name}${suffix}.png` })
}

const report = await page.evaluate(() => ({
  viewport: { width: window.innerWidth, height: window.innerHeight },
  scrollWidth: document.documentElement.scrollWidth,
  header: (() => {
    const rect = document.querySelector('.site-header')?.getBoundingClientRect()
    return rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null
  })(),
  canvases: document.querySelectorAll('canvas').length,
  prospectCanvas: document.querySelectorAll('.prospect-particle-logo canvas').length,
}))

console.log(JSON.stringify({ ...report, errors }, null, 2))
await context.close()
await browser.close()

if (report.scrollWidth > report.viewport.width || errors.length > 0) process.exitCode = 1
