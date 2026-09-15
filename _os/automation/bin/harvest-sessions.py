#!/usr/bin/env python3
"""Harvest the human asks out of local Claude/Codex session transcripts.

The daily learning loop's eyes. ~/.claude/projects holds 270MB+ of .jsonl that
would blow any context window; this keeps only the lines a human actually typed,
grouped by workspace and branch, so a day's intent fits in a few KB.

  python harvest-sessions.py [hours=36] [--full]

--full prints every ask (default caps each workspace at 12). Writes UTF-8.
"""
import json, sys, os, glob, time, io
from datetime import datetime, timezone, timedelta

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

ROOT = os.path.expanduser(r'~\.claude\projects')
HOURS = next((int(a) for a in sys.argv[1:] if a.isdigit()), 36)
FULL = '--full' in sys.argv
CAP = 10**9 if FULL else 12

B = chr(92); PFX = B + B + '?' + B          # \?\  Windows MAX_PATH escape
def lp(p):
    a = os.path.abspath(p)
    return PFX + a if os.name == 'nt' and not a.startswith(PFX) else a

# Harness-generated records that are not the human speaking.
NOISE = ('<command-', '<local-command', '<system-reminder', '<task-notification',
         '<bash-input', '<bash-stdout', '<bash-stderr', '<user-prompt-submit',
         '<scheduled-task', '<ci-monitor-event', '<task-progress',
         'Caveat:', '[Request interrupted')

cut = datetime.now(timezone.utc) - timedelta(hours=HOURS)
cutoff = time.time() - HOURS * 3600
os.chdir(ROOT)

files, skipped = [], 0
for f in glob.glob('**/*.jsonl', recursive=True):
    if os.sep + 'subagents' + os.sep in os.sep + f:   # subagent chatter, not human
        continue
    try:
        if os.path.getmtime(lp(f)) > cutoff:
            files.append(f)
    except OSError:
        skipped += 1

out = {}
for f in files:
    try:
        fh = open(lp(f), encoding='utf-8', errors='replace')
    except OSError:
        skipped += 1
        continue
    with fh:
        for line in fh:
            if '"type":"user"' not in line and '"type": "user"' not in line:
                continue                                  # cheap prefilter
            try:
                d = json.loads(line)
            except Exception:
                continue
            if d.get('type') != 'user' or d.get('isSidechain'):
                continue
            c = (d.get('message') or {}).get('content')
            if not isinstance(c, str) or not c.strip():
                continue                                  # tool_result arrays
            if c.lstrip().startswith(NOISE):
                continue
            ts = d.get('timestamp', '')
            try:
                if datetime.fromisoformat(ts.replace('Z', '+00:00')) < cut:
                    continue
            except Exception:
                continue
            key = (d.get('cwd', '?'), d.get('gitBranch') or '-')
            out.setdefault(key, []).append((ts, ' '.join(c.split())[:300]))

total = 0
for (cwd, br), msgs in sorted(out.items(), key=lambda kv: -len(kv[1])):
    msgs.sort()
    total += len(msgs)
    print('\n### %s  [%s]  (%d asks)' % (cwd, br, len(msgs)))
    for ts, c in msgs[:CAP]:
        print('  %s  %s' % (ts[:16], c))
    if len(msgs) > CAP:
        print('  ... +%d more (rerun with --full)' % (len(msgs) - CAP))
sys.stderr.write('\n== %d asks / %d workspaces / %d transcripts / %d unreadable ==\n'
                 % (total, len(out), len(files), skipped))

def demo():
    assert lp('x').endswith('x')
    n = [c for c in ('<task-notification> hi', '<bash-input> ls', 'real ask')
         if not c.lstrip().startswith(NOISE)]
    assert n == ['real ask'], n
    print('harvest-sessions self-check OK')

if '--selftest' in sys.argv:
    demo()
