# Opus 5 prompt â€” Prospect Radar cinematic rebuild

You are the lead creative technologist and senior frontend engineer for this release. Take full creative ownership. Do not invoke, quote, follow, or mention any installed design skill, house-style framework, or canned design checklist. I want your native taste and judgment at full strength.

## The assignment

Rebuild and elevate these three live prospect homepages so they capture the exact motion language, visual confidence, pacing, spatial depth, and premium feel demonstrated in the attached screen recording and the original X post:

- Original reference: https://x.com/mengto/status/2085765403729653877?s=46
- Attached screen recording: **treat the attached recording as the primary visual and motion authority**. Study it frame by frame before changing code.

Do not return a concept, critique, wireframe, or plan. Inspect the real project, implement the redesign, generate or source every required visual, run the sites, inspect them in a browser, correct what feels weak, and deliver a finished build.

## Current live builds to inspect first

- Prospect Radar hub: https://momentum-prospect-radar-next10-2026-08-08.netlify.app/
- Three.js experiment index: https://momentum-prospect-radar-next10-2026-08-08.netlify.app/labs/prospect-3d-scroll-trio/
- Build 166 â€” MacLaren Kitchen & Bath: https://momentum-prospect-radar-next10-2026-08-08.netlify.app/sites/maclaren-kitchen-bath/
- Build 167 â€” Golden Eagle Jewelry: https://momentum-prospect-radar-next10-2026-08-08.netlify.app/sites/golden-eagle-jewelry/
- Build 168 â€” Morton Electric Pool & Spa: https://momentum-prospect-radar-next10-2026-08-08.netlify.app/sites/morton-electric-pool-spa/
- Exact deployed snapshot: https://6a792158ced12695fff8cd5c--momentum-prospect-radar-next10-2026-08-08.netlify.app/

The current builds are implementation baselines, not creative ceilings. Keep anything genuinely strong. Replace anything that looks generic, muddy, under-art-directed, fake, stock-like, template-driven, or visibly weaker than the recording.

## Source and deployment

- Repository: https://github.com/dillonmohr8777/dillon-os
- Working branch: https://github.com/dillonmohr8777/dillon-os/tree/feature/prospect-3d-scroll-trio
- Local project root: `C:\Users\dillo\Documents\Codex\2026-08-09\client-prospect-radar-build-count-treated\work\prospect-3d-scroll-trio`
- Site project: `C:\Users\dillo\Documents\Codex\2026-08-09\client-prospect-radar-build-count-treated\work\prospect-3d-scroll-trio\02_Campaigns\AI Site Builder Outreach Engine\batches\prospect-3d-scroll-trio-2026-08-09`
- Existing Netlify site: `momentum-prospect-radar-next10-2026-08-08`
- Netlify site ID: `4c6ea488-5a2f-4bc7-ba54-7d3456784487`
- Current visual release commit: `e3bbd41`
- Current production-QA commit: `7dcf84d`

Continue on `feature/prospect-3d-scroll-trio`. Do not modify or merge into `main`. Preserve all 30 existing prospect routes and publish only to the already mapped Netlify site above after verification.

## Creative target

The result should feel like the same class of experience as the recording, not a loose page that happens to contain Three.js. Derive the system from what the reference actually does: how the subject enters, how scale changes, when the camera moves, how depth is revealed, how copy and interface elements appear, how long each visual beat is allowed to breathe, and how scroll input becomes controlled cinematic motion.

You have permission to substantially rewrite the current visuals, compositions, 3D scenes, motion code, generated imagery, lighting, typography usage, copy hierarchy, and section structure. Surprise me. Push well beyond the current execution while keeping the pages commercially useful for winning each business as a prospect.

Each business still needs its own unmistakable world:

- **MacLaren Kitchen & Bath:** architectural assembly, cabinetry, stone, material precision, room transformation, and finished light.
- **Golden Eagle Jewelry:** raw mineral, cutting, facet, setting, precious metal, optical light, and the emotional finished object.
- **Morton Electric Pool & Spa:** water surface, circulation, hidden plumbing, copper and power, heat or steam, service expertise, and a satisfying complete-system reveal.

