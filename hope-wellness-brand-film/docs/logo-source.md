# Official logo — source record

## Asset used in the film

| | |
|---|---|
| **Source URL** | `https://thehopewellnesscenter.com/wp-content/uploads/2024/12/Hope-Wellness-Center-Mental-Health.png` |
| **Retrieved** | 2026-07-28, `curl` direct from the official site (HTTP 200, 32,772 bytes) |
| **Saved to** | `assets/logo/Hope-Wellness-Center-Mental-Health.png` |
| **Native size** | 470 × 152 px |
| **Colour** | 8-bit **RGBA — transparency preserved** |
| **Aspect ratio** | 3.0921 : 1 |
| **Role on site** | Primary header logo. It is the page's `<link rel="preload" as="image">` LCP asset, i.e. the site itself designates it as the primary brand mark. |
| **srcset offered by the site** | `…-300x97.png 300w`, `…Hope-Wellness-Center-Mental-Health.png 470w` |

470w is the **largest variant the site publishes**. Verified absent (HTTP 404):
`…-1024x331.png`, `…-768x248.png`, `…-scaled.png`, `….svg`, `….webp`.
No higher-resolution or vector original is publicly available.

## Variants found and how they were judged

| File | Size | Notes | Used? |
|---|---|---|---|
| `Hope-Wellness-Center-Mental-Health.png` | 470×152, RGBA | Full-colour horizontal lockup: brain/leaf roundel + "THE HOPE" (blue) / "WELLNESS CENTER" (green). Header, preloaded. | **Yes — primary** |
| `The-Hope-Wellness-Center.png` | 388×124, palette | All-white knockout, different stacked lockup ("THE / HOPE / WELLNESS CENTER"). Footer, reversed-on-dark use. | No |
| `TheHope-FavIcon.png` | 512×512, RGBA | Roundel mark only, no wordmark. | No |

The brief calls for the primary full-colour horizontal version unless the site
clearly establishes another primary. The site does not — the horizontal
full-colour lockup is the preloaded header mark, so it is the one used.

## Brand colours sampled from the logo pixels

Sampled from fully-opaque pixels of the official PNG (not guessed, not
eyedropped from a screenshot):

| Colour | Hex | Pixels | Use in the film |
|---|---|---|---|
| Brand blue | `#104C98` | 3,154 | All typography |
| Brand green | `#4EC441` | 1,568 (clustered) | Graphic accents only — state separators, wipe stroke, particles |

Brand green on the artwork's pale background measures ≈1.8:1 contrast, so it is
deliberately **not** used for type; blue measures ≈6.8:1.

## What was done to the file

One high-quality Lanczos enlargement, cached as `build/logo_master.png`:

- 470 × 152 → **1410 × 456** (exactly 3.0×)
- Aspect ratio **3.0921 → 3.0921** (unchanged)
- Alpha **premultiplied before resampling**, un-premultiplied after, so the
  feathered edges pick up no dark or light fringe
- A mild unsharp on the **colour channels only** to restore vector crispness
  lost to bitmap enlargement. Hue is untouched; alpha is untouched.
- On screen it is drawn at 516 px wide — i.e. **below** the cached master's
  1410 px, so the final pixels are a downscale of the enlargement and stay crisp.

## What was *not* done

- Not screenshotted
- Not OCR'd, retyped, redrawn, or re-vectorised
- Not AI-generated or regenerated
- Colours not altered, shifted, or re-mapped
- Not stretched, warped, cropped, simplified, or reinterpreted
- Transparency preserved throughout
- **No internal element of the mark is animated.** The logo enters as one
  protected asset: opacity 0→1 and a uniform 0.972→1.000 scale over 0.46 s,
  applied to the whole bitmap. After 43.41 s it is completely static.

## On-screen hold

Enters 42.95 s, settled 43.41 s, film ends 47.70 s
→ **4.29 s fully readable and unobstructed** (requirement: ≥ 4 s).

Nothing is composited over the logo at any point; the brand card carries no
botanical or particle element inside the logo's bounding box after it settles.

## Verification

`docs/review/logo-verify.jpg` renders the downloaded file over light and dark
grounds beside a crop lifted from the finished video, for side-by-side
comparison against the live site header.
