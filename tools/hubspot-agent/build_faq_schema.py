#!/usr/bin/env python3
"""
AEO/GEO fix P1 — inject clean BlogPosting + FAQPage JSON-LD into Align HCM blog posts.

Extracts each post's REAL, visible FAQ Q&A (Google requires schema to match on-page
content), builds a combined schema.org @graph, and writes it into the post's headHtml
(wrapped in markers so it's idempotent and reversible — the visible body is never touched).

Dry-run by default. Add --confirm to PATCH live.

    python3 build_faq_schema.py            # dry run: show generated schema per post
    python3 build_faq_schema.py --confirm  # apply to all FAQ posts
    python3 build_faq_schema.py --confirm --only "ADP"   # just matching titles
"""
import json, os, re, sys, html, urllib.request, urllib.error, urllib.parse

BASE = "https://api.hubapi.com"
TOKEN = os.environ.get("HUBSPOT_PRIVATE_APP_TOKEN")
LOGO = "https://www.alignhcm.com/hs-fs/hubfs/Align%20HCM%20logo.png"
ORG = {"@type": "Organization", "name": "Align HCM", "url": "https://www.alignhcm.com"}
START, END = "<!-- align-aeo-schema:start -->", "<!-- align-aeo-schema:end -->"

if not TOKEN:
    sys.exit("Set HUBSPOT_PRIVATE_APP_TOKEN")


def api(method, path, body=None, params=None):
    url = BASE + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", "Bearer " + TOKEN)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} {method} {path}\n{e.read().decode()[:500]}")


def clean(s):
    s = re.sub(r"<[^>]+>", "", s or "")
    return html.unescape(re.sub(r"\s+", " ", s)).strip()


def extract_faqs(body):
    """Return [(question, answer)] from the visible FAQ markup."""
    pairs = []
    # Primary: <div class="abg-faq"><h3>Q</h3><p>A</p></div>
    for m in re.finditer(r'class="abg-faq"[^>]*>\s*<h[234][^>]*>(.*?)</h[234]>\s*<p[^>]*>(.*?)</p>', body, re.I | re.S):
        q, a = clean(m.group(1)), clean(m.group(2))
        if q and a:
            pairs.append((q, a))
    if pairs:
        return pairs
    # Fallback: question-style headings (ending in ?) followed by a paragraph
    for m in re.finditer(r'<h[23][^>]*>([^<]*\?)</h[23]>\s*<p[^>]*>(.*?)</p>', body, re.I | re.S):
        q, a = clean(m.group(1)), clean(m.group(2))
        if q and a and len(a) > 20:
            pairs.append((q, a))
    return pairs


def build_graph(post, faqs):
    url = post.get("url") or ("https://www.alignhcm.com/blog/" + (post.get("slug") or ""))
    pub = post.get("publishDate") or post.get("created")
    mod = post.get("updated") or pub
    article = {
        "@type": "BlogPosting",
        "@id": url + "#article",
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "headline": clean(post.get("name")),
        "description": clean(post.get("metaDescription")),
        "datePublished": pub,
        "dateModified": mod,
        "author": ORG,
        "publisher": {"@type": "Organization", "name": "Align HCM",
                      "logo": {"@type": "ImageObject", "url": LOGO}},
        "url": url,
    }
    if post.get("featuredImage"):
        article["image"] = post["featuredImage"]
    graph = [article]
    if faqs:
        graph.append({
            "@type": "FAQPage",
            "@id": url + "#faq",
            "mainEntity": [
                {"@type": "Question", "name": q,
                 "acceptedAnswer": {"@type": "Answer", "text": a}}
                for q, a in faqs
            ],
        })
    return {"@context": "https://schema.org", "@graph": graph}


def wrap(graph):
    js = json.dumps(graph, indent=2, ensure_ascii=False)
    return f'{START}\n<script type="application/ld+json">\n{js}\n</script>\n{END}'


def merge_head(existing, block):
    existing = existing or ""
    if START in existing and END in existing:
        return re.sub(re.escape(START) + r".*?" + re.escape(END), block, existing, flags=re.S)
    return (existing + "\n" + block).strip()


def main():
    confirm = "--confirm" in sys.argv
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1].lower()
    res = api("GET", "/cms/v3/blogs/posts", params={
        "state": "PUBLISHED", "sort": "-publishDate", "limit": "20",
        "property": "id,name,slug,url,metaDescription,publishDate,updated,featuredImage,postBody,headHtml",
    })
    done = skipped = 0
    for p in res.get("results", []):
        name = p.get("name", "")
        if only and only not in name.lower():
            continue
        faqs = extract_faqs(p.get("postBody", "") or "")
        if not faqs:
            print(f"— SKIP (no FAQ found): {name[:56]}")
            skipped += 1
            continue
        graph = build_graph(p, faqs)
        block = wrap(graph)
        print(f"\n=== {name[:60]}  ({len(faqs)} Q&A) ===")
        print(block if not confirm else f"[applying schema, {len(faqs)} questions]")
        if confirm:
            new_head = merge_head(p.get("headHtml"), block)
            api("PATCH", f"/cms/v3/blogs/posts/{p['id']}", body={"headHtml": new_head})
            print("  ✓ headHtml updated")
        done += 1
    print(f"\n{'APPLIED' if confirm else 'DRY RUN'}: {done} post(s) with schema, {skipped} skipped.")
    if not confirm:
        print("Re-run with --confirm to write live.")


if __name__ == "__main__":
    main()
