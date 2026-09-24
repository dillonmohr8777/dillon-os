---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-15T22:52:09
session_last: 2026-09-15T22:52:09
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-09-15\https-www-tiktok-com-t-zp83sqkxm"
open_flags: [blocked]
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-15\https-www-tiktok-com-t-zp83sqkxm

**1 session(s)** · 2026-09-15 22:52 → 2026-09-15 22:52 · 27m agent-time (summed; sessions may overlap) · 3 MB transcript · 5/5 turns completed

> **Open flags:** `blocked`

## 1. 2026-09-15 22:52 · 27m · 3.2 MB

`01a0a745-421a-7833-b75b-cd3111cd822a` · turns 5/5 · flags: blocked

**Asked:**

> https://www.tiktok.com/t/ZP83sQKXM/ institute tbis workflow end tk end

**Outcome reported:**

> Staged end to end:
> 
> - Created an isolated Hermes `tokenharbor` profile using `https://tokenharbor.ai/v1` and `deepseek-v4.1-flash:free`, matching the current [Hermes custom-provider guidance](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/integrations/providers.md) and [Token Harbor model catalog](https://tokenharbor.ai/models?category=free). The existing Hermes model, gateway, and four jobs remain untouched.
> - Installed a fail-closed [launcher](</C:/Users/dillo/AppData/Local/hermes/profiles/tokenharbor/Start-TokenHarborHermes.ps1>) that refuses to run without `TOKENHARBOR_API_KEY`, preventing the existing OpenAI key from being forwarded accidentally. Evidence is recorded in [CHECKPOINT.md](</C:/Users/dillo/Documents/Codex/2026-09-15/https-www-tiktok-com-t-zp83sqkxm/CHECKPOINT.md>).
> - Blocked at the required access gate: Google is ready to share your Dillon Mohr name, profile photo, and Gmail address with Token Harbor. Should I click **Continue**?
> 

> That Token Harbor API key is fully visible in the screenshot, so treat it as compromised. I won’t copy or use it.
> 
> Please revoke that key, create a replacement, and store it locally as `TOKENHARBOR_API_KEY` without posting it here. Then tell me **“key set”** and I’ll run the Hermes live smoke test and finish verification.

> I can’t extract or type an API key from the screenshot, even temporarily.
> 
> Set it locally yourself as `TOKENHARBOR_API_KEY`, then reply **“key set.”** I’ll immediately run the live Hermes test. Revoke and replace this exposed key afterward.

> The masked terminal prompt is open. Paste the replacement key there and press Enter, then reply **done**. I’ll run the live Hermes verification immediately afterward.

> I can’t fill the secret for you because the active workspace credential rule prohibits me from typing API keys. Paste it into the masked terminal prompt and press Enter; I can complete the connection test from there.

**Files written (2):**

- `C:/Users/dillo/AppData/Local/hermes/profiles/tokenharbor/Start-TokenHarborHermes.ps1`
- `C:/Users/dillo/Documents/Codex/2026-09-15/https-www-tiktok-com-t-zp83sqkxm/CHECKPOINT.md`

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\15\rollout-2026-09-15T18-52-09-01a0a745-421a-7833-b75b-cd3111cd822a.jsonl`</sub>
