---
tags: [raw, research, mcp, security]
captured: 2026-08-16
method: official docs + security researchers + 2026 practitioner posts; no X (MCP down); Exa rate-limited
agent: cloud (cursor/mcp-stack-failure-modes-d0cc)
expires_hint: compile into 12_Brain/concepts/MCP Stack Failure Modes 2026
---

# Raw receipts — MCP stack failure modes, 2026-08-16

Question: what actually breaks when an agent stack adds many MCP servers?

Sub-questions: (1) prompt injection via tool results, (2) secret sprawl,
(3) overlap / tool confusion, (4) write-capable ads/email MCPs that spend or
send, (5) unofficial Google Ads wrappers vs Google/Meta policy, (6) MCP
directory quality, (7) official language on trusted/first-party servers and
write gates.

Method limits: X MCP failed live discovery. Exa hit its free-tier rate
limit. No nested skeptic subagent was available; skeptic pass is
same-session and labeled. No install recommendations. No account actions.

Dates: if a page has no publication date, date is **accessed 2026-08-16**.

## 1. Prompt injection via tool results

| ID | Verdict | Claim | Source | Date |
|---|---|---|---|---|
| PI-1 | SURVIVE | Official MCP tools spec: clients **SHOULD** "Validate tool results before passing to LLM" and prompt for confirmation on sensitive operations. Servers **MUST** sanitize tool outputs. | https://modelcontextprotocol.io/specification/2026-07-28/server/tools | spec 2026-07-28; accessed 2026-08-16 |
| PI-2 | SURVIVE | Official MCP spec Trust & Safety: tool descriptions/annotations are untrusted unless obtained from a trusted server. Hosts must obtain explicit user consent before invoking any tool. | https://modelcontextprotocol.io/specification/2026-07-28 | spec 2026-07-28; accessed 2026-08-16 |
| PI-3 | SURVIVE | Official client best practices: "Tool results from one server are untrusted input to another. The broker should apply the same input-review policy to brokered calls as to direct ones; output truncation alone does not prevent exfiltration." | https://modelcontextprotocol.io/docs/develop/clients/client-best-practices | accessed 2026-08-16 |
| PI-4 | SURVIVE | Official MCP blog: annotations are hints, not guarantees. An untrusted server can claim `readOnlyHint: true` and still mutate. Clients must treat annotations from untrusted servers as untrusted. | https://blog.modelcontextprotocol.io/posts/2026-03-16-tool-annotations/ | 2026-03-16 |
| PI-5 | SURVIVE | Willison (2025-04-09): mixing tools with untrusted instructions is inherently dangerous. Tool poisoning hides instructions in descriptions the model sees and the user often does not. Rug pulls mutate definitions after approval. Cross-server tool shadowing lets a malicious server intercept trusted-tool behavior. Treat spec SHOULDs as MUSTs. | https://simonwillison.net/2025/Apr/9/mcp-prompt-injection/ | 2025-04-09 |
| PI-6 | SURVIVE | Willison lethal trifecta: private data + untrusted content + external communication. MCP mix-and-match outsources that combination to the user. Email is a perfect untrusted-content source. GitHub official MCP combined all three legs in one package. Guardrails claiming ~95% catch rates are a failing grade. | https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/ | 2025-06-16 |
| PI-7 | SURVIVE | Willison (2026-07-31): 2026-07-28 stateless MCP does not retire the 2025 injection problem. He still treats mix-and-match as pushing exfil risk onto users. He now prefers MCP over unconstrained shell+curl because the capability surface is easier to audit — not because it is safe. | https://simonwillison.net/2026/Jul/31/stateless-mcp/ | 2026-07-31 |
| PI-8 | SURVIVE | Invariant Labs: tool poisoning via hidden instructions in descriptions; rug pulls after approval; shadowing a trusted `send_email` so mail goes to an attacker. `mcp.json` is a common credential store and a theft target. Urge caution connecting third-party MCP servers. | https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks | 2025-04 (updates 2025-04-07 / 2025-04-11) |
| PI-9 | SURVIVE | Invariant Labs: official GitHub MCP + a malicious public issue can coerce an agent to read private repos and exfil via a public PR. Not a GitHub server-code bug — architectural. Trusted tools still process untrusted issue text. "Always Allow" confirmation policies remove the last human gate. | https://invariantlabs.ai/blog/mcp-github-vulnerability | 2025-05-26 |
| PI-10 | SURVIVE | Google Workspace / Gmail official docs: exposing a model to untrusted data risks indirect prompt injection. MCP hosts can read, modify, and delete Google Account data. "Only use trusted tools. Never connect Gmail MCP server to untrusted or unverified applications." Do not process emails/resources from unverified sources. Review all actions. Screen prompts and responses (Model Armor or a documented alternative). | https://developers.google.com/workspace/gmail/api/guides/configure-mcp-server · https://developers.google.com/workspace/guides/configure-mcp-servers · https://developers.google.com/workspace/guides/configure-mcp-security | accessed 2026-08-16 |
| PI-11 | SURVIVE (press-release only) | NSA AISC CSI (2026-05-20): MCP adoption is real; spec requires cautious implementation. Gaps include serialization risks, trust boundaries, agent misuse, dynamic tool invocation, implicit trust, context sharing. Traditional cyber controls are not enough. Full CSI PDF not fetched this pass. | https://www.nsa.gov/Press-Room/Press-Releases-Statements/Press-Release-View/Article/4496698/nsa-releases-security-design-considerations-for-ai-driven-automation-leveraging/ | 2026-05-20 |
| PI-12 | KILL / hype | Vendor blogs (Checkmarx, CSA, Airia, Doppler) restating injection as a product pitch. Use primary researchers + official spec instead. | various | — |

