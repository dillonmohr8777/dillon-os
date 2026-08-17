---
tags: [raw, research, franchise, sourcing, fdd]
captured: 2026-08-15
method: live portal probes (browser UA where bots get 403); no Item 20 tables saved
agent: cloud subagent (Lane A FDD portals)
note_type: capture
status: unprocessed
created: 2026-08-15
updated: 2026-08-15
source_refs: []
---


# Raw receipts — Lane A FDD portals, second pass 2026-08-15

Methods and counts only. No franchisee names, phones, or emails. Do not
commit Item 20 tables.

Supersedes the CA/MN one-liners in the same-day A/C/D receipt: California
DocQNet is **not** a free FDD library in 2026. Minnesota CARDS **does**
serve no-login PDFs to a browser UA.

## Scoreboard

| Portal | No-login FDD PDF? | Wall | Use |
|---|---|---|---|
| MN CARDS `cards.web.commerce.state.mn.us/franchise-registrations` | **Yes** (sample HEAD 200 PDF ~5.7 MB) | 403 to non-browser clients | **Primary** |
| WI DFI search + Details → Download | **Yes** (sample Download 200 PDF ~3.2 MB) | None | **Primary** |
| WI active filings list | No (names + expiration only) | None | Index. **1,861** active rows this run |
| IN public-portfolio-search | Not verified | reCAPTCHA on submit | Human-only |
| CA DocQNet / FRANSES | **No** | Account + PRA for copies | Skip |
| MD OAG | **No** public corpus | Phone the Division | Skip |
| NASAA FRED `/Franchise/Search` | Not verified | AWS WAF 405 | Optional lookup |

MN `year=2026` + `documentType=Clean FDD`: first page **500** PDF rows, **340** unique file numbers, Load more present.

Item 20 fields unchanged: current franchisees = name + outlet address + telephone ([16 CFR § 436.5(t)](https://www.law.cornell.edu/cfr/text/16/436.5)). Email almost never. Join names onto the existing 720. Never guess mailboxes. Never write Item 20 extracts into git.
