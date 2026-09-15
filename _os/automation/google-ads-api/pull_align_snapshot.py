r"""Pull Align HCM's Search Console + GA4 snapshot DIRECT (no Composio), using the gcloud ADC
at %APPDATA%/gcloud/application_default_credentials.json (Cloud project 150963436905, read-only scopes).

Writes JSON per dataset + MANIFEST.json (SHA-256 per file, row counts, date coverage) + gap-table.csv.
Read-only. Prints no secret values.

Usage: <GoogleAdsProbe venv python> pull_align_snapshot.py [--out data/align-snapshot-YYYY-MM-DD]
"""
import argparse, csv, hashlib, json, os, sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

SITE = 'https://www.alignhcm.com/'
GA4_PROPERTY = 'properties/320235048'
START = '2026-01-01'                      # full 2026; HubSpot credit window (01-26) is applied downstream, not at pull
END = (date.today() - timedelta(days=3)).isoformat()   # GSC final data lags ~3 days
GSC_DIMS = [['query'], ['page'], ['date'], ['query', 'page'], ['device'], ['country'], ['date', 'page']]


def creds():
    p = Path(os.environ['APPDATA']) / 'gcloud' / 'application_default_credentials.json'
    d = json.loads(p.read_text(encoding='utf-8'))
    c = Credentials(token=None, refresh_token=d['refresh_token'], client_id=d['client_id'],
                    client_secret=d['client_secret'], token_uri='https://oauth2.googleapis.com/token')
    c.refresh(Request())
    return c


def gsc_query(s, dims, search_type='web'):
    rows, start_row, limit = [], 0, 25000
    while True:
        body = {'startDate': START, 'endDate': END, 'dimensions': dims, 'rowLimit': limit,
                'startRow': start_row, 'type': search_type, 'dataState': 'final'}
        r = s.post(f'https://searchconsole.googleapis.com/webmasters/v3/sites/{requests.utils.quote(SITE, safe="")}/searchAnalytics/query',
                   json=body, timeout=120)
        r.raise_for_status()
        got = r.json().get('rows', [])
        rows += got
        if len(got) < limit:
            return rows
        start_row += limit


