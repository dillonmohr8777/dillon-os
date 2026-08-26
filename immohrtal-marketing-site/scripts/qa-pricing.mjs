import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const baseUrl = new URL(process.argv[2] || 'http://127.0.0.1:4178/')
const outputDir = path.resolve('.qa')
await fs.mkdir(outputDir, { recursive: true })

const expectedPrices = [
  ['technical-seo', 'Technical SEO', '$700'],
  ['aeo', 'AEO', '$700'],
  ['geo', 'GEO', '$700'],
  ['search-visibility-bundle', 'Technical SEO + AEO + GEO', '$1,500'],
  ['google-ads-management', 'Google Ads management', '$400'],
  ['meta-ads-management', 'Meta Ads management', '$400'],
  ['paid-media-bundle', 'Google + Meta Ads management', '$650'],
]

const cases = [
  { name: 'desktop', width: 1440, height: 1000, reducedMotion: 'no-preference' },
  { name: 'mobile', width: 390, height: 844, reducedMotion: 'no-preference' },
  { name: 'mobile-320-reduced', width: 320, height: 740, reducedMotion: 'reduce' },
]

const browser = await chromium.launch({ headless: true })
const results = []

for (const testCase of cases) {
  const context = await browser.newContext({
    viewport: { width: testCase.width, height: testCase.height },
    colorScheme: 'dark',
    reducedMotion: testCase.reducedMotion,
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`))

  const response = await page.goto(new URL('/pricing/', baseUrl).toString(), { waitUntil: 'domcontentloaded' })
  await page.evaluate(async () => { await document.fonts.ready })
  await page.waitForTimeout(testCase.reducedMotion === 'reduce' ? 100 : 800)
  await page.screenshot({ path: path.join(outputDir, `pricing-${testCase.name}-viewport.png`) })

  if (testCase.name === 'desktop') {
    await page.locator('.page-hero').screenshot({ path: path.join(outputDir, 'pricing-desktop-hero.png') })
  } else {
    await page.locator('.page-hero').screenshot({ path: path.join(outputDir, `${testCase.name}-hero.png`) })
  }

  let menuOpened = null
  let menuClosed = null
  let focusReturned = null
  if (testCase.width <= 1180) {
    const toggle = page.locator('[data-menu-toggle]')
    await toggle.click()
    menuOpened = await toggle.getAttribute('aria-expanded') === 'true'
    if (testCase.name === 'mobile') await page.screenshot({ path: path.join(outputDir, 'pricing-mobile-menu.png') })
    await page.keyboard.press('Escape')
    menuClosed = await toggle.getAttribute('aria-expanded') === 'false'
    focusReturned = await toggle.evaluate((node) => node === document.activeElement)
  }

  await page.keyboard.press('Tab')
  const visibleFocus = await page.evaluate(() => {
    const active = document.activeElement
    if (!(active instanceof HTMLElement)) return false
    const style = getComputedStyle(active)
    return style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) >= 2
  })

  const accessibility = await new AxeBuilder({ page }).analyze()
  const violations = accessibility.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length }))
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  })

  await page.evaluate(async () => {
    const step = Math.max(420, Math.round(window.innerHeight * .72))
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 26))
    }
    window.scrollTo(0, document.documentElement.scrollHeight)
  })
  await page.waitForTimeout(testCase.reducedMotion === 'reduce' ? 100 : 1_150)

  if (testCase.name === 'desktop') {
    const priceSections = page.locator('.content-section:has(.pricing-menu)')
    await priceSections.nth(0).screenshot({ path: path.join(outputDir, 'pricing-desktop-search.png') })
    await priceSections.nth(1).screenshot({ path: path.join(outputDir, 'pricing-desktop-paid-media.png') })
  } else if (testCase.name === 'mobile') {
    const priceSections = page.locator('.content-section:has(.pricing-menu)')
    await priceSections.nth(0).screenshot({ path: path.join(outputDir, 'pricing-mobile-search.png') })
    await priceSections.nth(1).screenshot({ path: path.join(outputDir, 'pricing-mobile-paid-media.png') })
  }
  await page.screenshot({ path: path.join(outputDir, `pricing-${testCase.name}-full.png`), fullPage: true })

  const metrics = await page.evaluate((expected) => {
    const rows = expected.map(([id, name, price]) => {
      const row = document.getElementById(id)
      return {
        id,
        expectedName: name,
        expectedPrice: price,
        name: row?.querySelector('h3')?.textContent?.trim() || '',
        price: row?.querySelector('.pricing-row__price strong')?.textContent?.trim() || '',
      }
    })
    const schema = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .flatMap((script) => {
        try {
          const data = JSON.parse(script.textContent || '{}')
          return data['@graph'] || [data]
        } catch {
          return []
        }
      })
      .find((node) => node?.['@type'] === 'OfferCatalog')
    const active = document.activeElement
    const bodyFont = getComputedStyle(document.body).fontFamily
    const displayFont = getComputedStyle(document.querySelector('h1')).fontFamily
    return {
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      navLabels: [...document.querySelectorAll('.site-rail nav a')].map((node) => node.textContent?.trim()),
      rowCount: document.querySelectorAll('.pricing-row').length,
      rows,
      offerCount: Array.isArray(schema?.itemListElement) ? schema.itemListElement.length : 0,
      contactTargets: [...document.querySelectorAll('.hero-actions a, .pricing-menu__action, .closing-cta')].map((node) => node.getAttribute('href')),
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflowOffenders: [...document.querySelectorAll('body *')]
        .filter((node) => {
          const rect = node.getBoundingClientRect()
          return rect.right > document.documentElement.clientWidth + 2 || rect.left < -2
        })
        .slice(0, 12)
        .map((node) => `${node.tagName.toLowerCase()}.${node.className}`),
      swipeWords: document.querySelectorAll('[data-swipe-heading] .swipe-word').length,
      footerParticleState: document.querySelector('[data-particle-footer]')?.getAttribute('data-particle-state') || null,
      bodyFont,
      displayFont,
      activeElement: active instanceof HTMLElement ? active.outerHTML.slice(0, 160) : '',
    }
  }, expectedPrices)

  const priceMismatch = metrics.rows.some((row) => row.name !== row.expectedName || row.price !== row.expectedPrice)
  const reducedMismatch = testCase.reducedMotion === 'reduce'
    ? metrics.swipeWords !== 0 || metrics.footerParticleState !== 'static'
    : !['complete', 'fallback'].includes(metrics.footerParticleState)
  const failed = response?.status() !== 200
    || metrics.canonical !== 'https://www.immohrtalmarketing.com/pricing/'
    || JSON.stringify(metrics.navLabels) !== JSON.stringify(['Services', 'Pricing', 'Work', 'Guides', 'About'])
    || metrics.rowCount !== 7
    || metrics.offerCount !== 7
    || priceMismatch
    || metrics.contactTargets.some((href) => href !== '/contact/' && href !== '/services/' && href !== 'https://calendar.app.google/CSD1BzHQJtCFhEdY9')
    || metrics.scrollWidth > metrics.viewport
    || !metrics.bodyFont.includes('Manrope Variable')
    || !metrics.displayFont.includes('Unbounded Variable')
    || (testCase.width <= 1180 && (!menuOpened || !menuClosed || !focusReturned))
    || !visibleFocus
    || reducedMismatch
    || errors.length > 0
    || violations.length > 0

  results.push({ ...testCase, status: response?.status(), menuOpened, menuClosed, focusReturned, visibleFocus, errors, violations, failed, ...metrics })
  await context.close()
}

await browser.close()
await fs.writeFile(path.join(outputDir, 'pricing-qa-results.json'), `${JSON.stringify(results, null, 2)}\n`)
console.log(JSON.stringify(results, null, 2))
if (results.some((result) => result.failed)) process.exitCode = 1
