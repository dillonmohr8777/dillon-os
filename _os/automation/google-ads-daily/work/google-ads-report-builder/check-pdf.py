"""Small installed PDF check; renders existing PDF pages, never edits artwork."""
import json
import sys
from pathlib import Path
from pypdf import PdfReader
import pypdfium2 as pdfium

root = Path('C:/Users/dillo/Documents/Codex/projects/client-operations/clients')
clients = [('omega-landscaping', 'Omega', '2853981364'), ('onsite-concrete-landscape', 'Onsite', '1033715894')]
date = sys.argv[1] if len(sys.argv)>1 else '2026-09-04'
daily = len(sys.argv)>1
if daily: clients.append(('nexla', 'Nexla', '7917802207'))
for slug, name, account in clients:
    folder = root / slug / f'deliverables/{date}-google-ads-{"daily-health" if daily else "health-review"}'
    pdf = folder / f'{slug}-google-ads-health-review.pdf'
    doc = PdfReader(pdf)
    assert len(doc.pages) == 2, (slug, len(doc.pages))
    text = '\n'.join(page.extract_text() for page in doc.pages)
    text = ' '.join(text.split())
    assert account in text
    assert 'Conversion reporting is pending validation' in text
    if daily: assert date in text and 'Captured' in text and 'Saved evidence only' in text
    else: assert ('August 28' in text and 'September 3, 2026' in text) or ('2026-08-28' in text and '2026-09-03' in text)
    assert all(term not in text.lower() for term in ['zero conversions', 'no conversions', 'insufficient conversions', 'not enough conversions'])
    for other in clients:
        if other[0] != slug: assert other[2] not in text and other[1] not in text
    rendered = pdfium.PdfDocument(str(pdf))
    for index, page in enumerate(doc.pages):
        assert float(page.mediabox.width) == 612 and float(page.mediabox.height) == 792
        rendered[index].render(scale=1.3).to_pil().save(folder / f'qa-pdf-page-{index+1}.png')
    print(json.dumps({'clientId':slug, 'pages':len(doc.pages), 'letterSize':True, 'clientSeparation':True, 'pendingLabel':True}))
