# Shadow Heating & Cooling — Website

A single, self-contained HTML file. **No build, no dependencies, no internet, no login.**
Three.js, the fonts, and every image are baked in.

## See it

```bash
open index.html            # just open it in a browser (macOS)
# xdg-open index.html      # Linux
# start index.html         # Windows
```

Or serve it locally:

```bash
npm start                  # http://localhost:3000
# or: python3 -m http.server 3000
```

## Put it online

It's one static file — drag `index.html` onto **https://app.netlify.com/drop**, or push
it to GitHub Pages / Vercel / any static host. Rename to `index.html` (already is) and
you're live.

## Edit it

See **[AGENTS.md](./AGENTS.md)** for a full map. In short: page content is in the JS
data arrays inside `index.html`; brand colors are the CSS variables at the top; images
live in the `window.SHADOW_IMG` object as data URIs.

## What's in it

3D AC-condenser hero (Three.js) · real logo · fire/ice/mist **bear** service imagery ·
draggable thermostat dial · packages, reviews, FAQ, service-area map · and **Bean**, the
Chief Comfort Officer 🐈‍⬛.

- Phone **(847) 757-9450** · **Shadowhvac1@gmail.com** · 334 E Grove, Hampshire, IL 60140
