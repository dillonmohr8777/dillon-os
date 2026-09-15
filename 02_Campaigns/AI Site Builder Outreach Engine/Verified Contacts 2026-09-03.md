---
tags: [campaign, outreach, contacts, research]
campaign: "[[AI Site Builder Outreach Engine]]"
created: 2026-09-03
status: research-complete
note: "Addresses here are PUBLISHED on each business's own site. No address was guessed or constructed."
---

# Verified contacts — 2026-09-03

One-line summary: 20 prospects researched with rendered fetching; 10 publish a usable email, and
every one carries a verified defect, but only 2 had a deployed site to link to.

Companion to [[2026-09-03 - Outreach engine reaches its first prospect]] and
[[Outreach Copy - Dillon Voice]].

## Method matters more than the list

`find-contacts.js` reported **3 emails from 60 prospects (5%)**. Rendered research on a comparable
set found **10 from 20 (50%)**. The scraper misses JS-rendered addresses, obfuscated mailtos, and
`/contact` pages, and it records a WAF 403 as "no email" rather than "could not check".

Anti-bot walls were hit on **7 of 20** sites — SiteGround captcha, Cloudflare 403, and one genuine
drag-puzzle captcha. A plain fetch would have scored all seven as unreachable. Do not use
`find-contacts.js` output as a reachability measure until it renders.

## Sent 2026-09-03

| Business | Email | Hook |
|---|---|---|
| Nolt's Auto Parts | `noltsautoparts@dejazzd.com` | No HTTPS listener at all; footer reads 2002 |
| Golden Sea | `contact@goldenseabluebell.com` | Expired SSL certificate |

## Reachable, built, blocked on deploy

Sites exist in `radar-next20-20260826` and were never deployed, so there is no URL to send.

| Business | Email | Named contact | Verified defect |
|---|---|---|---|
| Wesley Works Real Estate | `sarah@wesleyworksrealestate.com` | Sarah Stauffer, Broker of Record | **Contact page publishes a dead staging address**, `frontdesk@stg-…kinsta.cloud`. Footer © 2019 |
| Street's Stores Hardware | `streetstores@aol.com` | — | `<title>` tag is completely empty; blank browser tab and blank Google result |
| Neiderer's Pool Sales | `neidererspoolsales@comcast.net` | — | No viewport meta at all; table-based HTML renders desktop-width on phones |
| Peter Zimmerman Architects | `design@PZArchitects.com` | Peter H. Zimmerman, AIA, Founder | Duplicate conflicting viewport tags; first sets `user-scalable=no` |
| Eckroth Equipment | form only | — | `<title>` reads "Home Orefield, PA Orefield, PA (800) 237-4592" |

## Reachable, not yet built

From the build queue. No site exists, so these need either a build or a defect-led offer.

| Business | Email | Named contact | Verified defect |
|---|---|---|---|
| Glen Eagle Pediatric Dentistry | `hello@gleneaglepediatricdentistry.com` | Dr. Marc Virtue, Owner | Twitter Card meta carries unedited vendor defaults: `twitter:data1` is `info@askmagnify.com`, labelled "Written by". Sharing the page shows a stranger's address |
| Davidson Fabricating | `sales@davidsonfab.com` | — | Footer copyright reads 2022, four years stale |
| Dream Team HVAC | `teamoffice@dreamteampa.com` | — | Viewport sets `user-scalable=0`, disabling pinch-to-zoom on mobile |

**Dream Team caveat:** their site was updated 2026-08-31, three days before this check. They are
actively maintaining it, which weakens a rebuild pitch. Lead with the zoom defect or skip.

## Do not contact

| Business | Why |
|---|---|
| Go Vertical | **Closed.** `govertical.com` now belongs to a residential developer in Greenville SC |
| Mt. Airy Pediatrics | **Acquired by Advocare LLC.** Redirects to their corporate site, which is modern |
| F.M. Berkheimer | Current site is a good Jan-2026 Squarespace rebuild. No defect found |
| Frees Insurance | Well maintained, current-year content, no defect found |
| Money Management Advisory | No defect found |
| Smile Culture Dental | Huntingdon Valley office already runs a modern Webflow site with live booking |
| Speck's Broasted Chicken | Only published address is their **employment inbox**. Phone instead |
| Bob Swayne Real Estate | `bobswaynerealestate.com` is a **parked domain**; operating status unconfirmed |

## No published email

Phone or form only, so these are call targets, not email targets. Several carry strong defects worth
raising on a call.

| Business | Named contact | Verified defect |
|---|---|---|
| Weathers Motors | Larry Weathers III, Owner/GM | Inventory page meta description reads "Browse our inventory of  vehicles" — the count never merged, and that is the live Google snippet |
| Kevin T. Coyne, Attorney | Kevin T. Coyne | His own site is fine, but two domains **Yelp, Justia and Lawyers.com list as his website are NXDOMAIN** — referral traffic dead-ends |
| Pennsylvania Dental Group | Dr. Brad Pirok | Social icons link to generic facebook.com / twitter.com / instagram.com home pages, not their own profiles |
| Dutton Road Veterinary | David G. Wolf, Director | No viewport meta; footer © 2008 |
| Sangillo Tire Center | — | No working HTTPS; TLS handshake fails |
| Union Chill Mat Company | — | Viewport omits `width=device-width`; footer © 2019 |
| Sprinkles Icecream | — | HTTPS serves a GoDaddy default certificate, `CN=*.secureserversites.net`, not their domain |
| Colmar Dentistry For Kids | Dr. Kathryn Leahey | Intermittent 503 / self-redirect to direct requests while third-party crawlers succeed |
| Kitay Law Offices | Ken Kitay, Founder | None verified; site is current |
| Always Dental Care | — | **BLOCKED** by a drag-puzzle captcha. Not checked, not "no email" |
