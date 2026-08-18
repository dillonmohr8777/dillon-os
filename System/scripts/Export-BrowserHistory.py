"""Export Dillon's own Chrome/Edge history into the gitignored private layer.

Granted 2026-08-18 as operator context for agents. This is not a license to
read anyone else's machine, and the export never enters Git.

    python System/scripts/Export-BrowserHistory.py
    python System/scripts/Export-BrowserHistory.py --db fixture.sqlite --out /tmp/hist --days 14

Writes `12_Brain/private/browser-history/YYYY-MM-DD.md`. Query strings are
stripped. Login, password, bank, oauth, and billing paths are dropped. Titles
and domains only — no cookies, no credentials, no form bodies.
"""
from __future__ import print_function

import argparse
import datetime
import os
import re
import shutil
import sqlite3
import sys
import tempfile

try:
    from urllib.parse import urlparse
except ImportError:  # pragma: no cover
    from urlparse import urlparse

HERE = os.path.abspath(__file__)
VAULT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
DEFAULT_OUT = os.path.join(VAULT, '12_Brain', 'private', 'browser-history')

# Chrome/WebKit: microseconds since 1601-01-01 UTC.
CHROME_EPOCH = datetime.datetime(1601, 1, 1)

DROP_HOST_RE = re.compile(
    r'(^|\.)('
    r'accounts\.google\.com|login\.microsoftonline\.com|login\.live\.com|'
    r'appleid\.apple\.com|paypal\.com|chase\.com|bankofamerica\.com|'
    r'wellsfargo\.com|capitalone\.com|discover\.com'
    r')$',
    re.I,
)
DROP_PATH_RE = re.compile(
    r'/(signin|sign-in|login|log-in|logout|password|passwd|oauth|authorize|'
    r'billing|checkout|account|wallet|recovery|reset)(/|$)',
    re.I,
)
INTERNAL_RE = re.compile(r'^(chrome|edge|about|extension|devtools|file):', re.I)


def chrome_time(microseconds):
    try:
        return CHROME_EPOCH + datetime.timedelta(microseconds=int(microseconds))
    except (TypeError, ValueError, OverflowError):
        return None


def discover_dbs():
    found = []
    local = os.environ.get('LOCALAPPDATA') or ''
    home = os.path.expanduser('~')
    candidates = [
        os.path.join(local, 'Google', 'Chrome', 'User Data', 'Default', 'History'),
        os.path.join(local, 'Microsoft', 'Edge', 'User Data', 'Default', 'History'),
        os.path.join(home, '.config', 'google-chrome', 'Default', 'History'),
        os.path.join(home, '.config', 'microsoft-edge', 'Default', 'History'),
        os.path.join(home, 'Library', 'Application Support', 'Google', 'Chrome', 'Default', 'History'),
        os.path.join(home, 'Library', 'Application Support', 'Microsoft Edge', 'Default', 'History'),
    ]
    for path in candidates:
        if path and os.path.isfile(path):
            found.append(path)
    return found


def copy_unlocked(src):
    tmp = tempfile.NamedTemporaryFile(prefix='browser-history-', suffix='.sqlite', delete=False)
    tmp.close()
    shutil.copy2(src, tmp.name)
    return tmp.name


def sanitize_row(url, title, visit_count, last_visit_time):
    if not url or INTERNAL_RE.search(url):
        return None
    parsed = urlparse(url)
    host = (parsed.hostname or '').lower()
    if not host or DROP_HOST_RE.search(host):
        return None
    path = parsed.path or '/'
    if DROP_PATH_RE.search(path):
        return None
    visited = chrome_time(last_visit_time)
    if visited is None:
        return None
    title = (title or '').replace('\n', ' ').strip() or '(untitled)'
    if len(title) > 180:
        title = title[:177] + '...'
    return {
        'visited': visited,
        'domain': host,
        'path': path[:120],
        'title': title,
        'visit_count': int(visit_count or 0),
    }


def read_history(db_path, since):
    conn = sqlite3.connect(db_path)
    try:
        cur = conn.execute(
            'SELECT url, title, visit_count, last_visit_time FROM urls WHERE hidden = 0'
        )
    except sqlite3.Error:
        conn.close()
        return []
    rows = []
    for url, title, visit_count, last_visit_time in cur:
        item = sanitize_row(url, title, visit_count, last_visit_time)
        if item and item['visited'] >= since:
            rows.append(item)
    conn.close()
    rows.sort(key=lambda r: r['visited'], reverse=True)
    return rows


def write_export(rows, out_dir, sources):
    if not os.path.isdir(out_dir):
        os.makedirs(out_dir)
    today = datetime.date.today().isoformat()
    path = os.path.join(out_dir, '%s.md' % today)
    lines = [
        '---',
        'note_type: capture',
        'status: unprocessed',
        'created: %s' % today,
        'updated: %s' % today,
        'source_refs: ["local-browser-history"]',
        'tags: [private, browser-history]',
        '---',
        '',
        '# Browser history export — %s' % today,
        '',
        'Operator-owned Chrome/Edge history, sanitized. Query strings stripped.',
        'Login, password, bank, oauth, and billing paths dropped. Gitignored.',
        '',
        'Sources: %s' % (', '.join(os.path.basename(os.path.dirname(os.path.dirname(s))) or s for s in sources) or 'fixture'),
        '',
        '| When (UTC) | Domain | Title | Visits |',
        '|---|---|---|---|',
    ]
    for row in rows:
        when = row['visited'].strftime('%Y-%m-%d %H:%M')
        title = row['title'].replace('|', '/')
        lines.append('| %s | `%s` | %s | %s |' % (when, row['domain'], title, row['visit_count']))
    lines.append('')
    with open(path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(lines))
    return path


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--db', action='append', default=[], help='explicit History sqlite path (repeatable)')
    p.add_argument('--out', default=DEFAULT_OUT, help='output directory (must stay under 12_Brain/private)')
    p.add_argument('--days', type=int, default=14)
    args = p.parse_args(argv)

    out = os.path.abspath(args.out)
    private_root = os.path.abspath(os.path.join(VAULT, '12_Brain', 'private'))
    test_mode = bool(os.environ.get('BROWSER_HISTORY_TEST'))
    try:
        inside_private = os.path.commonpath([out, private_root]) == private_root
    except ValueError:
        inside_private = False
    if not inside_private and not test_mode:
        sys.stderr.write('refusing to write browser history outside 12_Brain/private/\n')
        return 2

    dbs = args.db or discover_dbs()
    if not dbs:
        print('no_history_db')
        print('searched Chrome/Edge default profiles; none present on this machine')
        return 0

    since = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None) - datetime.timedelta(days=max(1, args.days))
    rows = []
    copies = []
    try:
        for src in dbs:
            copy = copy_unlocked(src)
            copies.append(copy)
            rows.extend(read_history(copy, since))
    finally:
        for copy in copies:
            try:
                os.unlink(copy)
            except OSError:
                pass

    # Dedupe by domain+title keeping latest visit.
    seen = {}
    for row in rows:
        key = (row['domain'], row['title'])
        prev = seen.get(key)
        if prev is None or row['visited'] > prev['visited']:
            seen[key] = row
    ordered = sorted(seen.values(), key=lambda r: r['visited'], reverse=True)
    path = write_export(ordered, out, dbs)
    print('rows=%s' % len(ordered))
    print('path=%s' % path)
    return 0


if __name__ == '__main__':
    sys.exit(main())
