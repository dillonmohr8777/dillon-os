import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const baseUrl = process.argv[2] || 'http://127.0.0.1:4178/'
const outputDir = path.resolve('.qa', 'robots')
await fs.mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })

await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
await page.locator('.client-particle-sequence__controls button:not([disabled])').first().waitFor({ state: 'visible', timeout: 30_000 })
const names = await page.locator('.agent h3').allTextContents()

for (let index = 0; index < names.length; index += 1) {
  const agent = page.locator('.agent').nth(index)
  const top = await agent.evaluate((node) => node.getBoundingClientRect().top + window.scrollY)
  await page.evaluate((target) => window.scrollTo({ top: Math.max(0, target - 160), behavior: 'instant' }), top)
  await page.waitForTimeout(450)
  await page.screenshot({ path: path.join(outputDir, `${index + 1}-${names[index].toLowerCase()}.png`) })
}

console.log(JSON.stringify({ names, errors }))
await browser.close()
if (errors.length || names.length !== 5) process.exitCode = 1
