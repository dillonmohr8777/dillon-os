---
tags: [capture, research, sourcing, franchise]
campaign: "[[Growth Workshop]]"
playbook: "[[02_Campaigns/Growth Workshop/Franchise Email Sourcing Playbook]]"
created: 2026-09-14
requested_by: Sean, #360marketing 2026-09-14 14:11
---

# Gym and automotive franchise probe

Sean asked for franchise lists in two new categories. Lane B one-page probe run
against 25 brands on 2026-09-14. Counts and methods only; contact rows live in
`12_Brain/private/contacts/` and the Drive tracker, never in this repo.

## Result in one line

**Fitness works. Automotive does not.**

## Fitness — two brands confirmed

| Brand | Mechanism | Rows | MX | Send? |
|---|---|---|---|---|
| Snap Fitness | first-party US gym locator, `{city}@snapfitness.com` | **458** | `mx_ok` | yes, location mailbox |
| Workout Anytime | locator payload embedded in `/locations/`, one JSON object per club carrying a literal `email` | **194** | **194/194 `mx_ok`** | yes, location mailbox |

Snap Fitness was already built 2026-09-01 for Jason
(`clients/momentum-360/deliverables/2026-09-01-jason-snap-fitness-franchise-emails/`,
commit `39a0c69`). It was not in Sean's 2026-08-28 batch, which was print, signs,
senior care and restoration only.

Workout Anytime harvested today: 194 unique mailboxes across 23 states.
GA 40 · TN 31 · NC 23 · FL 22 · AL 15 · TX 13 · VA 11 · SC 9. **PA/NJ/DE is only
4**, so this list does not fit the usual home-region-first prioritisation. It is
a Southeast list.

Both are `role_type: location_mailbox`, not owner-named. Same tier as the
Mosquito Squad and Comfort Keepers rows in the existing 720.

### Fitness dead ends — do not re-probe

Locator is a JS shell with no literal mailbox on the index: **Anytime Fitness,
Planet Fitness, Crunch, Gold's Gym, Retro Fitness, Fitness 19, 9Round, Burn Boot
Camp, F45, Club Pilates, Jazzercise, UFC Gym, The Max Challenge.** Title Boxing
Club prints only the corporate `info@` mailbox, which is franchisor tier and off
the send file.

## Automotive — zero yield, twenty brands

**No national automotive franchise probed prints a franchisee mailbox on its
locator or its location pages.** Every one is a JS-rendered store finder with
phone and form only, which is consistent with the category: auto service sells on
walk-in and phone, so the brands publish numbers rather than addresses.

Probed, index and where reachable a location page, all zero: **Christian Brothers
Automotive, Tuffy, Precision Tune, Tint World, RNR Tire Express, Midas, Meineke,
AAMCO, Milex / Mr. Transmission, Grease Monkey, Honest-1, Victory Lane, Auto-Lab,
Mighty Auto Parts, Line-X, CARSTAR, Maaco, Big O Tires, Matco Tools, Snap-on.**
Ziebart prints only `customerservice@ziebart.com`, franchisor tier.

Several returned 404 on the conventional `/locations/` path (Tuffy, AAMCO,
Honest-1, Victory Lane), meaning the finder sits behind a different route; none
of those brands showed a mailbox on the routes that did resolve.

### What automotive would actually take

Not a Lane B crawl. The options, in cost order:

1. **Lane A, FDD Item 20.** [16 CFR 436.5(t)](https://www.law.cornell.edu/cfr/text/16/436.5)
   requires franchisors to list current franchisees by **name, outlet address and
   telephone**. Minnesota CARDS and Wisconsin DFI both serve no-login PDFs. That
   gives owner names and phones for these brands, and **no email** — Item 20 does
   not require one. It is a call list, not a send list.
2. **Independent shops instead of franchises.** Independents publish their own
   mailboxes because they own their own sites. OSM discovery already supports
   this: `node _os/automation/bin/discover-prospects.js --market PHL` without
   `--keep-chains`. Arguably the better ICP anyway, since an independent shop
   buys marketing and a Midas franchisee often cannot.
3. **Paid enrichment.** Gated behind the free pilot producing send data, per the
   playbook's money rule. Not now.

## Method note

The Workout Anytime parse initially returned zero because the location objects
nest braces and the first regex could not bound them. The builder **failed loudly
and refused to write the file** rather than shipping an empty CSV. Replaced with
a brace-scanning parser that tracks string state. Builder kept at
`12_Brain/private/contacts/` alongside the output.

Rule confirmed again: a sourcing script that can return zero must treat zero as a
failure, not a result.
