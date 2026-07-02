# Mohr Media Website (redesign)

Single-file static site: `index.html`, zero build step, fully self-contained apart from Google Fonts.

## Deploy
• Vercel: `vercel deploy mohr-media-site` from the vault root, or point a new Vercel project at this folder.
• Netlify: drag the folder into the Netlify drop zone.
• Any static host works. Nothing to compile.

## Edit points
• Brand tokens live in the `:root` block at the top of the CSS: paper, ink, machined viridian accent, and the single hot copper reserved for CTAs.
• Offer pricing on the "Systems catalog" plates comes straight from the Mohr Media Business Plan (audits $197 to $997, builds $1,500 to $5,000, retainers $500 to $3,000/mo, products $27 to $97). Change the plan, change the plates.
• The CTA button currently uses `mailto:dillon@mohrmedia.co`. Swap in the real intake address or a form endpoint when one exists.
• Fonts: Bricolage Grotesque (display), Archivo (body), IBM Plex Mono (spec labels), loaded from Google Fonts with safe fallbacks.
