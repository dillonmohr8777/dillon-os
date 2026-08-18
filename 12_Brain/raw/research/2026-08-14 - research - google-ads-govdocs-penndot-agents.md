---
tags: [research, raw, google-ads, penndot, tags-2-go]
captured: 2026-08-14
topic: Google Ads Government documents certification for Pennsylvania tag agencies
---

# 2026-08-14 research — Google Ads gov-docs vs PennDOT agent directories

Receipts for how Google Ads treats vehicle title/registration advertising, and what Pennsylvania actually publishes for authorized agents. Compiled into [[12_Brain/concepts/Google Ads Government Documents Certification]].

## Question

What does Google require before ads can promote Pennsylvania vehicle registration, title, plate, or related tag-agency services, and does PennDOT provide the government-site backlink Google asks for?

## Receipts

1. **Claim:** Only certified governments and authorized providers may run ads that promote direct acquisition of specific government documents and services, including vehicle owner registration and license plate numbers.
   - Source: [Government documents and services — Advertising Policies Help](https://support.google.com/adspolicy/answer/13156083) (fetched 2026-08-14)
   - Date: live policy page as of 2026-08-14
   - US vehicle owner registration is in scope. Regional exclusions for that category are Belgium and Germany only. License-plate exclusions do not include the United States.

2. **Claim:** An authorized, non-government provider must have its domain linked from an official government website and be explicitly referenced as authorized for the specific document or service. Certification is a two-step process: apply, then complete advertiser verification. Outcome typically 10–12 business days after verification.
   - Source: same policy page, plus the application form at [godos_certification](https://support.google.com/adspolicy/contact/godos_certification) (fetched 2026-08-14)
   - The form’s authorized-provider path requires (a) the advertiser domain and (b) the official government website URL from which that domain is linked. There is no US vehicle-registration exclusion option on the form.

3. **Claim:** Starting 2026-10-05 Google will not accept commercial contracts, business/trade licenses, business-registry entries, or government-hosted articles/blog posts as proof of authorization. Valid examples include government-managed directories of accredited commercial partners.
   - Source: [Update to Government documents and services policy (October 2026)](https://support.google.com/adspolicy/answer/17260489) (posted 2026-08-04; enforcement 2026-10-05)

4. **Claim:** PennDOT’s public Authorized Agents and Messengers page lists agent types and links to PDF directories (name, street, city, phone). Those PDFs have no website column.
   - Source: [Authorized Agents-Messengers](https://www.pa.gov/agencies/dmv/resources/business-partners/authorized-agents-messengers) (fetched 2026-08-14)
   - Directory PDF: [Agent Services for Web](https://docs.penndot.pa.gov/Public/DVSPubsForms/Agent%20Services%20for%20Web.pdf)
   - Online-agent PDF: [online_stations.pdf](https://docs.penndot.pa.gov/Public/DVSPubsForms/online_stations.pdf)
   - Direct check of those PDFs on 2026-08-14: Tags 2 Go LLC is listed at 6001 Torresdale Ave, Philadelphia. No URL field exists for any agent.

5. **Claim:** Agent-record maintenance (profile, personnel, bond) lives in Dealer Agent Services (DAS) at dealers.penndot.gov. DAS questions go to the DAS pilot resource account. Contract/employee changes go to the Contract Administration resource account via MV-73B / MV-73O. The Agent Support resource account is for title and registration transaction issues, not listing/website updates.
   - Source: [DAS access bulletin 24-06](https://www.pa.gov/content/dam/copapwp-pagov/en/dmv/documents/business-partners/driver-and-vehicle-services-bulletin/bulletin%2024-06%20das%20access.pdf); [MV-73B](https://www.pa.gov/content/dam/copapwp-pagov/en/penndot/documents/public/dvspubsforms/bmv/bmv-forms/mv-73b.pdf); [Who to contact — Vehicle Board or PennDOT](https://www.pa.gov/agencies/dos/department-and-offices/bpoa/boards-commissions/vehicle-manufacturers-dealers-salespersons/who-to-contact-vehicleboard-penndot.html)

6. **Claim:** Apply-for-certification in Google Ads is Admin → Policy → Account → Apply for certification, or the Help Center form above if the in-account control is not yet on the account.
   - Source: [Apply to advertise certain products & services](https://support.google.com/adspolicy/answer/16908635) (fetched 2026-08-14)

## Gmail / Slack evidence used (redacted)

- Client thread 2026-08-11 through 2026-08-14: advertiser verification and billing are fine; one asset disapproved under Government documents and official services; client sent PennDOT Certificate of Authorization, domain certificate, entity filings, and the public directory PDF; client confirmed DAS has no URL field; client declined notary/extra campaigns; client asked not to wait on PennDOT.
- PennDOT Agent Support thread 2026-08-13 through 2026-08-14: manager stated the resource account is for title and registration issues and is not the right location for Google Ads materials.
- Google Ads support case opened 2026-08-13 with authorization/domain/entity attachments. No human reply as of 2026-08-14. No Gmail copy of a completed `godos_certification` form submission was found.
- Slack channel for this client 2026-08-11: same diagnosis (account healthy; block is Government Documents certification; East Coast name was an earlier listing mismatch, later retracted).

## Killed claims

- Sending Google Ads packets to PennDOT Agent Support will produce a domain confirmation. Contradicted by the 2026-08-14 Agent Support reply.
- The live PennDOT PDF still lists the prior occupant (East Coast Insurance & Tags) at this address. Contradicted by the 2026-08-14 PDF extract (Tags 2 Go LLC is listed). Operator later retracted the East Coast listing ask.
- United States tag agencies have a regional exclusion for vehicle registration ads. Contradicted by the policy exclusion lists.
- A PennDOT Certificate of Authorization plus domain registration is sufficient by itself. Contradicted by the authorized-provider definition and the October 2026 update.
- A notary/document “extras” campaign satisfies the engagement. Client refused 2026-08-14; those services are not the product being hired.

## Open

- Whether Google’s certification reviewers will accept the PennDOT PDF directory (name + address, no hyperlink to the advertiser domain) as the required government-site link. Policy text asks for a link from a government website to the domain. The PDF is a government-managed directory but has no domain link.
