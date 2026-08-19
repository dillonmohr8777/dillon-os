CMO lane operator board for Claude + Netlify.

This is not the `cmo seed` runtime. The runtime is not in this repository.
`11_Agents/cmo-lane.json` is the contract: `CMO_PROFILE=balanced`, four
earning agents, GEO simulated until a real SERP provider is connected.

```
node _os/automation/bin/cmo-lane-netlify-deploy.js --dry-run
```

Live publish needs a pinned `CMO_LANE_NETLIFY_SITE_ID` and approval. The
script never creates a Netlify site and refuses HTML without `noindex`.
