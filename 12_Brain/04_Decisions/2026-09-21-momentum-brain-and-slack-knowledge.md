---
date: 2026-09-21
status: partially-implemented
owner: Dillon
---

# Momentum gets its own brain; the Slack knowledge stays scoped, not wired

## The problem found

`System/agent-memory/sync_vault.py` `classify()` had seven branches and no
Momentum in any of them. Two consequences, both live until tonight:

1. `01_Clients/Momentum 360/` matched the client branch, becoming
   `client-momentum-360` with scope "Isolated Obsidian client memory". The
   agency was a client of itself, and the standing rule *never combine client
   spaces* meant Momentum's own knowledge — including the whole AI Division
   Library — was sealed off from the operating layer agents actually query.
2. Everything with no matching branch fell through the catch-all into
   `dillon-shared`, "Dillon shared operating memory". That swallowed
   `04_SOPs`, `11_Agents`, `03_Content`, `08_Prospects`, `SEO` and
   `ai-division` — the agency's operating knowledge, filed as personal.

## Decided and done

Both now route to **`momentum-shared`** — "Momentum company knowledge".

- Real client and employer isolation is unchanged. `test_classify.py` asserts
  this explicitly and is the regression gate; it must keep passing.
- Verified after re-sync (exit 0): `momentum-shared` is live in the gateway,
  `client-momentum-360` is gone from the roster, all 40 real client spaces
  still isolated.
- Commit `48c0f38e` in `dillon-os`.

## Scoped, deliberately not built: the third brain

The DeerFlow workspace holds a **47-document project — one index plus 46
joined Slack channels, Aug 21 to Sep 20 Eastern, 4,116 messages including 674
replies**, with 61 sensitive messages withheld and 8 channels empty in the
window. That is Momentum company knowledge, and it is **not in agent-memory at
all**. It lives only inside the DeerFlow gateway.

Wiring it in is not a folder sync, which is why it was scoped rather than
done:

- It lives in the `deer-flow_gateway-data` Docker volume behind
  authentication, not on the filesystem `sync_vault.py` walks. There is no
  path to point the existing ingester at.
- Reaching it needs an **owner-authenticated export** — the API returns 404
  for foreign owners and native foreign-owner retrieval is denied, which is
  correct behaviour and also the obstacle.
- It is a **dated snapshot**, not a live feed. The Sep 20 deployment
  explicitly did not add continuous Slack sync. Ingesting it would put a
  frozen September window into memory that silently ages.
- **61 messages were withheld as sensitive.** Any export has to preserve that
  decision rather than re-derive it, or the withholding is undone.
- Client-identifying content in those channels would need routing to the
  right isolated client spaces, not bulk-loading into `momentum-shared`.
  This is the hard part and the reason to do it deliberately.

### What it would take

1. An owner-authenticated export endpoint or a read-only query against the
   gateway volume, producing documents plus provenance.
2. A classifier deciding, per document, company vs client space — with the
   existing isolation rules enforced, not assumed.
3. A freshness marker so memory answers state the snapshot date.
4. A re-export path, since without continuous sync the data is stale by
   construction.

**Recommendation:** leave it queryable inside DeerFlow, where it already works
and where auth already scopes it, until there is a reason to query it from
outside. Duplicating a stale snapshot into the vault buys little and risks the
isolation guarantees that were just fixed.

## Open

- 3 of these were decided by Dillon on 2026-09-21 ~03:55 ET.
- Related: [[momentum-360-is-not-a-client]] if that note is ever written.
