"""Validate the 25 archetype-built sites: each <slug>/index.html is a self-contained page.
Checks: HTML tag balance, inline <script> JS syntax (via node --check), no unresolved
template tokens, every referenced asset exists, real business data present (phone in tel: link,
schema JSON-LD), and archetype marker present."""
import os, re, subprocess, sys, json, tempfile

BASE = r"C:\Users\dillo\Documents\Codex\2026-07-31\push-to-netlify-4\dillon-os-pr242\philly-sites-b2"
VOID = {"meta", "link", "img", "br", "input", "hr", "source", "wbr", "area", "base", "col", "embed", "track"}

sites = sorted(
    d for d in os.listdir(BASE)
    if os.path.isdir(os.path.join(BASE, d))
    and not d.startswith(("_", "."))
    and os.path.exists(os.path.join(BASE, d, "index.html"))
)

fails = []
for s in sites:
    d = os.path.join(BASE, s)
    hp = os.path.join(d, "index.html")
    h = open(hp, encoding="utf-8").read()

    # 1) tag balance on markup only: strip <script>, <style>, and HTML comments first
    markup = re.sub(r"<script\b[^>]*>.*?</script>", "", h, flags=re.S)
    markup = re.sub(r"<style\b[^>]*>.*?</style>", "", markup, flags=re.S)
    markup = re.sub(r"<!--.*?-->", "", markup, flags=re.S)
    stack = []
    for tm in re.finditer(r"<(/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>\"']|\"[^\"]*\"|'[^']*')*)>", markup):
        closing, tag = tm.group(1), tm.group(2).lower()
        if tag in VOID or tm.group(3).rstrip().endswith("/"):
            continue
        if closing:
            if stack and stack[-1] == tag:
                stack.pop()
            elif tag in stack:
                fails.append(f"{s}: mis-nested </{tag}>")
                while stack and stack[-1] != tag:
                    stack.pop()
                if stack:
                    stack.pop()
        else:
            stack.append(tag)
    if stack:
        fails.append(f"{s}: unclosed tags {stack[:5]}")

    # 2) unresolved tokens / python-era leftovers
    for tok in ["__PAPER__", "__INK__", "__ACCENT__", "__DEEP__", "{esc(", "tpl-", "{t[", "ASSIGN"]:
        if tok in h:
            fails.append(f"{s}: leftover token {tok!r}")

    # 3) inline script JS syntax
    scripts = re.findall(r"<script(?![^>]*application/ld\+json)[^>]*>(.*?)</script>", h, re.S)
    for i, body in enumerate(scripts):
        if not body.strip():
            continue
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as tf:
            tf.write(body)
            tpath = tf.name
        r = subprocess.run(["node", "--check", tpath], capture_output=True, text=True)
        os.unlink(tpath)
        if r.returncode != 0:
            fails.append(f"{s}: inline script {i} JS syntax error: {r.stderr[:160]}")

    # 4) referenced assets exist
    for a in set(re.findall(r'(?:src|href)="(assets/[^"]+)"', h)):
        if not os.path.exists(os.path.join(d, a)):
            fails.append(f"{s}: missing asset {a}")

    # 5) real data present
    if not re.search(r'href="tel:[0-9()+.\- ]+"', h):
        fails.append(f"{s}: no tel: link")
    if "application/ld+json" not in h:
        fails.append(f"{s}: missing schema JSON-LD")

    # 6) archetype marker: body carries site-<slug> + arch-<archetype> classes
    m = re.search(r'<body[^>]*class="([^"]*)"', h)
    if not m or f"site-{s}" not in m.group(1) or "arch-" not in m.group(1):
        fails.append(f"{s}: body missing site/arch classes")

print(f"checked {len(sites)} sites")
if fails:
    print("FAILURES:")
    for f in fails:
        print(" -", f)
    sys.exit(1)
print("ALL LOCAL VALIDATION PASSED")