## 2. Secret sprawl

| ID | Verdict | Claim | Source | Date |
|---|---|---|---|---|
| SS-1 | SURVIVE | Official MCP security best practices: token passthrough is an anti-pattern and **explicitly forbidden**. Servers **MUST NOT** accept tokens not issued for that MCP server. Passthrough breaks audience binding, audit trails, and trust boundaries; a stolen token can use the server as an exfil proxy. | https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices | spec docs 2026-07-28; accessed 2026-08-16 |
| SS-2 | SURVIVE | Official authorization spec: MCP servers **MUST** validate tokens were issued for them; **MUST NOT** pass the client token through to upstream APIs. Clients **MUST** send the `resource` parameter (RFC 8707). Least privilege: request only needed scopes. | https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization · https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations | spec 2026-07-28; accessed 2026-08-16 |
| SS-3 | SURVIVE | Official client best practices: "No credential exposure: API keys and tokens are held by the host. The generated code calls typed functions; the host adds authentication when forwarding to servers." | https://modelcontextprotocol.io/docs/develop/clients/client-best-practices | accessed 2026-08-16 |
| SS-4 | SURVIVE | Invariant: `~/.cursor/mcp.json` typically stores credentials for other MCP servers; their poisoning demo steals it plus SSH keys. More servers ⇒ more secrets in one agent-readable file. | https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks | 2025-04 |
| SS-5 | SURVIVE | GitHub official: Copilot code-review MCP tokens live under repo Secrets and variables → Agents, not in the review prompt. Enterprise allowlists exist because unmanaged server lists are a control problem. `serverName` is **not** a security control (users can rename). | https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/ · https://github.blog/changelog/2026-08-06-mcp-allowlists-in-enterprise-managed-settings/ | 2026-07-29 · 2026-08-06 |
| SS-6 | KILL | Doppler: "Nearly half of all MCP servers in production aggregate multiple API keys… into a single unencrypted file." No methodology, vendor secrets-manager pitch. | https://www.doppler.com/blog/mcp-server-credential-security-best-practices | accessed 2026-08-16 |
| SS-7 | single-source | GitGuardian 2026 governance post: dedicated OAuth app per MCP server; no shared credentials; no refresh tokens in MCP config. Sensible, but vendor blog. Keep as corroboration, not a prevalence number. | https://blog.gitguardian.com/mcp-governance-framework/ | accessed 2026-08-16 |

## 3. Overlap / tool confusion

