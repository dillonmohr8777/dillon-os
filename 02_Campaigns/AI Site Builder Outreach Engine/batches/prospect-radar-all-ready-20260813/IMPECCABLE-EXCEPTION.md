# Impeccable detector exception

Date: 2026-08-13 ET
Scope: the consolidated private review release only

`npx impeccable detect --json --no-advisory <release-dist>` completed with exit code `2` and 6,626 findings across 244 compiled legacy files. The largest groups were low contrast, cramped padding, legacy decorative effects, tracking, motion, and visual-style heuristics. This detector result is preserved at `C:\Users\dillo\Documents\Codex\work\prospect-radar-all-245-20260813\IMPECCABLE-DETECT.json`.

This is a narrow exception for the following reasons:

1. The release consolidates 238 previously created, intentionally varied private concept sites from many historical batches. It does not introduce or replace one shared visual identity.
2. Rewriting every historical visual world to satisfy cross-site taste heuristics would materially change the prospect concepts and is outside the call-readiness task.
3. The 232 findings that name the new `.m360-call-ready` section as cramped padding are detector false positives. The section declares responsive inset padding, and the desktop and mobile screenshots show the inset. The local browser gate also confirms no document or heading overflow.
4. Functional and call-critical gates were run on every canonical site at three viewport sizes: correct phone, directions, map, title, noindex, one heading, landmarks, local assets, alt text, named controls, 44 pixel targets, reduced motion, overflow, page errors, and console errors.
5. Every canonical production page and every referenced local production asset passed live readback after deployment.

The exception does not waive per-site final production review. These pages are private, noindex sales concepts. Any selected concept must receive a focused brand, content, contrast, accessibility, form, analytics, and client approval review before it becomes the business's production site.