Avoid one reusable scene with three color swaps. The motion grammar may be related, but the object language, materials, transitions, camera behavior, and emotional payoff must be business-specific.

## Images and brand authenticity

Create a coherent visual world for each complete homepage, normally using roughly 6â€“8 strong image moments across the page. These must be spaced into the narrative. Do not place four or five conventional photos consecutively and do not turn the page into a gallery.

Use imagery as environmental backgrounds, depth planes, controlled editorial insets, material details, human moments, transition plates, and final reveals. Images should feel art-directed as one campaign. Generate custom imagery, 3D renders, or short motion assets wherever they materially improve the result. Use any available image, video, or 3D generation tools if helpful; no specific vendor is required. Do not accept generic stock photography merely to fill a slot.

Generated image assets must not contain baked-in typography, fake brand names, fabricated logos, watermarks, UI, or unreadable signage. Keep page typography and interface text live in HTML/CSS.

Use each business's exact verified brand identity wherever an authentic asset exists. Fetch logos from official or business-controlled sources and preserve their real proportions. Never invent, approximate, redraw from memory, or silently substitute a logo. If no authentic logo can be verified, use an excellent text lockup and clearly document that decision.

The current project already contains self-hosted display and text fonts. Use the real font files and improve their application if necessary; do not replace them with generated lettering or a generic system-font page.

## Interaction standard

Match the recording's felt behavior with real implementation, including the parts that are easy to miss: scroll damping, pinned spatial continuity, deliberate camera curves, foreground and background parallax, occlusion, material response, lighting changes, restrained interface overlays, and decisive scene transitions. The experience should remain coherent when the user scrolls quickly, slowly, reverses direction, resizes the window, or lands mid-page.

Use real 3D where it improves the illusion and composited imagery where that produces a better final frame. The user should not be able to tell where the 3D ends and the editorial art direction begins. Avoid a conspicuous floating primitive, demo-scene lighting, random particle noise, muddy transparency, cheap bloom, or motion that exists only to advertise the technology.

Design mobile as its own cinematic composition. Do not merely shrink the desktop scene. Preserve readable type, intentional cropping, useful action placement, depth, and a strong final frame. Reduced-motion and WebGL-fallback modes must still feel authored rather than broken or empty.

## Business and page requirements

These are prospect-winning homepages, not standalone art films. Each must communicate what the business does, why its craft or expertise matters, meaningful proof or caveats that can be supported, and a clear next action. Copy should be concise enough to let the imagery breathe. Do not fabricate awards, testimonials, product inventory, service coverage, history, staff identities, warranties, prices, or technical claims.

Use pop-up or heads-up interface elements selectively to clarify materials, processes, transformations, or system states. They should feel native to the cinematic world and useful to the narrative, never like generic dashboard cards pasted over a video.

## Definition of finished

Before delivery, inspect the actual rendered pages at desktop and mobile widths. Verify the complete scroll journey, intermediate states, final states, backward scrolling, keyboard focus, reduced motion, WebGL fallback, layout overflow, image loading, logo fidelity, and browser console. Fix visual weaknesses you notice rather than merely recording them.

Run the project build and existing QA. Confirm that:

- all three redesigned routes and the experiment index return 200;
- all 30 existing prospect routes remain intact;
- all referenced assets load;
- there are no unexpected console or page errors;
- no page has horizontal overflow or clipped primary content;
- generated assets are meaningfully distinct rather than duplicate crops;
- production keeps the existing `noindex` behavior;
- the public Netlify alias shows the new release after deployment.

Commit and push the completed work to `feature/prospect-3d-scroll-trio`, deploy the composed site to the existing mapped Netlify site, and return:

1. The live lab URL and three live build URLs.
2. The final branch commit hash.
3. A compact description of the final creative thesis for each business.
4. A list of generated or newly sourced assets and their provenance.
5. Desktop and mobile verification screenshots.
6. The build, browser-QA, route-preservation, and deployment results.
7. Any factual or brand-asset limitation that remains.

Do not stop at â€œready for approval.â€ Finish the implementation and existing-site deployment unless a genuine authentication or destructive-scope blocker prevents it.