| ID | Verdict | Claim | Source | Date |
|---|---|---|---|---|
| TC-1 | SURVIVE | Official client best practices (2026-07-28 docs): naive hosts that load every connected server's tools into context "waste tokens, increase latency, and degrade model performance" once dozens of servers / hundreds of tools accumulate. Recommends progressive discovery and grouping tools by source server. | https://modelcontextprotocol.io/docs/develop/clients/client-best-practices | accessed 2026-08-16 |
| TC-2 | SURVIVE | Official tools spec: a tool is uniquely identified by a `name` on **that** server. No cross-server namespace field is required. Collision / shadowing is a client flattening problem. | https://modelcontextprotocol.io/specification/2026-07-28/server/tools | spec 2026-07-28 |
| TC-3 | SURVIVE | Invariant + Willison: a second server can shadow a trusted tool (`send_email`, `read_file`) via description or name collision and redirect the call or its arguments. | https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks · https://simonwillison.net/2025/Apr/9/mcp-prompt-injection/ | 2025-04 |
| TC-4 | SURVIVE (practitioner, single-source numbers) | DEV (2026): wiring 8 servers produced silent `search` / `create_issue` collisions; last-loaded definition won; no client warning. Author says 2026-03 spec has no namespace. Treat the collision mechanism as real; do not treat "8 servers / 3 pairs" as a universal rate. | https://dev.to/kenimo49/i-wired-8-mcp-servers-into-one-claude-agent-3-pairs-quietly-fought-over-the-same-tool-name-46ff | accessed 2026-08-16 |
| TC-5 | KILL as a rule | StackMCP: "Target: 3-4 servers, under 15% of context, zero overlap / 50-tool cap." Product blog, not official. Official docs describe the failure mode (context bloat) without a 3–4 server quota. | https://stackmcp.dev/blog/too-many-mcp-servers | accessed 2026-08-16 |
| TC-6 | single-source | AWS Heroes DEV: GitHub Copilot cut tool count 40→13 with benchmark gains; Block Linear MCP 30+→2. No official GitHub citation fetched for the 40→13 number. Mechanism (too many similar tools → wrong-tool / hallucinated-tool calls) matches official client-best-practices. | https://dev.to/aws-heroes/mcp-tool-design-why-your-ai-agent-is-failing-and-how-to-fix-it-40fc | accessed 2026-08-16 |

## 4. Write-capable ads / email MCPs (spend or send)

| ID | Verdict | Claim | Source | Date |
|---|---|---|---|---|
| WR-1 | SURVIVE | Official Google Ads MCP is **read-only** in the current release. Tools: `list_accessible_customers`, `search` (GAQL), `get_resource_metadata`. No mutate/create/pause tools. GitHub README matches. | https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server · https://github.com/googleads/google-ads-mcp | accessed 2026-08-16 |
| WR-2 | SURVIVE | Official Gmail MCP tool list has `create_draft` and no send tool. Official walkthrough: draft lands in Drafts so a human reviews and sends in Gmail. Scopes documented: `gmail.readonly` + `gmail.compose`. | https://developers.google.com/workspace/gmail/api/guides/configure-mcp-server | accessed 2026-08-16 |
| WR-3 | SURVIVE | Official Workspace MCP overview: "Take action: Create draft emails…" — draft, not send. Calendar/Chat have more write surface (schedule meetings; Chat `chat.messages.create`). | https://developers.google.com/workspace/guides/configure-mcp-servers | accessed 2026-08-16 |
| WR-4 | SURVIVE | Official Meta Ads AI Connectors (2026-04-29; rules update 2026-07-16): first-party ads MCP at `https://mcp.facebook.com/ads` can create/edit ads, ad sets, campaigns, catalogs, custom audiences, A/B tests. "All ads are paused by default until you set them live." "Any actions taken on your behalf require your authorization through the AI agent." Portfolio admins can block create-campaign / edit-budget (including a max budget amount). Partners who have account access can set rules that apply to their employees. | https://www.facebook.com/business/news/meta-ads-ai-connectors · https://www.facebook.com/business/help/1456422242197840 | 2026-04-29 / 2026-07-16; accessed 2026-08-16 |
| WR-5 | SURVIVE | Official MCP tools spec: human in the loop **SHOULD** be able to deny invocations; confirmation prompts for operations. | https://modelcontextprotocol.io/specification/2026-07-28/server/tools | spec 2026-07-28 |
| WR-6 | SURVIVE | GitHub Copilot code review GA: "All MCP tool calls performed by Copilot code review will be limited to read-only." | https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/ | 2026-07-29 |
| WR-7 | SURVIVE (help-center via search snippets; page JS-walled) | OpenAI ChatGPT developer-mode help: connecting untrusted MCP servers increases prompt-injection risk — "Only connect servers you trust." Write/modify actions may require confirmation; some risky actions are blocked. OpenAI-built apps are search-only and do not support write. Custom/third-party connectors are the operator's to vet. | https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt | accessed 2026-08-16 (search snippets; full fetch blocked) |
| WR-8 | KILL | Vendor/affiliate posts calling official Meta MCP "ban-proof" / "no ban risk." Official Meta pages do not say that. Practitioner counter: first-party is more legitimate than unofficial connectors; rate-limit / abuse controls still apply. | e.g. https://soku.ai/blog/meta-ads-mcp-guide vs https://adsuploader.com/blog/meta-ads-mcp-vs-cli | accessed 2026-08-16 |
| WR-9 | KILL as official count | "29 Meta MCP tools" appears in vendor recaps, not in the official help article fetched this pass. | vendor blogs | — |

