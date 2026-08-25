import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const baseUrl = process.argv[2] || 'http://127.0.0.1:4178/'
const routes = ['/', '/about/', '/contact/', '/insights/', '/insights/google-ai-overviews-service-businesses/']
const browser = await chromium.launch({ headless: true })

for (const route of routes) {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    reducedMotion: route === '/' ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(250)
  const results = await new AxeBuilder({ page }).analyze()
  const violations = results.violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    nodes: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })),
  }))
  console.log(JSON.stringify({ route, violations }, null, 2))
  await context.close()
}

await browser.close()
