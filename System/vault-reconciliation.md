---
tags: [system, reconciliation]
created: 2026-05-29
author: vault-reconciliation (analysis only — no files merged/deleted)
---

# Vault Reconciliation: dillon-os vs mohr-vault

> **Scope:** Analysis only. Nothing was merged, moved, or deleted. This compares the two
> overlapping Obsidian vaults and gives a consolidation plan so Dillon can pick one source
> of truth without losing anything.
>
> - **Vault A — dillon-os:** `/home/user/dillon-os/`
> - **Vault B — mohr-vault:** `/home/user/mohr-vault/vault/`

---

## 1. Recommendation

**Make dillon-os the single source of truth.** Consolidate mohr-vault *into* it.

Why:
- **Breadth + live operational data.** dillon-os carries everything mohr-vault has *plus* a
  populated `Client Index.md` (rates, start dates, per-client service lines), per-client
  subfolders (`overview / contact-info / brand-guidelines / active-campaigns / content-calendar / notes`),
  flat client `.md` notes for ~28 entities, `02_FullTimeJob/AlignHCM/`, `05_Book/`,
  10 finished `SEO/AlignHCM/Blogs/`, a richer `Reports/2026-05-rollup.md` (143 vs 92 lines),
  `Daily-Briefs/`, `Dashboard.md`, and a live memory file at `System/claude-memory-sync.md`
  (dated current client state). mohr-vault has none of the per-client subfolder content,
  no flat client notes, and no Align/Book/SEO-blog material.
- **mohr-vault is the older scaffold, not the current workspace.** Its agent log
  (`11_Agents/memory-log.md`) and `Reports/system-insights.md` are both dated **2026-04-15**;
  it is full of empty `.gitkeep` placeholder folders (`Ads/`, `Reports/`, `SEO/` per client,
  `05_Offers/`, `06_Personal/`, `07_Daily_Notes/`, `08_Assets/`, `09_Transcripts/`). It reads
  as a structural integrity pass that was never backfilled with the day-to-day work.

**Important caveat (do not ignore):** mohr-vault is *not* strictly a subset. For several
clients its strategy files are **more complete** than dillon-os's, and it holds unique
campaign/book assets. Those must be carried over before mohr-vault is retired — see §2 and §4.
The naive "dillon-os is richer so just keep it" read is wrong for those specific files.

---

## 2. What each vault has that the other lacks

### A. In dillon-os, NOT in mohr-vault
- **Per-client subfolder content** — `overview.md / contact-info.md / brand-guidelines.md /
  active-campaigns.md / content-calendar.md / notes.md` for every client (mohr-vault clients
  only have `Agent Memory.md`, `Reporting Log.md`, and empty `Ads/Reports/SEO` stubs).
- **Flat client notes** — ~28 top-level `.md` files in `01_Clients/` (e.g. `Bend Plastic Surgery.md`,
  `AWCI.md`, `Bridge of Hope OTC.md`, `Coach B.md`, `Vanessa.md`, `Next Gen Solutions.md`,
  `PNW Pro Clean.md`, `Blissful Events.md`, `m360-master-contacts.md`). mohr-vault has zero flat client `.md` files.
- **Populated Client Index** — `01_Clients/Client Index.md` with rates + start dates + service lines.
- **Full-time job workspace** — `02_FullTimeJob/AlignHCM/` (overview, brand-guidelines,
  content-calendar, linkedin-calendar, smartcare-notes, team-contacts, notes).
- **Book project** — `05_Book/` (characters, overview, seo-strategy, email-growth-tracker, guest-post-pipeline).
- **Finished SEO blog content** — `SEO/AlignHCM/Blogs/` (10 long-form blog drafts).
- **Live system/memory layer** — `System/` (`claude-memory-sync.md` dated current, `m360-leadership-notes.md`,
  `routine-health.md`, `urgent-replies.md`, `writing-rules.md`), `Daily-Briefs/pulse-today.md`, `Dashboard.md`.
- **Extra SOP** — `04_SOPs/Google Ads + Meta API Connection Setup.md` (no mohr equivalent).
- **Offers** — `05_Offers/Mohr Media Business Plan.md`, `Offer Index.md`.
- **DBA + Personal indexes**, `2026-04-09.md` daily note, `.obsidian/` config + REST API plugin, misc media zips.

### B. In mohr-vault, NOT in dillon-os — **MUST NOT BE LOST IF dillon-os GOES CANONICAL**
- **`00_Memory_File.md`** (288 lines) — the most complete client roster anywhere: per-client
  commission, website, industry, services, geography, **Google Ads Account IDs**, and the
  Momentum 360 / 1099 / Direct / Full-time segmentation, plus Processes / Preferences / Routing Rules.
  dillon-os's `System/claude-memory-sync.md` overlaps but does **not** contain the account IDs
  or the full per-client detail. **High-value — migrate.**
