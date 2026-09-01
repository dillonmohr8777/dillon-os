CMO lane operator board for Claude + Netlify.

Navy/gold Momentum 360 look: Montserrat + Inter, constellation hero, cute
agent mascots for the four earning agents plus the seven OS roles, and
stylized platform marks (Ads, GBP, Places, Search Console, Meta, WordPress,
DataForSEO, Anthropic, Netlify). Still `noindex`. Not a client report.

This is not the `cmo seed` runtime. The runtime is not in this repository.
`11_Agents/cmo-lane.json` is the contract: `CMO_PROFILE=balanced`, four
earning agents, GEO simulated until a real SERP provider is connected.

```
node _os/automation/bin/cmo-lane-netlify-deploy.js --dry-run
```

Live publish needs a pinned `CMO_LANE_NETLIFY_SITE_ID` and approval. The
script never creates a Netlify site and refuses HTML without `noindex`.
