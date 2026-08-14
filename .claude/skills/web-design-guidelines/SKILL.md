---
name: web-design-guidelines
description: Fetch Vercel Web Interface Guidelines at review time and apply them to Need Momentum / factory HTML. Use when reviewing or generating UI. Do not vendor the upstream file.
---

# Web design guidelines (Vercel adapter)

One-line: Pull the current Vercel Web Interface Guidelines when reviewing UI. Do not freeze a stale copy in the vault.

## Fetch at review time

```bash
curl -fsSL https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Upstream: [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines). Wrapper pattern also lives in Vercel agent-skills `web-design-guidelines`.

If the fetch fails, fall back to vault [ui-design](../ui-design/SKILL.md) and do not invent a third standard.

## Factory overlay

Vercel guidelines are general. Need Momentum factory still wins on:

- Harvested tokens over generic "clean SaaS"
- Local service businesses (phone, NAP, hours, service area)
- No fake social proof
- [anti-slop-design](../anti-slop-design/SKILL.md) after the Vercel pass
