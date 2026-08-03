/**
 * Intrinsic dimensions for every bitmap on the page, measured from the files in
 * public/assets. v1 shipped every image without width/height, so the awards row
 * and the proof stage both reflowed on load. Kept out of content.ts so that file
 * stays byte-identical to v1.
 */
export const imageSize: Record<string, { width: number; height: number }> = {
  '/assets/brand/need-momentum-logo.png': { width: 800, height: 172 },
  '/assets/brand/momentum-360-logo.png': { width: 950, height: 204 },
  '/assets/proof/residential-townhome.jpg': { width: 1600, height: 900 },
  '/assets/proof/commercial-skyline.jpg': { width: 1200, height: 804 },
  '/assets/proof/hospitality.jpg': { width: 800, height: 521 },
  '/assets/proof/automotive.jpg': { width: 1280, height: 365 },
  '/assets/proof/meeting-space.jpg': { width: 512, height: 384 },
  '/assets/founders/mac-frederick-workshop-2026.webp': { width: 1122, height: 1402 },
  '/assets/founders/sean-boyle-founder.webp': { width: 1122, height: 1402 },
  '/assets/badges/inc-5000.png': { width: 363, height: 363 },
  '/assets/badges/philly-100.png': { width: 891, height: 892 },
  '/assets/badges/google-partner.webp': { width: 89, height: 50 }
};

export function sizeOf(src: string) {
  return imageSize[src] ?? { width: 1200, height: 800 };
}
