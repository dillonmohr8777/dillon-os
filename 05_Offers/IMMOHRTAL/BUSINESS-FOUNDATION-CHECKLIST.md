# IMMOHRTAL Business Foundation Checklist

**Workflow:** `IMMOHRTAL-DAY1-20260825`
**Step:** `FOUNDATION`
**As-of:** 2026-08-25
**Owner:** Dillon Mohr
**Scope:** Internal readiness before accepting money, committing delivery capacity, or adding vendors
**Legal/tax note:** This is an operating-control checklist, not legal, tax, insurance, or accounting advice. A qualified attorney, CPA/tax professional, insurance broker, and the relevant government offices must confirm the jurisdiction-specific choices.

## Day 1 conclusion

The business has a verified public brand, live canonical website, internal offer ladder, payment milestones, qualification gate, and a zero-dollar finance baseline. The repository does **not** establish a legal seller, tax identity, dedicated banking, payment processor, bookkeeping system, insurance, customer agreements, public privacy/terms, business mailing address, or completed vendor controls.

**Do not accept customer funds yet.** The minimum money-ready gate is: confirm the legal seller and any assumed-name registration; obtain the required tax identity and registrations; open dedicated business banking and payment rails; configure numbered invoices and bookkeeping; execute a reviewed agreement plus order form/SOW; and publish or deliver the policies actually required for the chosen sales and data flow.

Status meanings:

- `VERIFIED`: current repository evidence directly supports the item.
- `NOT_FOUND`: the repository contains no completion evidence after a scoped search.
- `HUMAN_ACTION_REQUIRED`: completion needs a human choice, attestation, professional review, government filing, purchase, signature, or authenticated account action.
- `NOT_APPLICABLE`: the item has been deliberately ruled out for the current business model, with evidence. No item currently qualifies.

## Readiness register

