# World Central Kitchen — Win Story (one-pager)

`WCK_Win_Story.pptx` is a single-slide Align HCM win-story deck for the **World Central Kitchen / Dayforce Full-Suite Implementation** deal.

It takes the original WCK win-story content and rebuilds it in the polished **Sage Hospitality pursuit** template style:

- Floating white rounded card with a soft shadow on a light-gray canvas
- Navy header with a `WIN STORY` pill, the client title, and the real **Align HCM + Dayforce** logos in the top-right
- Light metric strip (Employees / Sector / Countries / Competition / Replacing / Deal Value)
- Three color-coded columns — Client Challenges (navy), Why Align HCM + Dayforce (orange), Sales Cycle Impact (green) — each with bordered, tinted cards and colored titles

The deck is built from **native, editable PowerPoint shapes and text** (no flattened image of the slide), so anything can be edited directly in PowerPoint. Font is Calibri. Per the Align brand guideline, the copy uses no em dashes.

## Files

```
WCK_Win_Story.pptx      # the deliverable
assets/align_logo.png   # Align HCM logo (transparent-navy, orange-bordered box)
assets/dayforce_logo.png# Dayforce logo (blue wordmark on white box)
build/scene.js          # single source of truth: geometry + all content
build/render-pptx.js    # scene -> PowerPoint
build/render-html.js    # scene -> HTML preview (for visual QA)
```

## Regenerate after editing content

Edit text/metrics/colors in `build/scene.js`, then:

```bash
cd build
npm install pptxgenjs
node render-pptx.js        # writes ../WCK_Win_Story.pptx
```

## Visual QA (optional)

```bash
cd build
node render-html.js        # writes build/preview.html
# screenshot preview.html at 1280x720 with headless Chromium to check layout/overflow
```

The `assets/` logos were extracted from the source Sage-pursuit slide and cleaned (dark background keyed to transparent) so they sit seamlessly on the navy header.
