---
name: "momentum-client-intake"
description: "Create a complete Momentum client record in one pass — vault record, registry entry, and Slack channel link — so a new client never ends up with a live channel and no file behind it. Use this when Momentum signs a new client, when someone says \"we just closed X\" or \"set up X\" or \"onboard X\", and critically when any other work reveals that an existing client has no vault record (Nexla and four others are known to be in this state). Also use for a backfill sweep across clients with channels but no records. Not for cold prospects or for updating an existing complete record."
---

# Momentum Client Intake

Create a client's operational record completely, in one pass, so nothing is left half-created.

## Why this exists

An audit found five clients with live Slack channels and no vault record — Nexla among them. That is the failure mode this closes. Records go missing because onboarding is three separate acts (make the channel, make the file, add to the registry) performed at three different moments by whoever is around, and the last two get skipped once the channel exists and work starts flowing. The channel makes it *feel* onboarded.

So intake is one atomic pass. If you cannot complete all three parts, say which part failed and leave the rest in a state someone can finish, rather than declaring it done.

## Step 1: Locate the operations repo

The `client-operations-canonical` repo holds the vault and registry. Look for it:

1. Any connected folder named `client-operations-canonical`
2. `C:\Users\dillo\Claude\worktrees\repo-analysis-1bien2\client-operations-canonical`
3. Ask Dillon and request access

It may be a git worktree, which can be pruned or locked by another session. If locked, read files directly instead of running git commands, do not remove lock files, and if you cannot write, produce the record content and tell Dillon where to place it.

Before writing anything new, read one or two existing client records. Match their structure exactly — a record in a different shape than its siblings is nearly as bad as no record, because tooling and eyeballs both expect the pattern.

## Step 2: Gather what you need

Ask Dillon for whatever is missing rather than guessing. The fields that matter:

**Identity** — legal name, trading name, city, industry vertical, website
**Contact** — primary contact name, role, email, phone
**Engagement** — service lines purchased, monthly retainer, start date, contract length or term
**Brand** — logo files, palette, typefaces, existing site, any brand guide
**Channels** — Slack channel, drive folder, ad accounts, Google Analytics and Search Console properties, Google Business Profile
**Commitments** — anything promised during the sale that now has to be delivered
**Owner** — who at Momentum runs the account

Two of these are worth pushing on because they cause pain later. **Service lines and spend** determine what every future report is measured against, so get them exact rather than approximate. **Commitments made during the sale** are the ones that go unrecorded and then resurface as an angry email — write them down even if they seem small.

Match service lines to Momentum's actual list: SEO (local, technical, ecommerce, industry, city, audits, Google Business Profile); Social (Facebook, Instagram, TikTok, Pinterest, LinkedIn); PPC (Google, Facebook, Instagram, Microsoft, Amazon); Design (web, WordPress, Shopify, UI/UX, logo, graphic, brochures, conversion design); AI Marketing; Content (virtual tours, HD photography, drone video, blogging, email); Fractional CMO. If it is virtual tours or property marketing, it likely belongs to Momentum 360 rather than Momentum Digital — flag which entity holds the relationship.

## Step 3: Write all three artifacts

**The vault record** — the full file, in the same shape as existing records.

**The registry entry** — the client's row in whatever index the repo keeps. Find it and add to it; a record nobody can discover is only half a record.

**The channel link** — connect the Slack channel to the record in both directions where possible: the record names the channel, and the channel gets the record location (canvas, bookmark, or pinned message). One-directional linking is how the current gap happened. If posting to Slack, remember that sending a message on Dillon's behalf needs his explicit go-ahead first — draft it and ask.

Add a **tracking baseline** while you are here: what is measurable today, what is not yet instrumented, and specifically whether conversions can be matched back to named leads. That question is the single most-promised and least-delivered thing across the roster, and answering it at intake is far cheaper than answering it in month four under pressure.

## Step 4: Confirm what you actually did

Report each of the three parts separately with its real status. "Onboarded" as a single word is how partial work gets mistaken for complete work.

> Nexla — vault record created at clients/nexla.md. Registry updated. Slack #nexla linked in record; the reverse link needs to be posted by you (draft ready). Missing: monthly spend, GA4 property ID. Conversion tracking: not yet instrumented, no named-lead match-back available.

## Backfill mode

When sweeping the known gap rather than onboarding someone new: list every client with a Slack channel, compare against the registry, and report the diff before creating anything. Then work through the missing ones one at a time. Backfilled records will be thinner than fresh ones — that is fine and expected. Mark the unknown fields as unknown rather than reconstructing them from guesswork, and note which ones need Dillon to fill in.

