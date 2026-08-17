import re, json
from datetime import datetime, timedelta

pat = re.compile(r"^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}),\d+\s+(.*)$")
conflict_re = re.compile(r"polling conflict|terminated by other getUpdates", re.I)

rows = []
with open(r"C:/Users/dillo/AppData/Local/hermes/logs/gateway.log", "r", encoding="utf-8", errors="replace") as f:
    for line in f:
        m = pat.match(line)
        if not m:
            continue
        ts = datetime.strptime(m.group(1), "%Y-%m-%d %H:%M:%S")
        rows.append((ts, m.group(2)))

now = datetime.now()
counts = {"1h": 0, "6h": 0, "24h": 0}
last_conflict = None
last_error = None

for ts, msg in rows:
    if conflict_re.search(msg):
        last_conflict = f"{ts} | {msg.strip()[:200]}"
        for name, hours in (("1h", 1), ("6h", 6), ("24h", 24)):
            if ts >= now - timedelta(hours=hours):
                counts[name] += 1
    if re.search(r"\b(ERROR|CRITICAL)\b", msg):
        last_error = f"{ts} | {msg.strip()[:200]}"

out = {
    "now": now.strftime("%Y-%m-%d %H:%M:%S"),
    "log_first_ts": str(rows[0][0]) if rows else None,
    "log_last_ts": str(rows[-1][0]) if rows else None,
    "conflicts": counts,
    "last_conflict": last_conflict,
    "last_error": last_error,
}
print(json.dumps(out, indent=2))