| ID | Control | Status | Owner | Repository evidence | Next action | Completion evidence |
|---|---|---|---|---|---|---|
| FND-001 | Canonical public business name and origin | VERIFIED | Dillon | `immohrtal-marketing-site/PRODUCT.md` names IMMOHRTAL Marketing Solutions and `https://www.immohrtalmarketing.com`; `12_Brain/05_Projects/2026-08-24 - IMMOHRTAL Marketing Solutions.md` records the production launch. | Preserve this spelling and origin in every commercial document. | Product truth and live launch receipt remain current. |
| FND-002 | Legal-name, state-name, domain, and trademark clearance | HUMAN_ACTION_REQUIRED | Dillon + attorney | No clearance report was found. `02_Campaigns/IMMOHRTAL/Entity Pack.md` shows a separate Dillon-owned music use of IMMOHRTAL, so the internal brand collision also needs an explicit ownership/usage decision. | Search the relevant state entity and assumed-name records plus USPTO and common-law sources; ask counsel to assess the marketing/music coexistence and record the approved legal seller and brand license/ownership. | Dated search record and attorney-approved name/brand decision, without secrets. |
| FND-003 | Legal seller and entity choice | HUMAN_ACTION_REQUIRED | Dillon + attorney/CPA | Public product truth proves a brand, not an LLC, corporation, partnership, or sole-proprietor election. No formation receipt was found. | Choose the seller structure and formation jurisdiction with attorney/CPA input; file only after Dillon approves. Do not imply `LLC` until verified. | Filed formation/registration receipt or documented sole-proprietor decision and effective date. |
| FND-004 | Assumed name/DBA registration | HUMAN_ACTION_REQUIRED | Dillon + attorney | No filing evidence was found; need depends on the chosen legal seller and jurisdictions. | Determine whether `IMMOHRTAL Marketing Solutions` requires a fictitious/assumed-name filing in every operating jurisdiction. | Filing receipt or counsel memo stating not required. |
| FND-005 | EIN and federal tax classification | HUMAN_ACTION_REQUIRED | Dillon + CPA | No EIN or tax-classification evidence was found. | Obtain/confirm EIN through the IRS and document the tax classification privately; never store the EIN in this repository. | Redacted confirmation locator and CPA-approved classification. |
| FND-006 | State/local tax and business registrations | HUMAN_ACTION_REQUIRED | Dillon + CPA | No sales-tax, employer, local-license, or business-tax registration evidence was found. | Identify the formation state, physical operating location, client nexus, taxable-service rules, and local license obligations before invoicing. | Dated jurisdiction matrix and redacted registration locators or written not-required findings. |
| FND-007 | Beneficial-ownership/reporting obligations | HUMAN_ACTION_REQUIRED | Dillon + attorney/CPA | No assessment was found. Requirements can change. | Ask the formation professional to document current federal and state beneficial-ownership/reporting obligations and deadlines for the chosen entity. | Dated professional determination and filing receipt if applicable. |
| FND-008 | Dedicated business mailing address and registered-agent path | HUMAN_ACTION_REQUIRED | Dillon + attorney | No approved business mailing address or registered-agent evidence was found. | Select a privacy-appropriate business mailing address and, if the entity requires one, a registered agent. Keep private addresses out of public repos. | Redacted service/registration receipt and approved public contact format. |
| FND-009 | Dedicated business checking account | HUMAN_ACTION_REQUIRED | Dillon | No business-bank evidence was found. | After the legal seller and EIN path are settled, open an account in the exact legal seller name; prohibit personal/business commingling. | Redacted account locator, opening date, and bookkeeping connection status; no account numbers in the repo. |
| FND-010 | Business savings/tax reserve account | HUMAN_ACTION_REQUIRED | Dillon + CPA | No tax-reserve account or CPA-approved reserve rate was found. | Create a separate reserve account and have the CPA set the transfer rule. Do not invent a tax percentage. | Redacted account locator and approved reserve policy. |
| FND-011 | Payment processor and ACH/card rails | HUMAN_ACTION_REQUIRED | Dillon | Offer documents define milestones, but no processor, merchant account, payout account, fee schedule, refund configuration, or live test receipt was found. | Choose processor/ACH rails in the legal seller name; configure statement descriptor, refunds, receipts, MFA, least privilege, and payout reconciliation; run a reversible test only after approval. | Redacted processor locator, approved fee schedule, test invoice/payment/refund receipts, and payout reconciliation. |
| FND-012 | Numbered invoicing and collections process | NOT_FOUND | Controller + Dillon | `DAY-1-PRICE-BOOK.md` defines payment timing; no invoice template, numbering policy, due-date policy, reminders, or collections ladder was found. | Configure sequential invoice IDs, legal seller details, due dates, payment methods, service period, tax handling, late/collection language approved by counsel, and status tracking. | Sample $0/test invoice plus invoice-control SOP and successful ledger import. |
| FND-013 | Zero-dollar opening finance ledger | VERIFIED | Controller | `DAY-1-FINANCE-LEDGER.csv` contains one opening-control row with cash, receivables, revenue, expenses, liabilities, and equity all at `$0.00` and marked unverified. | Replace no amount without a bank, processor, bill, invoice, or signed-contract receipt. | Each future row has a unique ID, source locator, reviewer, and reconciliation status. |
| FND-014 | Accounting method and fiscal/tax year | HUMAN_ACTION_REQUIRED | Dillon + CPA | No cash/accrual election or fiscal-year decision was found. | Have the CPA confirm book and tax methods and the first reporting period. | CPA-approved setup memo recorded outside the repo with a redacted locator here. |
| FND-015 | Bookkeeping platform and bank-feed controls | NOT_FOUND | Controller + Dillon | No configured bookkeeping system or reconciled feed was found. | Select the system, create least-privilege access, connect only the dedicated accounts, lock closed periods, and require source documents for every posting. | System locator, access-role list, and first reconciliation report. |
| FND-016 | Chart of accounts | VERIFIED | Controller | The proposed Day 1 chart below is documented and maps the five offers without recording revenue. | CPA reviews before live use; keep offer/subscription detail in class/project fields rather than proliferating accounts. | CPA approval and matching account codes in the bookkeeping platform. |
| FND-017 | Customer deposit and revenue-recognition policy | HUMAN_ACTION_REQUIRED | Controller + CPA | Milestone billing exists in `DAY-1-PRICE-BOOK.md`; no accounting policy states when deposits become revenue. | Define contract liabilities, service periods, milestone acceptance, refunds, and recognition timing for fixed projects and monthly programs. | CPA-approved written policy and test entries for each offer type. |
| FND-018 | Customer MSA / services agreement | NOT_FOUND | Dillon + attorney | No customer-facing MSA was found. | Have counsel draft/review IP, confidentiality, warranties, limits, indemnity, payment/default, termination, publicity, subcontracting, dispute, and governing-law terms. | Approved version, version date, and signature workflow. |
| FND-019 | Order form / SOW template | NOT_FOUND | Dillon + attorney | `DAY-1-PRICE-BOOK.md`, `OFFER-CARDS.json`, and `QUALIFICATION.md` supply internal scope logic but are not customer contracts. | Convert each sale into a signed order form/SOW naming systems, routes, deliverables, exclusions, inputs, acceptance tests, change control, milestones, and dates. | Counsel-approved template and fully executed first order form. |
| FND-020 | Change order, cancellation, refund, and pause terms | NOT_FOUND | Dillon + attorney | The price book says scope changes require a change order and delays can shift dates, but no enforceable customer language or refund policy was found. | Counsel defines signed change orders, pause/restart fees, cancellation, refund eligibility, nonrefundable earned work, chargebacks, and collections. | Approved clauses in the agreement/order form and processor settings aligned to them. |
| FND-021 | Data-processing agreement and privacy/security schedule | NOT_FOUND | Dillon + attorney/security reviewer | Agent offers mention retention and least privilege, but no customer DPA, subprocessor schedule, security exhibit, or data-role analysis was found. | Inventory data processed by each offer; identify controller/processor roles, retention, deletion, breach notice, international transfers, subprocessors, and security commitments; draft only with counsel. | Reviewed DPA/security exhibit plus current subprocessor register. |
| FND-022 | Public privacy notice | NOT_FOUND | Dillon + attorney | No privacy route or policy file was found in the marketing-site source/public routes. | Map actual site collection first, including contact links, analytics, cookies, forms, embeds, logs, and vendors; publish a counsel-reviewed notice matching the live behavior. | Live canonical URL, version date, collection inventory, and production QA receipt. |
| FND-023 | Public terms of use and cookie/consent treatment | HUMAN_ACTION_REQUIRED | Dillon + attorney | No public terms route was found; whether a consent mechanism is needed depends on actual tracking, markets, and vendors. | Counsel determines required terms, copyright/IP notices, acceptable use, disclaimers, cookie categories, consent behavior, and regional handling. | Live terms URL and, if required, consent test evidence by region/device. |
| FND-024 | Professional liability / errors and omissions insurance | HUMAN_ACTION_REQUIRED | Dillon + broker | No policy or coverage decision was found. | Give the broker the real web, SEO/AEO, analytics, CRM, deployment, and agent-work scope; compare E&O limits, exclusions, retroactive date, and cyber overlap. | Binder/certificate locator, limits, exclusions, renewal date, and named legal seller. |
| FND-025 | General liability and cyber/privacy coverage | HUMAN_ACTION_REQUIRED | Dillon + broker | No policy or documented not-required decision was found. | Ask the broker to assess general liability, cyber/privacy, media/IP, equipment, and home-office exposures; do not assume one policy covers all. | Binder/certificate locator or dated broker recommendation declining coverage. |
| FND-026 | Record-retention and deletion schedule | NOT_FOUND | Controller + attorney | Offer inputs mention retention rules; no IMMOHRTAL schedule was found. | Define retention by contract, proposal, invoice, tax record, source asset, analytics export, credential locator, support ticket, agent receipt, and prospect suppression record; include legal-hold override and verified deletion. | Approved schedule, owners, storage locations, and annual review date. |
| FND-027 | Customer and prospect data inventory | NOT_FOUND | Controller + Proof | No current system-of-record inventory covers source, purpose, fields, lawful basis/permission, owner, retention, access, and deletion. | Build the inventory before importing contacts or receiving private client data. Keep secrets and unnecessary personal data out of the repo. | Dated inventory with each system/vendor and approved field set. |
| FND-028 | Vendor due diligence and approved-vendor register | NOT_FOUND | Controller + Proof | No IMMOHRTAL vendor register, terms review, DPA review, renewal owner, or exit plan was found. | Before purchase or data transfer, record purpose, owner, contract, security/privacy review, data access, cost, renewal, cancellation, export, and replacement plan. | Approved vendor register and receipt locator per vendor. |
| FND-029 | Subcontractor onboarding and classification controls | NOT_FOUND | Dillon + attorney/CPA | The price book allows added qualified capacity but no contractor agreement, classification review, NDA/IP assignment, W-9 workflow, access control, or offboarding checklist was found. | Use written agreements, classification review, tax forms stored privately, IP/confidentiality, scoped access, security training, acceptance criteria, insurance requirements, and immediate offboarding. | Signed agreement locator, classification memo, private tax-form locator, access receipt, and offboarding record. |
| FND-030 | Expense authorization and purchasing limits | NOT_FOUND | Dillon + Controller | No purchase approval matrix or card policy was found. | Define who may purchase, category/budget limits, receipt deadline, prohibited spend, subscriptions, client pass-throughs, and approval evidence. All spend stays human-approved. | Signed internal policy and first reconciled expense report. |
| FND-031 | Monthly close procedure | VERIFIED | Controller | The close calendar and evidence checklist below are documented. No month has been closed yet. | Run the first close only after dedicated accounts exist; record every unresolved item rather than forcing a balance. | Signed close checklist, reconciliations, statements, aging, deferred-revenue schedule, and reviewer signoff. |
| FND-032 | Tax calendar and estimated-payment workflow | HUMAN_ACTION_REQUIRED | Dillon + CPA | No tax calendar or payment schedule was found. | CPA creates federal/state/local filing and estimated-payment calendar based on the chosen structure and actual activity. | Calendar, responsible party, and redacted filing/payment receipts. |
| FND-033 | First-client money-ready review | HUMAN_ACTION_REQUIRED | Dillon + Controller + attorney/CPA | The legal, banking, contract, policy, and accounting gates above remain open. | Conduct one go/no-go review immediately before issuing the first real invoice. | All mandatory gates marked verified, signed customer documents, numbered invoice, and capacity reservation. |

