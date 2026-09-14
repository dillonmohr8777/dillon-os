"""Assemble the business ledger: one row per client, from evidence on disk.

This is the shared state layer. Every loop-owner reads it and writes to it, so
that the current state of the business lives in one place instead of scattered
across approval-queue.md, intake/, 12_Brain and per-client deliverables with
Dillon as the integration layer between them.

Run:  python _os/automation/bin/build-business-ledger.py
Out:  12_Brain/state/business-ledger.jsonl   (one JSON object per client)
      12_Brain/state/business-ledger.md      (the same thing, readable)

Every field is labelled with how it is known. Three states, always explicit:
  measured           - the underlying records are on disk and were counted
  platform_reported  - an ad platform said so and nobody verified it
  not_measurable     - say what is missing rather than printing a number

A field that cannot be filled is never guessed. `null` with a stated reason beats
a plausible number, because the whole point of this file is that Dillon can
defend anything it says.
"""
import io
import json
import os
import re
import sys
from datetime import datetime, timezone

VAULT = r"C:\Users\dillo\repos\dillon-os"
CLIENT_OPS = r"C:\Users\dillo\Documents\Codex\projects\client-operations"
REGISTRY = os.path.join(CLIENT_OPS, "registry", "clients.json")
ADS_PULLS = os.path.join(VAULT, "_os", "automation", "google-ads-api", "pulls")
OUT_DIR = os.path.join(VAULT, "12_Brain", "state")

RECEIPT_HINTS = ("delivery-receipt", "DELIVERY", "RECEIPT", "send-receipt", "send-receipts")


def load_registry():
    with io.open(REGISTRY, encoding="utf-8-sig") as fh:
        return json.load(fh)["clients"]


def all_matching(folder, pattern):
    """Every immediate subdirectory whose name matches, oldest first."""
    if not os.path.isdir(folder):
        return []
    return sorted(d for d in os.listdir(folder) if re.search(pattern, d, re.I))


def newest_matching(folder, pattern):
    """Newest immediate subdirectory whose name matches, or None."""
    hits = all_matching(folder, pattern)
    return hits[-1] if hits else None


def has_delivery_evidence(deliv_dir):
    """A deliverable counts as delivered only if a receipt file exists in it."""
    if not os.path.isdir(deliv_dir):
        return None
    for root, _, files in os.walk(deliv_dir):
        for f in files:
            if any(h.lower() in f.lower() for h in RECEIPT_HINTS):
                return os.path.relpath(os.path.join(root, f), CLIENT_OPS).replace("\\", "/")
    return None


def ads_figures(client_id):
    """Spend and conversions, from whatever Google Ads pulls exist on disk."""
    if not os.path.isdir(ADS_PULLS):
        return None
    prefix = {"omega-landscaping": "Omega", "nexla": "Nexla",
              "onsite-concrete-landscape": "Onsite"}.get(client_id)
    if not prefix:
        return None
    hits = [f for f in os.listdir(ADS_PULLS)
            if f.startswith(prefix) and "campaign_delivery" in f]
    if not hits:
        return None
    path = os.path.join(ADS_PULLS, sorted(hits)[-1])
    try:
        with io.open(path, encoding="utf-8-sig") as fh:
            data = json.load(fh)
    except Exception as exc:
        return {"source": os.path.basename(path), "error": str(exc)[:80]}

    rows = data if isinstance(data, list) else data.get("results", data.get("rows", []))
    spend_micros, conversions = 0, 0.0
    for r in rows if isinstance(rows, list) else []:
        m = r.get("metrics", r) if isinstance(r, dict) else {}
        try:
            spend_micros += int(m.get("costMicros", m.get("cost_micros", 0)) or 0)
            conversions += float(m.get("conversions", 0) or 0)
        except (TypeError, ValueError):
            continue
    return {
        "source": os.path.basename(path),
        "spend_usd": round(spend_micros / 1_000_000, 2),
        "platform_conversions": round(conversions, 2),
        "label": "platform_reported",
    }


