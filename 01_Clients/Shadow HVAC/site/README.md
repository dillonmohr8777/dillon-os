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

Deploy to Netlify (config is in `netlify.toml`):

```bash
export NETLIFY_AUTH_TOKEN=xxxx   # from Netlify → User settings → Personal access tokens
npm run deploy                    # publish to production
# npm run deploy:draft            # preview URL first
```

Or with no token: drag `index.html` onto **https://app.netlify.com/drop**, or connect the
repo in the Netlify UI (Base directory `01_Clients/Shadow HVAC/site`, publish `.`).
See **[AGENTS.md](./AGENTS.md)** for the full deploy guide.

## Edit it

See **[AGENTS.md](./AGENTS.md)** for a full map. In short: page content is in the JS
data arrays inside `index.html`; brand colors are the CSS variables at the top; images
live in the `window.SHADOW_IMG` object as data URIs.

## What's in it

3D AC-condenser hero (Three.js) · real logo · fire/ice/mist **bear** service imagery ·
draggable thermostat dial · packages, reviews, FAQ, service-area map · and **Bean**, the
Chief Comfort Officer 🐈‍⬛.

- Phone **(847) 757-9450** · **Shadowhvac1@gmail.com** · 334 E Grove, Hampshire, IL 60140
