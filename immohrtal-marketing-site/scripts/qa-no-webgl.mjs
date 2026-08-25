import { chromium } from 'playwright'

const baseUrl = process.argv[2] || 'http://127.0.0.1:4178/'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await context.newPage()
const errors = []

page.on('pageerror', (error) => errors.push(error.message))
await page.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null
    return original.call(this, type, ...args)
  }
})

await page.goto(baseUrl, { waitUntil: 'networkidle' })
await page.waitForSelector('.client-particle-sequence__static-grid')

const result = await page.evaluate(() => ({
  staticLogos: document.querySelectorAll('.client-particle-sequence__static-grid img').length,
  you: document.querySelector('.client-particle-sequence__you')?.textContent,
  particleCanvases: document.querySelectorAll('.client-particle-sequence canvas').length,
}))

await browser.close()

if (result.staticLogos !== 21 || result.you !== 'YOU' || result.particleCanvases !== 0 || errors.length) {
  throw new Error(JSON.stringify({ result, errors }))
}

console.log(JSON.stringify({ result, errors }))