def main():
    rows = []
    for c in load_registry():
        cid = c["id"]
        folder = os.path.join(CLIENT_OPS, c.get("folder", ""))
        deliverables = os.path.join(folder, "deliverables")

        report_dirs = all_matching(deliverables, r"weekly-(report|update)")
        report_dir = report_dirs[-1] if report_dirs else None

        # Delivery is a property of the CLIENT, not of their newest folder. An
        # earlier version checked only the newest, so a client whose 09-14 folder
        # had no receipt read as never-delivered even with a verified 09-08
        # receipt one folder over. That understated both built and delivered.
        receipt, receipt_from = None, None
        for d in reversed(report_dirs):
            found = has_delivery_evidence(os.path.join(deliverables, d))
            if found:
                receipt, receipt_from = found, d
                break
        ads = ads_figures(cid)

        blockers = []
        if report_dir and not receipt:
            blockers.append("report built, no delivery receipt")
        if not report_dir:
            blockers.append("no weekly report on disk")
        if ads and ads.get("spend_usd"):
            blockers.append("no named accepted leads; conversions are platform_reported only")
        if cid == "omega-landscaping":
            blockers.append("conversion tag corrected and deployed 2026-09-14; expect reported conversions to fall")
        if cid == "onsite-concrete-landscape":
            blockers.append("9 primary conversion actions incl. directions taps; page has no tracking at all")

        rows.append({
            "client": cid,
            "display_name": c.get("displayName"),
            "status": c.get("status"),
            "spend_usd": ads.get("spend_usd") if ads else None,
            "spend_label": ads.get("label") if ads else "not_measurable",
            "platform_conversions": ads.get("platform_conversions") if ads else None,
            "accepted_leads": None,
            "accepted_leads_label": "not_measurable",
            "accepted_leads_reason": "Zapier notifications carry a link, not the lead. No client has named-lead data as of 2026-09-14.",
            "ads_source": ads.get("source") if ads else None,
            "report_built": report_dir,
            "reports_built_total": len(report_dirs),
            "report_delivered": bool(receipt),
            "delivered_from_folder": receipt_from,
            "delivery_receipt": receipt,
            "never_delivered": not receipt,
            "blockers": blockers,
        })

    os.makedirs(OUT_DIR, exist_ok=True)
    jl = os.path.join(OUT_DIR, "business-ledger.jsonl")
    with io.open(jl, "w", encoding="utf-8") as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")

    delivered = sum(1 for r in rows if r["report_delivered"])
    built = sum(1 for r in rows if r["report_built"])
    with_spend = [r for r in rows if r["spend_usd"]]

    md = [
        "# Business ledger",
        "",
        "Generated by `_os/automation/bin/build-business-ledger.py` at "
        + datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC") + ".",
        "Do not hand-edit. Re-run the builder.",
        "",
        "| Client | Status | Spend | Conv (platform) | Accepted leads | Report built | Delivered |",
        "|---|---|---|---|---|---|---|",
    ]
    for r in sorted(rows, key=lambda x: (x["status"] != "active", x["client"])):
        md.append("| {} | {} | {} | {} | {} | {} | {} |".format(
            r["client"], r["status"],
            "${:,.2f}".format(r["spend_usd"]) if r["spend_usd"] else "-",
            r["platform_conversions"] if r["platform_conversions"] is not None else "-",
            "**none**",
            r["report_built"] or "-",
            "yes" if r["report_delivered"] else "**no**"))
    md += [
        "",
        "## What this says",
        "",
        "- **{} of {} clients** have a report on disk; **{} have a delivery receipt on disk**.".format(built, len(rows), delivered),
        "- **A missing receipt is not proof nothing was sent.** This script reads files, and a send",
        "  recorded only as a Gmail message id is invisible to it. nexla is the known case: verified",
        "  sent 2026-09-10 (message `1a08d1c2d7d72b1c`) with no receipt file in its report folder.",
        "  Treat `never_delivered` as *no evidence on disk*, and confirm against the mailbox before",
        "  telling a client they were missed.",
        "- **Accepted leads is empty for every client.** That is the finding, not a gap in this script.",
        "  Lead notifications carry a link instead of the lead, so there is nothing to reconcile",
        "  platform conversions against. Fixing the Zapier payload is the unlock and needs nobody's",
        "  permission but Dillon's.",
        "- Spend and conversions are **platform_reported**, never measured. Omega's tag was firing",
        "  before the form was accepted until it was corrected on 2026-09-14, so figures before that",
        "  date are inflated by an unknown amount.",
        "",
        "## Blockers",
        "",
    ]
    for r in rows:
        if r["blockers"]:
            md.append("**{}**".format(r["client"]))
            md += ["- " + b for b in r["blockers"]]
            md.append("")

    mdp = os.path.join(OUT_DIR, "business-ledger.md")
    io.open(mdp, "w", encoding="utf-8").write("\n".join(md) + "\n")

    print("clients: %d" % len(rows))
    print("reports built: %d   delivered: %d" % (built, delivered))
    print("clients with spend figures: %d (%s)" % (
        len(with_spend), ", ".join(r["client"] for r in with_spend) or "none"))
    print("clients with accepted-lead data: 0  <- the whole problem")
    print("wrote %s" % jl)
    print("wrote %s" % mdp)

    if built and delivered == 0:
        print("\nWARNING: reports exist and NONE has a delivery receipt.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