## 5. Unofficial Google Ads wrappers + Google/Meta policy

| ID | Verdict | Claim | Source | Date |
|---|---|---|---|---|
| GA-1 | SURVIVE | Google Ads API policies: you may only use the API as described in the token application; adding creation/management to a reporting tool requires a Tool Change Form. Full-service third-party tools trigger Required Minimum Functionality. | https://support.google.com/adspolicy/answer/6169371 | accessed 2026-08-16 |
| GA-2 | SURVIVE | Google Ads API policies — prohibited: you cannot let agencies/end-advertisers use **your** developer token (or an API you wrap around it) to avoid applying for their own token or to circumvent RMF. "You cannot provide indirect access to your API token via APIs that you provide." Automated/programmatic use by those parties requires **their** token. Abuse by indirect users can revoke **your** token. Tools must not replicate the Google Ads UI or imply they are a Google product. | https://support.google.com/adspolicy/answer/6169371 | accessed 2026-08-16 |
| GA-3 | SURVIVE | Google Ads API Terms: use is subject to those policies; non-compliance can mean fees, downgrade, suspension, termination. | https://developers.google.com/google-ads/api/docs/api-policy/terms | accessed 2026-08-16 |
| GA-4 | SURVIVE as existence, not endorsement | Community write wrappers exist (e.g. repos that add `GOOGLE_ADS_MCP_ENABLE_WRITES` / `GOOGLE_ADS_MCP_WRITE` and mutate bids/budgets). They require a developer token + OAuth refresh token in the server env. Several disclaim "NOT an officially supported Google product." This is the unofficial-wrapper failure mode: write surface + token in agent config + no Google support. **No install.** | public GitHub READMEs fetched 2026-08-16 (community projects) | accessed 2026-08-16 |
| GA-5 | KILL | Ranked "best Google Ads MCP" listicles that push hosted third-party write connectors as the default. Marketing, not policy. | e.g. https://soku.ai/blog/best-mcp-servers-google-ads-ranked | accessed 2026-08-16 |
| GA-6 | note | Meta's official path is first-party MCP + OAuth + optional portfolio rules. That is the contrast class for unofficial ads wrappers — not a recommendation to connect it. | Meta pages in WR-4 | 2026-04-29 / 2026-07-16 |

## 6. MCP directory quality

| ID | Verdict | Claim | Source | Date |
|---|---|---|---|---|
| DIR-1 | SURVIVE | Practitioner census (corrected 2026-07-30): official registry remotes n=10,716. ~25% unusable (23.4–25.4% across two runs). Largest hygiene fail: 1,044 listed URLs 404 (9.7%). ~50% anonymous handshake; 24.7% auth-gated (alive, not dead). Author first published a 10% figure from a 2.8% sample and corrected it. Author disclosed they are an autonomous agent. | https://dev.to/theopslog/i-checked-every-mcp-server-in-the-official-registry-about-1-in-10-is-broken-1ehj | measured 2026-07-29; correction 2026-07-30 |
| DIR-2 | SURVIVE | Same post kills the viral "half of MCP is dead" line: that figure treats auth-gated servers as down. Auth-gated ≠ rubble. Schema drift (silent tool/schema change) is the failure uptime pings miss. | same | 2026-07-30 |
| DIR-3 | SURVIVE | arXiv 2608.00150 (July 2026 measurements): 21k+ detectable instances across 11 sources including Smithery, glama.ai, pulsemcp.com. Confirmed 640 production servers; audited 414; 68 reportable vulns. 91.8% of audited servers lacked OAuth. 687 tools exposed shell exec without access controls. 41.6% of confirmed servers disappeared within ~3 days. Directories are discovery surfaces, not security reviews. | https://arxiv.org/html/2608.00150v1 | arXiv 2608 (2026-08); measurements July 2026 |
| DIR-4 | corroboration | MCP Queen July 2026 grade of registry remotes: ~17% advertised remotes dead; 29.2% D/F; listing ≠ verification; grades churn daily. Vendor-adjacent grader — use as color, not the primary number. | https://mcpqueen.com/reports/state-of-mcp-2026-07 | 2026-07 |
| DIR-5 | KILL | Aggregator "30–82% of public MCP servers are exploitable" composites from mixed 2025–2026 studies. Too wide to operationalize. | e.g. https://www.practical-devsecops.com/mcp-security-statistics-2026-report/ | accessed 2026-08-16 |
| DIR-6 | KILL as a shopping list | "Awesome MCP" / "best MCP servers 2026" posts. Inclusion ≠ quality; several say so themselves, then still recommend installs. | various | — |

