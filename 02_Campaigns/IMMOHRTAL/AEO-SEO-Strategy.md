# IMMOHRTAL — AEO / SEO Strategy & Site Audit

Grounded in real search data pulled from Google + YouTube Autocomplete
(free, no API key — see `asset-studio/keywords.py`). Full results in
`asset-studio/data/keywords.json`.

---

## 1. Site health check ("/debug")

There's no `/debug` route (404). Ran a full live health pass instead — all green:

| Check | Result |
|---|---|
| Home page | 200 |
| `/video.html` (new) | 200 |
| Audio previews | 200 |
| Newsletter form POST | 200 (registered, capturing) |
| Gmail notifications | on → dillonmohr8777@gmail.com |
| Auto-deploy (git → Netlify) | working (video + AEO both shipped via push) |

The site is operating correctly.

## 2. What I shipped this pass (live now)

- **Per-track `MusicRecording` schema** — all 11 tracks in the album graph, so
  search/AI engines see each song as an entity.
- **`FAQPage` schema** — Who is IMMOHRTAL / Where from / What is the album /
  Influences. AI answer engines (ChatGPT, Perplexity, Google AI Overviews)
  read these directly.
- **`llms.txt`** — a plain-text entity brief at `/llms.txt` for LLM crawlers.
- **Keyword-tuned meta** — title/description now carry "Pittsburgh," "Erie,"
  and the Mac Miller lineage.

## 3. The free keyword engine

`asset-studio/keywords.py` — no key, no cost. Pulls live suggestions from
Google + YouTube Autocomplete, expands each seed with a–z and question-word
modifiers, weights YouTube (music discovery skews there), and ranks results.
Re-run anytime: `python3 keywords.py`. This is the "actually free API" — the
same feed that powers the search box, which reflects real query demand.

(Paid tools like DataForSEO/Ahrefs give exact volumes; for a launching artist,
autocomplete demand + owning low-competition terms matters more than volume
numbers, so we start free and only pay once there's traffic to optimize.)

## 4. What the data says — winnable clusters

Ranked by *fit × winnability* for a brand-new artist:

### 🟢 OWN THIS: "Erie, PA rap"
`erie pa rap` (55), `erie rap`, `rappers from erie pa`, `erie pa rappers`.
Erie has almost no rap search competition. Dillon is from Erie (the 814). He
can become **the** answer for "rappers from Erie" with one good page. Highest
ROI on the board.

### 🟢 HIGH FIT: "rappers like Mac Miller"
`rappers like mac miller` + `reddit` / `white` / `similar to` (12 each),
`how to rap like mac miller` (10), `artists like mac miller and frank ocean`.
This is Dillon's whole origin story. Perfect AEO topic and honest positioning.

### 🟡 CONTEXT/ENTITY: "Pittsburgh rappers"
`pittsburgh rappers` (37), `famous rappers from pittsburgh` (18),
`rappers from pennsylvania` (32), `pittsburgh rapper jimmy wopo` (26).
High volume, more competition. Play here as *entity association* — appear in
the Pittsburgh/PA rap conversation alongside the names people already search.

### 🟡 GENRE POSITIONING
`lyrical rap songs` (46), `sad rap songs album` (37), `underground rap 2026`.
Use as tags/keywords and framing, not standalone pages.

## 5. Recommended next builds

**A. Three AEO blog posts** (drafts below — the blog engine turns each into a
permalink page with `BlogPosting` schema + sitemap entry automatically):

1. **"Rappers From Erie, PA: The 814 Hip-Hop Story"** → owns the Erie cluster
2. **"Rappers Like Mac Miller: An Honest List"** → the Mac cluster + origin story
3. **"IMMOHRTAL, Explained: Who, Where, and Why"** → entity/brand FAQ page

**B. Visible FAQ section on the homepage** — mirror the FAQ schema in real
on-page content (Google needs visible text for FAQ rich results; LLMs already
read the schema). Small React add to the Story section.

**C. Entity groundwork (off-site, high AEO impact)** — create matching profiles
so every engine agrees who IMMOHRTAL is: Genius artist page, MusicBrainz,
Wikidata, Discogs. Then add their URLs as `sameAs` in the Person/MusicGroup
schema. This is the single biggest lever for AI-answer accuracy.

**D. Real social profiles** — the site's social links are still empty (`null`).
Claim @immohrtal everywhere and wire the URLs in; add as `sameAs` too.

**E. Backlinks** — the honest kind: the "CMO who secretly made a rap album"
story pitched to marketing/Pittsburgh-music press. Each real writeup is a
backlink and an entity citation.

---

## 6. Blog post drafts (pending your fact/voice approval)

> These fit `src/content/blog.ts` exactly. Say the word and I publish — they
> auto-deploy as permalink pages. Written grounded in known facts; correct
> anything before it goes live.

### Draft 1 — Rappers From Erie, PA
- **slug:** `rappers-from-erie-pa`
- **answer (lede):** "Erie, Pennsylvania — the 814 — isn't a city people
  associate with rap. That's exactly why I claim it. I'm IMMOHRTAL, I'm from
  Erie, and this is the hometown that's all over Dance With The Delusional."
- **sections:** The 814 / Why Erie shows up in the music / From Erie to Pittsburgh.

### Draft 2 — Rappers Like Mac Miller
- **slug:** `rappers-like-mac-miller`
- **answer (lede):** "If you're looking for rappers like Mac Miller, you're
  looking for honesty, humor, damage, and craft in the same bar. He's the
  reason I rap. Here's what that lineage actually means — and where I fit."
- **sections:** What made Mac different / Artists in that lineage / Carrying it
  forward without copying it.

### Draft 3 — IMMOHRTAL, Explained
- **slug:** `who-is-immohrtal`
- **answer (lede):** "IMMOHRTAL is me, Dillon Mohr — a chief marketing officer
  from Erie who finally made the record. Here's the short version of who,
  where, and why."
- **sections:** Who / Where I'm from / The album / If not now, when.