def ga4_report(s, dims, metrics, extra=None):
    body = {'dateRanges': [{'startDate': START, 'endDate': END}],
            'dimensions': [{'name': d} for d in dims], 'metrics': [{'name': m} for m in metrics],
            'limit': 100000, 'keepEmptyRows': False}
    body.update(extra or {})
    r = s.post(f'https://analyticsdata.googleapis.com/v1beta/{GA4_PROPERTY}:runReport', json=body, timeout=120)
    r.raise_for_status()
    j = r.json()
    return [{**{d: v['value'] for d, v in zip(dims, row.get('dimensionValues', []))},
             **{m: v['value'] for m, v in zip(metrics, row.get('metricValues', []))}} for row in j.get('rows', [])]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--out', default=f'data/align-snapshot-{date.today().isoformat()}')
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    s = requests.Session(); s.headers['Authorization'] = f'Bearer {creds().token}'
    manifest = {'pulled_at_utc': datetime.now(timezone.utc).isoformat(timespec='seconds'), 'site': SITE,
                'ga4_property': GA4_PROPERTY, 'start': START, 'end': END, 'auth': 'gcloud ADC, project 150963436905, read-only',
                'files': {}}

    def save(name, obj):
        p = out / name
        data = json.dumps(obj, indent=1, ensure_ascii=False).encode('utf-8')
        p.write_bytes(data)
        n = len(obj) if isinstance(obj, list) else len(obj.get('sitemap', obj.get('rows', obj)))
        manifest['files'][name] = {'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'rows': n}
        print(f'{name}: {n} rows, {len(data)} bytes')

    # Search Console
    r = s.get(f'https://searchconsole.googleapis.com/webmasters/v3/sites/{requests.utils.quote(SITE, safe="")}/sitemaps', timeout=60)
    r.raise_for_status(); save('gsc-sitemaps.json', r.json())
    gsc = {}
    for dims in GSC_DIMS:
        gsc['+'.join(dims)] = gsc_query(s, dims)
        save(f'gsc-{"+".join(dims)}.json', gsc['+'.join(dims)])
    save('gsc-totals.json', gsc_query(s, []))

    # GA4
    ga4_day_channel = ga4_report(s, ['date', 'sessionDefaultChannelGroup'], ['sessions', 'engagedSessions', 'conversions'])
    save('ga4-date+channel.json', ga4_day_channel)
    save('ga4-landing+channel.json', ga4_report(s, ['landingPagePlusQueryString', 'sessionDefaultChannelGroup'], ['sessions', 'engagedSessions', 'conversions']))
    save('ga4-source+medium.json', ga4_report(s, ['sessionSource', 'sessionMedium'], ['sessions', 'engagedSessions', 'conversions']))
    save('ga4-events.json', ga4_report(s, ['eventName'], ['eventCount']))

    # Gap table: per day, GSC clicks/impressions vs GA4 organic-search sessions; flag days missing on either side
    gsc_by_day = {r['keys'][0]: r for r in gsc['date']}
    ga4_org = {}
    ga4_all = {}
    for row in ga4_day_channel:
        d = f"{row['date'][:4]}-{row['date'][4:6]}-{row['date'][6:]}"
        ga4_all[d] = ga4_all.get(d, 0) + int(row['sessions'])
        if row['sessionDefaultChannelGroup'] == 'Organic Search':
            ga4_org[d] = ga4_org.get(d, 0) + int(row['sessions'])
    d0, d1 = date.fromisoformat(START), date.fromisoformat(END)
    gaps = {'days': (d1 - d0).days + 1, 'gsc_days_present': 0, 'ga4_days_present': 0, 'both_missing': 0, 'gsc_only': 0, 'ga4_only': 0}
    first_gsc = first_ga4 = None
    with (out / 'gap-table.csv').open('w', newline='', encoding='utf-8') as f:
        w = csv.writer(f); w.writerow(['date', 'gsc_clicks', 'gsc_impressions', 'ga4_sessions_all', 'ga4_sessions_organic', 'status'])
        d = d0
        while d <= d1:
            k = d.isoformat(); g = gsc_by_day.get(k); a4 = k in ga4_all
            if g: gaps['gsc_days_present'] += 1; first_gsc = first_gsc or k
            if a4: gaps['ga4_days_present'] += 1; first_ga4 = first_ga4 or k
            status = 'ok' if (g and a4) else 'gsc_only' if g else 'ga4_only' if a4 else 'both_missing'
            gaps[status if status != 'ok' else 'gsc_days_present'] += 0 if status == 'ok' else 1
            w.writerow([k, g['clicks'] if g else '', g['impressions'] if g else '', ga4_all.get(k, ''), ga4_org.get(k, ''), status])
            d += timedelta(days=1)
    gaps['first_gsc_day'] = first_gsc; gaps['first_ga4_day'] = first_ga4
    manifest['gap_summary'] = gaps
    manifest['files']['gap-table.csv'] = {'sha256': hashlib.sha256((out / 'gap-table.csv').read_bytes()).hexdigest(), 'bytes': (out / 'gap-table.csv').stat().st_size}
    (out / 'MANIFEST.json').write_text(json.dumps(manifest, indent=1), encoding='utf-8')
    bundle = hashlib.sha256(json.dumps({k: v['sha256'] for k, v in sorted(manifest['files'].items())}, sort_keys=True).encode()).hexdigest()
    (out / 'MANIFEST.sha256').write_text(bundle + '  MANIFEST.json(files)\n', encoding='utf-8')
    print('gap summary:', json.dumps(gaps))
    print('bundle sha256:', bundle)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
