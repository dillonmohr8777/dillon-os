import { chromium } from 'playwright'

const baseUrl = process.env.QA_URL ?? 'http://127.0.0.1:4173'
const browser = await chromium.launch({ headless: true })
const viewports = [
  { width: 320, height: 780 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
]
const results = []

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1900)

  const layout = await page.evaluate(() => {
    const rect = (selector) => {
      const node = document.querySelector(selector)
      if (!node) return null
      const box = node.getBoundingClientRect()
      return {
        top: box.top + window.scrollY,
        right: box.right,
        bottom: box.bottom + window.scrollY,
        left: box.left,
        width: box.width,
        height: box.height,
      }
    }
    const nav = rect('.site-nav')
    const heroLogo = rect('.particle-logo > img')
    const signal = rect('.contact-signal')
    const contactCopy = rect('.contact-copy')
    const contactEmail = rect('.contact-email')
    const footer = rect('.contact-section footer')
    const clientFigure = document.querySelector('.client-ticker figure')
    const clientImage = document.querySelector('.client-ticker img')
    const figureStyle = clientFigure ? getComputedStyle(clientFigure) : null
    const imageStyle = clientImage ? getComputedStyle(clientImage) : null
    return {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      nav,
      heroLogo,
      heroClearance: nav && heroLogo ? heroLogo.top - nav.bottom : null,
      contactClearance: signal && contactCopy ? contactCopy.top - signal.bottom : null,
      footerClearance: contactEmail && footer ? footer.top - contactEmail.bottom : null,
      logoStage: {
        borderTopWidth: figureStyle?.borderTopWidth,
        filter: imageStyle?.filter,
        opacity: imageStyle?.opacity,
      },
    }
  })

  await page.locator('#video-tab-1').click()
  const landscapeVideo = await page.locator('video').evaluate((video) => {
    const box = video.getBoundingClientRect()
    return {
      source: video.querySelector('source')?.getAttribute('src'),
      ratio: box.width / box.height,
      objectFit: getComputedStyle(video).objectFit,
    }
  })

  const passed = layout.scrollWidth === layout.clientWidth
    && (layout.heroClearance ?? -1) >= 12
    && (layout.contactClearance ?? -1) >= 56
    && (layout.footerClearance ?? -1) >= 72
    && layout.logoStage.borderTopWidth === '2px'
    && layout.logoStage.filter === 'none'
    && layout.logoStage.opacity === '1'
    && landscapeVideo.source === '/media/foundation-to-skyscraper.mp4'
    && landscapeVideo.ratio > 1.8
    && landscapeVideo.objectFit === 'contain'
    && errors.length === 0

  results.push({ viewport, passed, layout, landscapeVideo, errors })
  await context.close()
}

await browser.close()
console.log(JSON.stringify(results, null, 2))
if (results.some((result) => !result.passed)) process.exitCode = 1
