#!/usr/bin/env python3
"""
HubSpot Agent — token-route publisher for the Align HCM / GEO content system.

This is the Codex-independent replacement for the desktop HubSpot agent. It talks
to the HubSpot CMS Blog Posts v3 API directly using a Private App token, so blog
publishing and scheduling work from any environment (local, CI, or a Claude Code
web session) without the ChatGPT/Codex connector.

Auth:
    Set the token as an environment variable — never hardcode it, never paste it
    into a chat. See README.md and .env.example.

        export HUBSPOT_PRIVATE_APP_TOKEN="pat-na2-xxxxxxxx"

Safety:
    Every write (create / update / schedule / publish) is a DRY RUN by default.
    It prints exactly what it would send and stops. Add --confirm to actually
    execute. This mirrors the operating rule: draft first, Dillon approves sends.

Usage:
    python3 hubspot_agent.py whoami
    python3 hubspot_agent.py list-blogs
    python3 hubspot_agent.py list-authors
    python3 hubspot_agent.py list-posts [--state DRAFT|SCHEDULED|PUBLISHED] [--limit N]
    python3 hubspot_agent.py get-post --id 123
    python3 hubspot_agent.py create-post --file content/example-post.json [--confirm]
    python3 hubspot_agent.py schedule-post --id 123 --publish-date 2026-07-21T13:00:00Z [--confirm]
    python3 hubspot_agent.py publish-post --id 123 [--confirm]
    python3 hubspot_agent.py schedule-batch --file schedule.json [--confirm]
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

BASE = "https://api.hubapi.com"
TOKEN_ENV = "HUBSPOT_PRIVATE_APP_TOKEN"


def _token():
    tok = os.environ.get(TOKEN_ENV)
    if not tok:
        sys.exit(
            f"ERROR: {TOKEN_ENV} is not set.\n"
            f"Create a HubSpot Private App with the 'content' scope, then:\n"
            f'  export {TOKEN_ENV}="pat-na2-..."\n'
            f"See README.md for the full setup."
        )
    return tok


def _request(method, path, body=None, params=None):
    url = BASE + path
    if params:
        url += "?" + urllib.parse.urlencode({k: v for k, v in params.items() if v is not None})
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {_token()}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        detail = e.read().decode()
        sys.exit(f"HTTP {e.code} on {method} {path}\n{detail}")
    except urllib.error.URLError as e:
        sys.exit(f"Network error on {method} {path}: {e.reason}")


# ---------- read operations ----------

def whoami(_):
    info = _request("GET", "/account-info/v3/details")
    print(json.dumps(info, indent=2))
    print("\nToken OK — connected to HubSpot portal "
          f"{info.get('portalId', '?')} ({info.get('accountType', '?')}).")


def list_blogs(_):
    # Blog "content groups" are the parents that posts attach to via contentGroupId.
    res = _request("GET", "/cms/v3/blogs/posts", params={"limit": 1})
    # Derive distinct blogs from posts when the blogs endpoint isn't exposed.
    blogs = _request("GET", "/content/api/v2/blogs", params={"limit": 50})
    items = blogs.get("objects", blogs.get("results", []))
    if not items:
        print("No blogs returned by /content/api/v2/blogs. "
              "Fallback: contentGroupId seen on recent posts:")
        for p in res.get("results", []):
            print("  ", p.get("contentGroupId"), p.get("name"))
        return
    for b in items:
        print(f"{b.get('id')}\t{b.get('name')}\t{b.get('absolute_url', '')}")


def list_authors(_):
    res = _request("GET", "/cms/v3/blogs/authors", params={"limit": 100})
    for a in res.get("results", []):
        print(f"{a.get('id')}\t{a.get('displayName') or a.get('fullName')}\t{a.get('email', '')}")


def list_posts(args):
    params = {"limit": args.limit}
    if args.state:
        params["state"] = args.state
    res = _request("GET", "/cms/v3/blogs/posts", params=params)
    for p in res.get("results", []):
        print(f"{p.get('id')}\t{p.get('state'):<10}\t{p.get('publishDate', '')}\t{p.get('name')}")


def get_post(args):
    print(json.dumps(_request("GET", f"/cms/v3/blogs/posts/{args.id}"), indent=2))


# ---------- write operations (dry-run gated) ----------

def _gate(args, method, path, body, action_desc):
    print(f"\n=== {action_desc} ===")
    print(f"{method} {path}")
    print(json.dumps(body, indent=2))
    if not args.confirm:
        print("\nDRY RUN — nothing sent. Re-run with --confirm to execute.")
        return None
    result = _request(method, path, body=body)
    print("\nDONE. Response:")
    print(json.dumps(result, indent=2))
    return result


def create_post(args):
    with open(args.file) as f:
        post = json.load(f)
    required = ["name", "contentGroupId"]
    missing = [k for k in required if not post.get(k)]
    if missing:
        sys.exit(f"content file missing required fields: {missing}")
    # Default to DRAFT unless the file explicitly sets state/publishDate.
    post.setdefault("state", "DRAFT")
    _gate(args, "POST", "/cms/v3/blogs/posts", post,
          f"CREATE blog post '{post['name']}' (state={post['state']})")


def schedule_post(args):
    body = {"id": str(args.id), "publishDate": args.publish_date}
    _gate(args, "POST", "/cms/v3/blogs/posts/schedule", body,
          f"SCHEDULE post {args.id} for {args.publish_date}")


def publish_post(args):
    # Publish now = schedule with an immediate/one-shot publish via state flip.
    body = {"state": "PUBLISHED"}
    _gate(args, "PATCH", f"/cms/v3/blogs/posts/{args.id}", body,
          f"PUBLISH post {args.id} now")


def schedule_batch(args):
    with open(args.file) as f:
        plan = json.load(f)
    entries = plan.get("schedule", plan if isinstance(plan, list) else [])
    print(f"Batch schedule: {len(entries)} item(s)")
    for i, entry in enumerate(entries, 1):
        pid = entry.get("id")
        when = entry.get("publishDate")
        if not pid or not when:
            print(f"  [{i}] SKIP — missing id or publishDate: {entry}")
            continue
        body = {"id": str(pid), "publishDate": when}
        _gate(args, "POST", "/cms/v3/blogs/posts/schedule", body,
              f"[{i}/{len(entries)}] SCHEDULE post {pid} for {when}")


def main():
    p = argparse.ArgumentParser(description="HubSpot token-route blog publisher")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("whoami").set_defaults(func=whoami)
    sub.add_parser("list-blogs").set_defaults(func=list_blogs)
    sub.add_parser("list-authors").set_defaults(func=list_authors)

    lp = sub.add_parser("list-posts")
    lp.add_argument("--state", choices=["DRAFT", "SCHEDULED", "PUBLISHED"])
    lp.add_argument("--limit", type=int, default=20)
    lp.set_defaults(func=list_posts)

    gp = sub.add_parser("get-post")
    gp.add_argument("--id", required=True)
    gp.set_defaults(func=get_post)

    cp = sub.add_parser("create-post")
    cp.add_argument("--file", required=True)
    cp.add_argument("--confirm", action="store_true")
    cp.set_defaults(func=create_post)

    sp = sub.add_parser("schedule-post")
    sp.add_argument("--id", required=True)
    sp.add_argument("--publish-date", required=True, help="ISO8601, e.g. 2026-07-21T13:00:00Z")
    sp.add_argument("--confirm", action="store_true")
    sp.set_defaults(func=schedule_post)

    pp = sub.add_parser("publish-post")
    pp.add_argument("--id", required=True)
    pp.add_argument("--confirm", action="store_true")
    pp.set_defaults(func=publish_post)

    sb = sub.add_parser("schedule-batch")
    sb.add_argument("--file", required=True)
    sb.add_argument("--confirm", action="store_true")
    sb.set_defaults(func=schedule_batch)

    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