## Proposed chart of accounts

This compact chart is a planning control. The CPA should approve account type and numbering before import.

| Code | Account | Type | Use |
|---:|---|---|---|
| 1000 | Business checking | Asset | Dedicated operating cash only. |
| 1010 | Tax reserve savings | Asset | Transfers under the CPA-approved reserve policy. |
| 1100 | Accounts receivable | Asset | Issued but unpaid invoices. |
| 1200 | Prepaid expenses | Asset | Vendor costs benefiting future periods. |
| 1500 | Equipment | Asset | Capitalized equipment only under CPA policy. |
| 1590 | Accumulated depreciation | Contra asset | CPA-controlled depreciation. |
| 2000 | Accounts payable | Liability | Approved, unpaid vendor bills. |
| 2100 | Customer deposits / deferred revenue | Liability | Cash received before recognition criteria are met. |
| 2200 | Sales tax payable | Liability | Only when a reviewed jurisdiction rule applies. |
| 2300 | Payroll/contractor liabilities | Liability | Approved payroll or contractor obligations. |
| 3000 | Owner contributions | Equity | Documented capital contributed by the owner. |
| 3100 | Owner distributions | Equity | Approved owner draws/distributions; never delivery expense. |
| 4000 | Diagnostic revenue | Income | Live Website Decision Diagnostic. |
| 4100 | Optimization sprint revenue | Income | Website Optimization Sprint. |
| 4200 | Website system revenue | Income | Distinctive Website System. |
| 4300 | Visibility foundation revenue | Income | Search and Answer Visibility foundation fee. |
| 4310 | Visibility monthly revenue | Income | Monthly Search and Answer Visibility service. |
| 4400 | Agent implementation revenue | Income | Bounded Business Agent Implementation. |
| 4410 | Managed agent support revenue | Income | Optional recurring support when separately contracted. |
| 5000 | Delivery labor / subcontractors | Cost of services | Approved direct delivery labor. |
| 5100 | Project software and APIs | Cost of services | Direct, attributable project usage. |
| 5200 | Project assets and licenses | Cost of services | Direct project media/licenses with usage rights. |
| 5300 | Hosting/deployment pass-through | Cost of services | Direct contract-approved client cost. |
| 6000 | Sales and marketing | Operating expense | IMMOHRTAL acquisition expenses. |
| 6100 | General software | Operating expense | Non-project subscriptions and tools. |
| 6200 | Legal and accounting | Operating expense | Professional services. |
| 6300 | Insurance | Operating expense | Business coverage. |
| 6400 | Bank and merchant fees | Operating expense | Processor/bank fees not treated as direct delivery. |
| 6500 | Office and equipment expense | Operating expense | Noncapitalized business supplies/equipment. |
| 6600 | Education and dues | Operating expense | Approved business education/memberships. |
| 6700 | Taxes and licenses | Operating expense | Business licenses and non-income taxes per CPA. |
| 6900 | Other operating expense | Operating expense | Rare reviewed items; do not use as a dumping account. |