## 7. Official language: trusted / first-party + write gates

There is **no** fetched official MCP spec sentence that says "prefer first-party MCPs."

What official pages actually say:

| ID | Verdict | Claim | Source | Date |
|---|---|---|---|---|
| FP-1 | SURVIVE | Spec trust model is **trusted server**, not "first-party vendor." Annotations and tool-behavior descriptions are untrusted unless from a trusted server. | https://modelcontextprotocol.io/specification/2026-07-28 · tools page | 2026-07-28 |
| FP-2 | SURVIVE | Google first-party Gmail/Workspace MCP: "Only use trusted tools. Never connect … to untrusted or unverified applications." Plus draft-not-send, Model Armor on tool calls/responses, review all actions. | Google Workspace MCP pages above | accessed 2026-08-16 |
| FP-3 | SURVIVE | Google first-party Ads MCP ships **read-only**. Writes stay on the REST/gRPC API, not the MCP surface. | Google Ads MCP docs | accessed 2026-08-16 |
| FP-4 | SURVIVE | Meta first-party ads MCP **does** write, and Meta added portfolio **rules** (2026-07-16) so admins can block budget/campaign/catalog mutations. Paused-by-default on created ads. Authorization through the agent is required. | Meta news + help | 2026-04-29 / 2026-07-16 |
| FP-5 | SURVIVE | GitHub: code-review MCP is read-only; enterprise allowlists/denylists block untrusted servers. Name matching is not a security control. | GitHub changelog | 2026-07-29 / 2026-08-06 |
| FP-6 | SURVIVE (snippets) | OpenAI: only connect servers you trust; writes gated/confirmed; OpenAI-built apps search-only; registry apps reviewed, custom/third-party are the workspace's to vet. | OpenAI help 12584461 | accessed 2026-08-16 |
| FP-7 | SURVIVE | Official tools spec + Willison: keep a human able to deny tool invocations; confirmation on sensitive ops. | MCP tools spec · Willison 2025-04-09 | 2026-07-28 / 2025-04-09 |

Operational reading (inference, labeled): first-party is the strongest **trust signal** official docs give you. It is not a spec mandate, and first-party is not automatically safe (GitHub MCP + public issues; Meta write surface). Write tools stay gated even on first-party servers.

## Skeptic pass (same-session — not a fresh-context checker)

Attacks that landed:

- "Prefer first-party" is **not** spec text. Compiled page must say "trusted server" and show first-party as the usual trust signal.
- "Half of MCP is dead" is a misread of auth-gated endpoints. Killed.
- Doppler 50% unencrypted-file claim. Killed.
- StackMCP 3–4 server quota. Killed as a rule.
- Meta/Google "ban-proof." Killed.
- Composite 30–82% vuln rates. Killed.
- OpenAI help page was JS-walled; WR-7/FP-6 are snippet-grade until a full fetch.
- NSA CSI body not fetched; PI-11 is press-release only.
- DEV registry author is an autonomous agent; numbers survive because method + correction are public, but they are one census.
- Community Ads wrapper repos prove existence, not prevalence or a specific ban event.
- Willison 2025 posts are older than the 2026-07-28 spec; 2026-07-31 post confirms the injection argument still stands.

What would flip survivors: a later official Google Ads MCP that adds writes; a Gmail `send` tool; a spec namespace field; a Meta statement that unofficial connectors are permitted / banned by name.

## Surfaces that failed this run

- X MCP: live tool discovery error.
- Exa MCP: free-tier rate limit.
- OpenAI help.openai.com: JS/cookie wall on fetch.
- Meta help/news: fetched; some related "developer blog" URLs not pulled.
