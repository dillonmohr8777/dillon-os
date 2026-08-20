import { chromium } from 'playwright'

const referenceUrl = 'https://need-momentum-signal-20260803.netlify.app/'
const outputDir = process.env.QA_OUTPUT

if (!outputDir) throw new Error('QA_OUTPUT is required')

const browser = await chromium.launch({ headless: true })
const results = []

async function capture(name, viewport, openMenu = false) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: 'dark' })
  const page = await context.newPage()
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(referenceUrl, { waitUntil: 'networkidle' })
  await page.waitForTimeout(5200)
  if (openMenu) {
    await page.locator('.menu-button').click()
    await page.waitForTimeout(350)
  }

  const metrics = await page.evaluate(() => {
    const header = document.querySelector('.site-header')?.getBoundingClientRect()
    const scene = document.querySelector('.signal-hero__scene')?.getBoundingClientRect()
    const menu = document.querySelector('#site-nav')?.getBoundingClientRect()
    return {
      title: document.title,
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      header: header && { left: header.left, top: header.top, width: header.width, height: header.height },
      scene: scene && { left: scene.left, top: scene.top, width: scene.width, height: scene.height },
      menu: menu && { left: menu.left, top: menu.top, width: menu.width, height: menu.height },
      menuOpen: document.querySelector('#site-nav')?.classList.contains('is-open') ?? false,
      canvases: document.querySelectorAll('canvas').length,
    }
  })

  await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: false })
  results.push({ name, viewport, metrics, errors })
  await context.close()
}

await capture('need-momentum-reference-desktop', { width: 1440, height: 1000 })
await capture('need-momentum-reference-mobile', { width: 390, height: 844 })
await capture('need-momentum-reference-mobile-menu', { width: 390, height: 844 }, true)

await browser.close()
console.log(JSON.stringify(results, null, 2))

if (results.some((result) => result.errors.length || result.metrics.scrollWidth > result.metrics.width)) process.exitCode = 1
