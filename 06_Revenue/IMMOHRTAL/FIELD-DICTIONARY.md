# CRM Field Dictionary

Null means unknown or not yet applicable. It never means zero. Free text may
not contain email addresses, message bodies, private identifiers, or unsupported
performance claims.

| Path | Type | Required | Owner | Definition |
|---|---|---:|---|---|
| `record_id` | string | yes | Revenue Pipeline Manager | Immutable local record identifier. |
| `account_id` | string | yes | Revenue Pipeline Manager | Stable company-level identifier; one per resolved business identity. |
| `opportunity_id` | string | yes | Revenue Pipeline Manager | Stable evaluation identifier. Presence does not imply a qualified or contacted opportunity. |
| `account.display_name` | string | yes | Demand Intelligence | Public company name exactly as verified. |
| `account.website_url` | URI | yes | Demand Intelligence | Canonical public website used for the observation. |
| `account.business_category` | string | yes | Demand Intelligence | Evidence-backed operating category; not an inferred market size. |
| `account.account_type` | enum | yes | Revenue Pipeline Manager | Currently `prospective_service_business`. |
| `account.identity_state` | enum | yes | Demand Intelligence | Whether company/domain identity is resolved. |
| `evidence.owner_role_id` | enum | yes | Demand Intelligence | Must be `demand_intelligence_lead`. |
| `evidence.source_locator` | string | yes | Demand Intelligence | Exact local artifact and source row supporting the record. |
| `evidence.source_url` | URI | yes | Demand Intelligence | Public page on which the observation was made. |
| `evidence.source_kind` | enum | yes | Demand Intelligence | Current public site, authorized private evidence, or buyer-supplied evidence. |
| `evidence.observed_date` | date | yes | Demand Intelligence | Date evidence was observed, not file creation time. |
| `evidence.freshness_review_due` | date | yes | Demand Intelligence | Next date the observation must be reproduced before advancement. |
| `evidence.observable_issue` | string | yes | Demand Intelligence | Directly observable site or workflow condition without inferred business impact. |
| `evidence.immohrtal_relevance` | string | yes | Demand Intelligence | Why a current IMMOHRTAL service lane plausibly fits. |
| `evidence.concept_url` | URI | yes | Demand Intelligence | Internal concept artifact. Never evidence of buyer interest or approval. |
| `evidence.confidence` | enum | yes | Demand Intelligence | Confidence in the company-level evidence packet. |
| `evidence.truth_state` | enum | yes | Demand Intelligence | Current, provisional, unknown, or blocked. |
| `evidence.verification_method` | string | yes | Demand Intelligence | How identity, source, and artifact reachability were checked. |
| `evidence.unknowns` | string[] | yes | Demand Intelligence | Explicit facts that cannot be inferred from public evidence. |
| `qualification.state` | enum | yes | Revenue Pipeline Manager | Pending, conditional, qualified, disqualified, or blocked. |
| `qualification.score` | integer/null | yes | Revenue Pipeline Manager | 0–16 only after every score dimension is evaluated. |
| `qualification.hard_disqualifier_check` | enum | yes | Revenue Pipeline Manager | Pending, clear, or triggered. |
| `qualification.suppression_check` | enum | yes | Demand Intelligence | Pending, clear, or suppressed against authorized canonical sources. |
| `qualification.duplicate_check` | enum | yes | Demand Intelligence | Pending, clear, or duplicate. |
| `qualification.client_conflict_check` | enum | yes | Demand Intelligence | Pending, clear, or conflict with client/partner/active conversation. |
| `qualification.service_lane` | enum | yes | Revenue Pipeline Manager | Current service lane that most directly fits the evidence, including the approved Technical SEO, AEO, GEO, and Paid Media Management lanes. |
| `qualification.offer_fit_id` | enum | yes | Revenue Pipeline Manager | Smallest sufficient current offer. Allowed values come from the public monthly menu plus the internal custom offer cards. |
| `qualification.offer_fit_state` | enum | yes | Revenue Pipeline Manager | Hypothesis, internally validated, or buyer-confirmed. |
| `qualification.offer_fit_rationale` | string | yes | Revenue Pipeline Manager | Evidence-based routing reason without promises. |
| `qualification.unresolved_requirements` | string[] | yes | Revenue Pipeline Manager | Conditions that prevent qualification or commercial advancement. |
| `pipeline.owner_role_id` | enum | yes | Revenue Pipeline Manager | Must be `revenue_pipeline_manager`. |
| `pipeline.account_lifecycle` | enum | yes | Revenue Pipeline Manager | Company relationship state independent of opportunity stage. |
| `pipeline.stage` | enum | yes | Revenue Pipeline Manager | Receipt-gated pipeline stage from `P00` to `P99`. |
| `pipeline.commercial_status` | enum | yes | Revenue Pipeline Manager | Exact receipt-backed interaction status. |
| `pipeline.amount_usd` | number/null | yes | Revenue Pipeline Manager | Commercial scope amount; null until source-backed. |
| `pipeline.probability_percent` | integer/null | yes | Revenue Pipeline Manager | Explicit forecast probability; null until a qualified forecasting method exists. |
| `pipeline.forecast_category` | enum | yes | Revenue Pipeline Manager | Excluded until a real open opportunity exists. |
| `pipeline.next_action` | string | yes | Revenue Pipeline Manager | One internal, observable action; never vague “follow up.” |
| `pipeline.next_action_owner_role_id` | enum | yes | Revenue Pipeline Manager | Exact internal role accountable for the next action. |
| `pipeline.next_action_due` | date | yes | Revenue Pipeline Manager | Review date for the next internal action. |
| `pipeline.exit_rule` | string | yes | Revenue Pipeline Manager | Evidence required to leave the current stage. |
| `pipeline.last_stage_changed_at` | datetime | yes | Revenue Pipeline Manager | UTC timestamp of the most recent stage transition. |
| `governance.*` | booleans | yes | Codex Marketing Chief | Local-only and no-contact/no-external-write controls. |
| `audit.created_at` | datetime | yes | Revenue Pipeline Manager | Initial record creation timestamp. |
| `audit.updated_at` | datetime | yes | Revenue Pipeline Manager | Most recent material change timestamp. |
| `audit.source_row_rank` | integer | yes | Demand Intelligence | Trace back to the source batch row without importing contact fields. |
| `audit.qa_state` | enum | yes | Independent auditor | Pending, passed, or failed. |
