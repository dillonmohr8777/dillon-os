# Codex Handoff — IMMOHRTAL Campaign

Paste-ready prompt for Codex. Claude owns the design lane; this brief
hands Codex the non-design lanes with full context.

---

You are joining the marketing campaign for IMMOHRTAL — the rap project of
Dillon Mohr, a 28-year-old CMO from Erie, PA (now Pittsburgh). Debut album:
**Dance With The Delusional** (11 tracks, two features by King Keev, one by
Ted Moon). Everything lives in the `dillonmohr8777/dillon-os` repo on branch
`claude/immortal-marketing-assets-8zrmtr` (PR #158).

## The campaign in three lines

- **Angle:** "The delusion is the point." A CMO who markets everyone else,
  finally selling the one thing he can't be objective about. He's almost 29
  and doing it anyway.
- **Campaign line:** **IF NOT NOW, WHEN.** — closes every asset and caption.
- **Voice rules:** confess, don't promote; specifics (Erie, 814, notebooks,
  Mac Miller's *Faces*) over grind-talk; self-aware about himself, never
  ironic about the music.

Read these before doing anything:
- `02_Campaigns/IMMOHRTAL/IMMOHRTAL Brand Direction.md` — the campaign bible
- `02_Campaigns/IMMOHRTAL/Tracks/` — per-track studies + raw transcripts
- `immohrtal-site/src/content/album.ts` — canonical copy, tracklist, contact

## What already exists (do NOT rebuild — design is Claude's lane)

- `02_Campaigns/IMMOHRTAL/asset-studio/out/` — ~50 finished assets:
  quote cards, story covers, YouTube thumbnails, channel banners, OG image,
  tracklist card, release announcement pair (pre-save/out-now), origin-story
  carousel (5 slides), Split Series track cards, 8 Spotify Canvas loops,
  9 captioned vertical clips, `IMMOHRTAL-EPK.pdf` (press kit).
- The artist site (`immohrtal-site/`) — React/Vite, deployed statically,
  has a dormant audio player wired for release day.

## Your lanes

1. **Outreach engine.** Build the curator/press target list (Spotify playlist
   curators via SubmitHub/Groover/Daily Playlists, hip-hop blogs, PA-regional
   press, college radio). Write the pitch email sequences (publicist, blog,
   curator variants + follow-ups) using the EPK as the attachment and the
   voice rules above. Track everything in a CRM table in the vault
   (`02_Campaigns/IMMOHRTAL/Outreach/`).
2. **AEO/GEO content.** The site has a blog engine. Write question-shaped
   posts ("Who is IMMOHRTAL?", track-by-track breakdown, the Mac Miller
   influence) and JSON-LD structured data (MusicGroup/MusicAlbum/
   MusicRecording + Person linking Dillon Mohr ↔ IMMOHRTAL). Draft
   MusicBrainz/Wikidata/Genius/Discogs entries with identical facts.
3. **Content calendar + captions.** 60–90 day rollout calendar keyed to the
   four pillars (The Split / The Bars / The Making / The Why). Captions for
   the ~50 existing assets, every one closing on IF NOT NOW, WHEN.
4. **Spotify editorial pitch copy** (500 chars) ready for the day
   distribution goes live.

## Hard rules

- No fake accounts, no astroturfing, no stream manipulation — one real
  account per platform, genuine outreach only.
- Lyric quotes in `Tracks/Raw Transcripts (to correct).md` are AUTO-TRANSCRIBED
  drafts. Never publish a bar Dillon hasn't corrected.
- Unreleased audio never gets committed to public surfaces or deployed on
  the site before release day.
- Booking/press contact: immohrtal.llc@gmail.com · (814) 873-5333 ·
  @immohrtal everywhere. Streaming links don't exist yet — say "SOON",
  never fabricate URLs.

Start with lane 1 (outreach list + email pack) and lane 3 (calendar), and
put deliverables in `02_Campaigns/IMMOHRTAL/` alongside the existing work.

---

## Shared Claude and Codex folder map

Use these paths so both agents can work without creating disconnected copies:

| Codex output | Canonical location |
|---|---|
| Outreach lists, pitch tracking, and CRM files | `02_Campaigns/IMMOHRTAL/Outreach/` |
| Created entity-profile URLs | Append to `02_Campaigns/IMMOHRTAL/Entity Pack.md` under a `Created profiles` section, then wire verified URLs into site schema |
| Captions, calendars, publishing plans, capture handoffs, and posting logs | `02_Campaigns/IMMOHRTAL/Social/` |
| Email and ESP work | `02_Campaigns/IMMOHRTAL/Email/` |
| Site code | `immohrtal-site/` |
| Rendered visual assets | `02_Campaigns/IMMOHRTAL/asset-studio/out/` |
| Campaign-wide status, manifests, or unfinished notes | `02_Campaigns/IMMOHRTAL/` as clearly named Markdown files |

Claude owns the visual design lane. Codex should consume the approved visual system and must not change `asset-studio/` render scripts or the site's design system without flagging the change first. Site changes must preserve the SubPage/spine convention and dash-free copy rule.

Before shared work is pushed, update from `main`, keep commits small and campaign-scoped, and confirm no unrelated files are included.

## Codex deliverables added July 15, 2026

### Social operating system

- `Social/Content Upgrade Plan.md`
- `Social/Claude Production Briefs.md`
- `Social/Social Scale Plan.md`
- `Social/30-Day Content Calendar v2.csv`
- `Social/Weekly Capture Handoff.md`
- `Social/Weekly Scorecard.csv`
- `Social/Profile Links.csv`

### Viewable books

- `Social/IMMOHRTAL Content Upgrade and Production Book.pdf`
- `Social/IMMOHRTAL Complete Campaign Handoff.pdf`

### Campaign-wide records

- `Codex Implementation Status.md`
- `Codex Source Manifest.md`

These files are planning, production, and review artifacts. Their presence in the repository is not approval to publish social posts, send outreach, launch ads, deploy site changes, or claim unverified release facts.