## Invoice-to-cash control

1. `QUALIFICATION.md` passes and capacity is reserved.
2. The exact legal seller, client legal name, scope, acceptance criteria, payment milestones, taxes, and dates appear in an executed agreement/order form.
3. Controller creates a sequential invoice; Dillon approves the first invoice and every exception.
4. Ledger records invoice issuance as receivable only after a valid invoice exists. A proposal is not revenue.
5. Processor/bank receipt records cash; cash received before recognition remains customer deposit/deferred revenue under the CPA-approved policy.
6. Delivery starts only when the contract, required booking payment, access, source materials, and approver are ready.
7. Revenue is recognized only under the approved accounting policy and supported acceptance/service-period evidence.
8. Payout, processor fee, invoice, bank deposit, and ledger entry reconcile to the cent.

## Monthly close: business days 1–7

| Day | Owner | Required work | Evidence |
|---|---|---|---|
| 1 | Controller | Freeze the prior-period ledger snapshot; collect bank, processor, card, invoice, bill, payroll/contractor, and expense records. | Immutable export/checksum and source checklist. |
| 2 | Controller | Reconcile every bank/processor balance and payout; resolve duplicate, missing, and personal transactions. | Reconciliation reports and exception log. |
| 3 | Controller | Reconcile invoices, accounts receivable aging, deposits/deferred revenue, refunds, credits, chargebacks, and sales-tax liability. | AR aging, deferred-revenue rollforward, processor reports. |
| 4 | Controller | Match bills/expenses to receipts and approvals; allocate direct costs by project; review subscriptions and prepaid expenses. | AP aging, receipt completeness, project-cost schedule. |
| 5 | Controller + Dillon | Review project economics, delivery hours, backlog, contracted capacity, gross margin, cash runway, and overdue balances. | Signed management review; planning assumptions remain separate from actuals. |
| 6 | CPA/Controller | Post only supported adjustments; review contractor/payroll and tax-reserve obligations; lock the period after approval. | Journal-entry support, tax workpapers, lock receipt. |
| 7 | Dillon | Approve final profit-and-loss, balance sheet, cash-flow view, AR/AP aging, deferred revenue, project margin, and exception list. | Dated owner signoff and next-action owners. |

Close rules:

- Never estimate missing actual revenue, cash, tax, payroll, or expenses into existence.
- Every transaction requires a source locator and business purpose; sensitive originals stay in the approved private financial system.
- Owner contributions/distributions never masquerade as revenue or project cost.
- A contract value, proposal, pipeline amount, or unpaid invoice is not cash received.
- Planning cost and capacity models live in `UNIT-ECONOMICS.md`; actuals live only in the ledger/bookkeeping system.
- Reopen a closed period only through a dated adjustment with preparer and reviewer evidence.

## Top three blockers

1. **Legal seller and tax identity are unresolved.** The brand is live, but the repository does not prove an entity/sole-proprietor decision, name/DBA clearance, EIN, tax classification, or jurisdiction registrations.
2. **There is no money rail or accounting system.** Dedicated banking, invoicing, processor setup, bookkeeping platform, reconciliation, and deposit/revenue policy are not verified.
3. **There is no enforceable customer/vendor risk layer.** MSA/SOW/change-order terms, DPA/privacy/security documents, public privacy/terms, insurance, and subcontractor/vendor controls are not complete.
