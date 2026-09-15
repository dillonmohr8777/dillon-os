# Client Creative Factory

Local image and video asset pipeline for Momentum 360 client landing pages and paid social.

## What this produces

| Output | Format | Use |
|--------|--------|-----|
| `landing-pages/*.html` | Self-contained LP previews | Client review, Netlify deploy, PMax LP |
| `social/*.html` | Animated 1080×1080 / 1080×1920 | Screen-record to MP4 or screenshot to PNG |
| `output/images/*.png` | AI hero art | Meta/Google display, LP headers |
| `client-tokens.json` | Brand colors + CTA | Source of truth for renders |

## Quick start

1. Open any file in `landing-pages/` or `social/` in Chrome.
2. **Images:** screenshot at 100% zoom, or use DevTools device frame.
3. **Videos:** screen-record the social HTML (loops are CSS-driven, 6–15s).
4. **Deploy LP:** copy HTML to Netlify drop or client static host (approval required).

## Clients in factory

- Kimberly James Bridal — navy/gold/cream bridal
- Omega Landscaping — green/earth Colorado Springs
- Bar Crawl USA — red/white/blue events (compliance-safe copy)
- Replenish — kiosk smoothie B2C

## Video export (optional, requires ffmpeg)

```bash
# Record 9:16 reel in browser, then:
ffmpeg -i recording.mov -c:v libx264 -pix_fmt yuv420p output/reels/<client>-reel.mp4
```

Or adapt `02_Campaigns/IMMOHRTAL/asset-studio/motion.py` pattern with Playwright for headless MP4.

## Approval

All deploys and client sends require `System/approval-queue.md` sign-off.
