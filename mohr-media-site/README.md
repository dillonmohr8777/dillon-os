# Mohr Media Website

Premium, motion-heavy Next.js marketing site for Mohr Media.

## Stack
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 3
- Framer Motion 11
- Lucide icons

## Run
```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Structure
```
app/
  layout.tsx       Inter font + metadata
  page.tsx         Homepage composition
  globals.css      Design tokens + base styles
components/        13 section components
lib/motion.ts      Shared Framer Motion variants
tailwind.config.ts Design system
```

## Color system
- Navy `#0B1F3A` (primary)
- Electric `#2F6BFF` (CTA / accent)
- Fog `#F5F7FA` (background)
- Ink `#1E293B` (text)
- Mist `#E6EEFF` (light accent)
