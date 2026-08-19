---
note_type: capture
status: unprocessed
created: 2026-08-19
updated: 2026-08-19
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - BOK series graphics request]]"
  - "[[12_Brain/01_Captures/sessions/2026-08-19 - bok-series-graphics]]"
tags: [capture]
---

# 2026-08-19 — BOK series email delivery (mined)

- Decision: Deliver the three graphics as one PDF (`BOK_Law_Weekly_Social_Graphics.pdf`, three 1080×1350 pages) plus the individual PNGs.
- Fact: Packet was sent to Dillon's Gmail on 2026-08-19. Attachments: the PDF, `wednesday-wisdom.png`, `family-fridays.png`, `saturday-solutions.png`.
- Fact: Attorneys were not CC'd. Client review is still required before posting.
- Pattern: Native Gmail MCP cannot take large binary attachments in this environment. Composio workbench path that works: GitHub file fetch → sandbox write → `upload_local_file` → `GMAIL_SEND_EMAIL` with s3 keys.
- Pattern: Rebuild remains `python3 render_series.py` in `01_Clients/BOK Law Firm/social/2026-08-19/`; that script now also writes the PDF.