- **Filled-in per-client strategy files** — for **Buzz Bull, Florecita, NKCDC, Jeff Hozias**, the
  mohr-vault copies of `Facebook Ads Strategy.md`, `Creative Angles.md`, `Facebook Ads Testing Roadmap.md`,
  `Facebook Ads Account Notes.md`, and `Agent Memory.md` are **substantially more complete** than
  the dillon-os versions (e.g. `Florecita/Facebook Ads Strategy.md` 50 lines vs dillon's 19;
  `NKCDC/Facebook Ads Strategy.md` 56 vs 19; Buzz Bull `Agent Memory.md` has filled audience/offer/
  creative-angle/campaign-structure detail where dillon's bullets are empty). **This is the single
  biggest loss risk — dillon-os's equivalents are skeletons.**
- **`02_Campaigns/Ironic Ineptocracy - Lifecycle Newsletter.md`** (306 lines) — the lifecycle
  newsletter campaign for Dillon's book (voice/canon, groups/tags, 7-email nurture map, full copy). Unique.
- **`04_SOPs/MailerLite - Ironic Ineptocracy Lifecycle (Hermes Runbook).md`** (90 lines) — the
  build runbook for the Hermes agent to stand the above up in MailerLite. Unique and paired with the campaign.
- **`Reports/system-insights.md`** (vault integrity trend/gap/opportunity analysis, dated 2026-04-15). Unique.
- **`11_Agents/memory-log.md`** (append-only integrity-sync log). Unique.
- **`01_Clients/Bar Crawl USA/SEO/Keyword Map.md` + `Rank Tracking.md`** — only populated
  per-client SEO assets in either vault. Unique.
- **`01_Clients/Buzz Bull/Ads/2026-04 Meta Campaign Build.md`** (322 lines) — detailed Meta build doc. Unique.
- **Templates** — `_templates/seo-tracker.md` (the SEO tracker template), plus
  `decision-log.md`, `action-tracker.md`, `meeting.md`, `weekly-review.md`, `content-idea.md`,
  `session-log.md` — **none of these six exist in dillon-os's `_templates/`.** Migrate the templates.
- **YAML frontmatter on client files** — mohr-vault's `Agent Memory.md` files carry frontmatter
  (`status`, `last_touched`, `next_action`, `due`, `owner`); dillon-os's don't. Minor but worth noting.

---

## 3. Overlap / divergence

**Clients present in both** (same folder name): Bar Crawl USA, Buzz Bull, Florecita,
Hardwood Artisan, Jeff Hozias, Kimberly James Bridal, Link Eze, NKCDC, Omega Landscaping,
Onsite Concrete, Shadow HVAC, Fresh Blends Replenish. (12 — exactly the "12 active accounts"
mohr-vault's system-insights references.)

**Clients only in dillon-os:** AWCI, Bend Plastic Surgery, Blissful Events, Bluegrass Janitorial,
Bok Law, Bridge of Hope OTC, Coach B, Commercial Cleaners Alliance, Next Gen Solutions,
PNW Pro Clean, Vanessa, Dryer Vent John, + Align HCM as a full-time workspace. (mohr-vault has none of these as folders, though several appear in its `00_Memory_File.md`.)

**Naming differences (same client, different label):**
| Entity | dillon-os | mohr-vault |
|---|---|---|
| Kimberly James Bridal | flat note `KJB.md` **and** folder `Kimberly James Bridal/` | folder `Kimberly James Bridal/` |
| Fresh Blends / Replenish | flat note `Fresh Blends - Replenish.md` **and** folder `Fresh Blends Replenish/` (no hyphen) | folder `Fresh Blends Replenish/` (no hyphen) |
| Link Eze | `Link Eze` (also "LinkEZE" in memory-sync) | `Link Eze` |

> Note: even *within* dillon-os the folder name (`Fresh Blends Replenish`) and the flat-note/Index
> link (`Fresh Blends - Replenish`) disagree. Standardize during migration.

**Structural differences:**
- **dillon-os = subfolder-per-client with rich sub-pages** (overview/contact/brand/etc.) **plus** a
  parallel flat `.md` note per client. **mohr-vault = thin folder-per-client** (Agent Memory + Reporting
  Log + empty Ads/Reports/SEO stubs), no flat notes, no sub-pages.
- **Templates:** dillon-os uses Title-Case filenames (`Client.md`, `SOP.md`); mohr-vault uses
  kebab-case (`client.md`, `sop.md`) and has 6 extra template types. Content/shape differs.
- **Shared files that are byte-identical:** 7 of 8 Facebook/Google SOPs in `04_SOPs/` are identical
  across both vaults; `Google Ads Launch SOP.md` differs only in trivial wording. **Takeaway: the
  "filled Facebook SOPs" are NOT unique to mohr-vault — they already exist verbatim in dillon-os.**
  No migration needed for SOPs.
- **Reporting Log / Agent Memory** for the 12 shared clients differ mostly by whitespace and
  frontmatter — *except* the four full-strategy clients (Buzz Bull/Florecita/NKCDC/Jeff Hozias),
  where mohr-vault's content is materially richer (see §2B).

---

## 4. Migration checklist (consolidate INTO dillon-os)

Ordered. **Risky steps flagged with ⚠.**

1. **Back up both vaults first.** ⚠ Snapshot/zip `/home/user/dillon-os/` and `/home/user/mohr-vault/`
   before touching anything. (dillon-os has no `.git`; mohr-vault appears git-tracked. Don't rely on undo.)
2. **Copy the unique campaign + book assets** (no conflicts — these don't exist in dillon-os):
   - `02_Campaigns/Ironic Ineptocracy - Lifecycle Newsletter.md`
   - `04_SOPs/MailerLite - Ironic Ineptocracy Lifecycle (Hermes Runbook).md`
   - `Reports/system-insights.md`
   - `11_Agents/memory-log.md`
   - `01_Clients/Bar Crawl USA/SEO/Keyword Map.md` + `Rank Tracking.md` (create a `SEO/` subfolder in the dillon-os Bar Crawl folder).
   - `01_Clients/Buzz Bull/Ads/2026-04 Meta Campaign Build.md` (create an `Ads/` subfolder).
3. **Copy the missing templates** into dillon-os `_templates/`: `seo-tracker.md`, `decision-log.md`,
   `action-tracker.md`, `meeting.md`, `weekly-review.md`, `content-idea.md`, `session-log.md`.
   ⚠ Decide on a casing convention first (dillon-os uses Title Case) — rename on copy to match, or you'll
   end up with `client.md` and `Client.md` side by side.
4. **Reconcile the four "full-strategy" clients** (Buzz Bull, Florecita, NKCDC, Jeff Hozias). ⚠ **Highest-risk
   step.** mohr-vault's `Facebook Ads Strategy / Creative Angles / Testing Roadmap / Account Notes / Agent Memory`
   are richer. Do a file-by-file diff and **merge the richer mohr content into dillon-os** rather than blind-copy —
   dillon-os may hold newer dated notes in its versions. Do not overwrite without diffing.
5. **Fold `00_Memory_File.md` into `System/claude-memory-sync.md`.** ⚠ These overlap but neither is a
   superset. Carry over what dillon-os lacks — especially **Google Ads Account IDs**, commission figures,
   geography, and the Processes/Preferences/Routing Rules sections. Treat the merged result as the one memory file;
   delete/redirect the other only after confirming nothing dropped.
6. **Dedupe the identical SOPs** — no action needed; 7/8 are byte-identical and `Google Ads Launch SOP.md`
   differs only cosmetically. Keep dillon-os's. Do **not** re-copy mohr's.
7. **Standardize client naming.** ⚠ Renames break `[[wikilinks]]`. Pick one canonical name per client and
   fix folder + flat-note + `Client Index.md` links together:
   - Resolve `Fresh Blends Replenish` (folder) vs `Fresh Blends - Replenish` (flat note/Index link) — pick one.
   - Resolve `KJB` flat note vs `Kimberly James Bridal` folder — pick one display name, keep the other as an alias.
   - Search-and-replace links after each rename; verify no orphaned links remain.
8. **Decide on per-client SEO/Ads/Reports subfolders.** mohr-vault created these empty for all 12 clients.
   If adopting the convention, create the (non-empty) ones in dillon-os as you migrate real content (steps 2/4);
   skip empty `.gitkeep` stubs.
9. **Verify, then retire mohr-vault.** ⚠ Only after steps 2–8 are confirmed: archive mohr-vault read-only
   (don't delete immediately). Open it in Obsidian, confirm no dangling links, then mark deprecated.
10. **Initialize git on dillon-os** (it currently has none) so the consolidated vault is version-controlled going forward.

---

## 5. Open questions for Dillon

1. **Memory file:** Is `00_Memory_File.md` (mohr) or `System/claude-memory-sync.md` (dillon-os) the one your
   Claude agents actually read today? The merge in step 5 needs to land in whichever your automations point at.
2. **Strategy files:** For Buzz Bull / Florecita / NKCDC / Jeff Hozias — is mohr-vault's richer version the
   *current* truth, or did you continue editing the dillon-os copies after the split? This determines merge direction.
3. **Naming:** Final canonical names — `KJB` or `Kimberly James Bridal`? `Fresh Blends Replenish` or
   `Fresh Blends - Replenish`? (Affects every wikilink.)
4. **Structure:** Keep dillon-os's dual model (rich sub-pages **and** flat `.md` per client), or collapse to one?
   Maintaining both is extra upkeep.
5. **Empty scaffolding:** Adopt mohr-vault's per-client `SEO/ Ads/ Reports/` subfolder convention vault-wide,
   or only create those folders where real content exists?
6. **Ironic Ineptocracy:** Is the lifecycle newsletter still active/intended to ship via the Hermes runbook?
   If yes, it should live in canonical `02_Campaigns/` and link to the SOP.
7. **Templates:** Standardize on Title Case (dillon-os) or kebab-case (mohr-vault) for `_templates/`?
8. **mohr-vault git history:** mohr-vault is git-tracked and dillon-os is not. Do you want to preserve that
   history when consolidating, or start fresh?
