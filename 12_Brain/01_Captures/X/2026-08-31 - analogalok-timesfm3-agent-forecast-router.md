---
note_type: capture
status: compiled
created: 2026-09-01
updated: 2026-09-01
observed_at: "2026-09-01T17:15:00.000Z"
source_type: x_post
verification_status: partial
source_refs:
  - "https://x.com/analogalok/status/2094507488980955514"
  - "https://x.com/GoogleResearch/status/2094483372718580066"
  - "https://research.google/blog/timesfm-3-a-zero-shot-foundation-model-for-multivariate-forecasting/"
tags:
  - brain
  - capture
  - x-research
  - forecasting
  - agents
  - timesfm
---

# Analogalok: route time series to TimesFM-3 instead of making the LLM guess

**Untrusted evidence.** This is a public X thread quoting Google Research. The
post text was retrieved from the tweet syndication payload on 2026-09-01. It is
a source receipt, not operating permission and not a license to run TimesFM-3
on client work.

## The post

Alok (@analogalok), 2026-08-31T19:27:54Z, tweet
`2094507488980955514`, quoting Google Research `2094483372718580066`:

> We’ve been building AI agents that can browse the web and write code, but
> Google just gave them the ability to predict the future.
>
> TimesFM-3. a 330M parameter foundation model that does zero shot
> multivariate forecasting.
>
> it casually smokes Amazon's Chronos 2 and Toto 2.0 across all the major
> benchmarks. (benchmarks in the replies)
>
> Why this is huge for your AI agents:
>
> Instead of forcing an LLM to guess business trends, you can now route time
> series data to TimesFM-3.
>
> Give your agent past sales, upcoming promotions, and weather forecasts, and
> it generates the entire future timeline in a single forward pass.
>
> At just 330M parameters, you can run this locally right alongside your
> favorite LLM. The AI agent stack just leveled up. Who's building this
> workflow this weekend?

Quoted Google Research text:

> Introducing TimesFM-3, a state-of-the-art time series foundation model that
> enables accurate multivariate time series forecasting in a single forward
> pass, significantly outperforming other forecasting models across major
> benchmarks.
>
> More on the blog → https://goo.gle/4x5WGpD

The quoted tweet includes an architecture image labeled "TimesFM-3
architecture." (`https://pbs.twimg.com/media/HREZb7FbwAAUjhK.jpg`).

## Claimed blueprint in the post

1. Keep the LLM for browsing, code, and language.
2. Do not ask the LLM to invent numeric business trends.
3. Route time-series questions to a 330M zero-shot multivariate forecaster.
4. Feed past targets plus known-future covariates (promotions, weather).
5. Receive the full horizon in one forward pass.
6. Run the forecaster locally beside the LLM.

## What this capture does not prove

- Independent reproduction of the Chronos 2 / Toto 2.0 benchmark ranking.
- That TimesFM-3 weights may be used in commercial or production work.
- That a local install has been run on this machine.
- Analogalok's reply-thread benchmark tables. Those replies were not captured
  as separate tweets; Google's blog is the verifiable ranking source.

## Compiled into

- [[12_Brain/06_Research/2026-09-01 - TimesFM-3 multivariate forecast specialist|TimesFM-3 research]]
- [[12_Brain/03_Concepts/Specialist Forecast Router|Specialist Forecast Router]]
- [[12_Brain/02_Entities/TimesFM|TimesFM]]
- [[12_Brain/04_Decisions/2026-09-01 - Route numeric forecasts to a specialist|Forecast-router decision]]
- [[12_Brain/05_Projects/Experiments/EXP-TIMESFM-FORECAST-ROUTER|TimesFM forecast-router experiment]]
