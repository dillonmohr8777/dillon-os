"""Inline-SVG / CSS-bar chart helpers for the Align HCM watchdog PDFs.

No external libraries, no <canvas>, no runtime fetch. Everything returns an HTML
string with data already baked in, so Chromium prints a file:// page correctly.
"""

from html import escape

NAVY = "#1d3a5f"
STEEL = "#3b6fb5"
VIEWS = "#3b6fb5"
SUBS = "#e8842c"
GRID = "#e7edf5"
MUTED = "#5a6b80"
FAINT = "#8595a9"


def _nice_max(v):
    if v <= 0:
        return 10
    import math
    mag = 10 ** int(math.floor(math.log10(v)))
    for m in (1, 2, 2.5, 5, 10):
        if v <= m * mag:
            return int(m * mag)
    return int(10 * mag)


def day_bar_chart(days, value_key="views", overlay_key=None,
                  color=VIEWS, overlay_color=SUBS, height=190):
    """Vertical bar chart, one bar per day. days = list of dicts with 'date' and value_key.
    Optional overlay_key draws a slim second bar (e.g. clean submissions) beside each."""
    if not days:
        return '<div class="muted small">No daily data.</div>'
    w = 960
    h = height
    pad_l, pad_r, pad_t, pad_b = 34, 12, 14, 26
    plot_w = w - pad_l - pad_r
    plot_h = h - pad_t - pad_b
    vmax = _nice_max(max(d.get(value_key, 0) for d in days))
    n = len(days)
    slot = plot_w / n
    bar_w = min(slot * 0.5, 46)

    def y(v):
        return pad_t + plot_h - (v / vmax) * plot_h

    parts = [f'<svg viewBox="0 0 {w} {h}" width="100%" preserveAspectRatio="xMidYMid meet" '
             f'font-family="Avenir Next, Segoe UI, sans-serif">']
    # gridlines + y labels
    for i in range(5):
        gv = vmax * i / 4
        gy = y(gv)
        parts.append(f'<line x1="{pad_l}" y1="{gy:.1f}" x2="{w-pad_r}" y2="{gy:.1f}" '
                     f'stroke="{GRID}" stroke-width="1"/>')
        parts.append(f'<text x="{pad_l-6}" y="{gy+3:.1f}" font-size="10" fill="{FAINT}" '
                     f'text-anchor="end">{int(round(gv))}</text>')
    # bars
    for i, d in enumerate(days):
        cx = pad_l + slot * i + slot / 2
        v = d.get(value_key, 0)
        bx = cx - bar_w / 2
        by = y(v)
        bh = pad_t + plot_h - by
        parts.append(f'<rect x="{bx:.1f}" y="{by:.1f}" width="{bar_w:.1f}" height="{max(bh,0):.1f}" '
                     f'rx="3" fill="{color}"/>')
        if v > 0:
            parts.append(f'<text x="{cx:.1f}" y="{by-3:.1f}" font-size="9.5" fill="{MUTED}" '
                         f'text-anchor="middle">{v}</text>')
        if overlay_key:
            ov = d.get(overlay_key, 0)
            if ov > 0:
                oh = (ov / vmax) * plot_h
                oy = pad_t + plot_h - oh
                parts.append(f'<rect x="{cx+2:.1f}" y="{oy:.1f}" width="5" height="{oh:.1f}" '
                             f'rx="2" fill="{overlay_color}"/>')
        # x label: weekday + day number
        lbl = _daylabel(d.get("date", ""))
        parts.append(f'<text x="{cx:.1f}" y="{h-8:.1f}" font-size="9.5" fill="{MUTED}" '
                     f'text-anchor="middle">{escape(lbl)}</text>')
    parts.append("</svg>")
    return f'<div class="chart-wrap">{"".join(parts)}</div>'


def _daylabel(iso):
    try:
        from datetime import date
        y, m, dd = (int(x) for x in iso.split("-"))
        wd = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][date(y, m, dd).weekday()]
        return f"{wd} {dd}"
    except Exception:
        return iso


def bar_rows(items, fill_class="fill-navy"):
    """Horizontal CSS bars. items = list of (label, value, display) tuples."""
    if not items:
        return '<div class="muted small">No data.</div>'
    vmax = max((v for _, v, _ in items), default=1) or 1
    rows = ['<div class="bars">']
    for label, value, disp in items:
        pct = max(2.0, (value / vmax) * 100)
        rows.append(
            f'<div class="brow"><span class="bl">{escape(str(label))}</span>'
            f'<span class="bt"><i class="{fill_class}" style="width:{pct:.1f}%"></i></span>'
            f'<span class="bv num">{escape(str(disp))}</span></div>'
        )
    rows.append("</div>")
    return "".join(rows)
