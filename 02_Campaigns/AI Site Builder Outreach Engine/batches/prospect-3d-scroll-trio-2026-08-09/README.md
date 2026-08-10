# Prospect Radar Three.js Scroll Trio

Builds 166–168 for the existing Momentum 360 Prospect Radar host.

The scroll experience was rebuilt around the reference's motion grammar — plates
composited inside the Three.js scene, editorial frames as world-space panels with
projected captions, and a beat-timed camera route. See
[`KAGE-REBUILD.md`](./KAGE-REBUILD.md) for what changed, why, and what is still
outstanding.

## Routes

- `/labs/prospect-3d-scroll-trio/`
- `/sites/maclaren-kitchen-bath/`
- `/sites/golden-eagle-jewelry/`
- `/sites/morton-electric-pool-spa/`

The three prospect routes are overlays. The deployment composer starts from the verified 30-route handoff, replaces only those three route directories, adds the lab route and shared hashed assets, and updates the matching hub badges.

## Local build

```powershell
npm install
npm run build
npm run qa
npx vite preview --host 127.0.0.1 --port 4177 --strictPort
```

The texture generator writes seven deterministic local WebPs before every build. The pages have no remote runtime assets or application backend.

## Compose the 30-route deployment

Use a short deployment-output path on Windows so legacy asset paths stay below the filesystem path limit.

```powershell
npm run compose -- `
  "C:\path\to\verified-30-route-handoff" `
  "C:\short\path\to\deploy-site"
```

The command fails if the base does not contain exactly 30 child routes with index files, any of the three overlays is missing, or any matching hub badge fails to update.

## Release boundary

- Baseline count is treated as 165; this package registers 166–168 in `BUILD-MANIFEST.json`.
- The target is the existing Netlify site `momentum-prospect-radar-next10-2026-08-08`.
- All pages stay noindex and mail hold.
- Addresses come from the August 9 handoff. All current services, hours, availability, contacts, prices, inventory, and business claims require direct confirmation.
- No changes to `main` are part of this package.
