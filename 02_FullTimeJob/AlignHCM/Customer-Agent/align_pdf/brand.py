"""Align HCM brand tokens and font registration for the Customer Agent PDF set.

Palette and typography follow `02_FullTimeJob/AlignHCM/brand-guidelines.md`:
navy, orange, teal, Plus Jakarta Sans. Brand fonts are vendored in `../fonts/`
so the build is reproducible offline; if they are missing the build falls back
to Helvetica/Courier and still produces a valid document.
"""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONT_DIR = Path(__file__).resolve().parent.parent / "fonts"

# ---------------------------------------------------------------- palette ----

NAVY_DEEP = colors.HexColor("#0A1628")   # cover panel, table headers
NAVY = colors.HexColor("#2D3748")        # body headings
ORANGE = colors.HexColor("#E8832A")      # primary accent
ORANGE_HOT = colors.HexColor("#F05A28")  # alert accent
TEAL = colors.HexColor("#2BB5A0")        # pass / positive

INK = colors.HexColor("#1B2430")         # body text
INK_SOFT = colors.HexColor("#4A5568")    # secondary text
INK_FAINT = colors.HexColor("#8895A7")   # captions, footer

RULE = colors.HexColor("#DCE3EC")        # hairlines
RULE_SOFT = colors.HexColor("#EDF1F6")
PANEL = colors.HexColor("#F5F8FB")       # zebra rows, code panels
PANEL_WARM = colors.HexColor("#FDF4EC")  # callout fill on orange
PANEL_COOL = colors.HexColor("#EEF9F6")  # callout fill on teal
PAPER = colors.white

RED = colors.HexColor("#C0392B")         # fail
AMBER = colors.HexColor("#B7791F")       # pending / not run

# Verdict token -> (text colour, chip fill). Drives auto-coloured table cells.
VERDICT_COLORS = {
    "PASS": (colors.HexColor("#1E7F6E"), PANEL_COOL),
    "FAIL": (RED, colors.HexColor("#FDECEA")),
    "PENDING": (AMBER, PANEL_WARM),
    "NOT RUN": (INK_FAINT, PANEL),
    "DEF": (INK_FAINT, PANEL),
    "EXEC": (NAVY, colors.HexColor("#E9EFF7")),
    "SCENARIO": (INK_SOFT, PANEL),
    "N/A": (INK_FAINT, PANEL),
    "NO-GO": (RED, colors.HexColor("#FDECEA")),
    "HOLD": (ORANGE_HOT, PANEL_WARM),
}

# ------------------------------------------------------------- typography ----

_FALLBACK = {
    "sans": "Helvetica",
    "sans_semi": "Helvetica-Bold",
    "sans_bold": "Helvetica-Bold",
    "sans_black": "Helvetica-Bold",
    "sans_italic": "Helvetica-Oblique",
    "mono": "Courier",
    "mono_bold": "Courier-Bold",
}

_BRAND = {
    "sans": ("AlignSans", "PlusJakartaSans-Regular.ttf"),
    "sans_semi": ("AlignSans-Semi", "PlusJakartaSans-SemiBold.ttf"),
    "sans_bold": ("AlignSans-Bold", "PlusJakartaSans-Bold.ttf"),
    "sans_black": ("AlignSans-Black", "PlusJakartaSans-ExtraBold.ttf"),
    "mono": ("AlignMono", "JetBrainsMono-Regular.ttf"),
    "mono_bold": ("AlignMono-Bold", "JetBrainsMono-Bold.ttf"),
}

FONTS: dict[str, str] = {}
BRAND_FONTS_LOADED = False


def register_fonts() -> dict[str, str]:
    """Register vendored brand fonts, falling back to the built-in Type 1 set."""
    global BRAND_FONTS_LOADED
    if FONTS:
        return FONTS

    missing = [f for _, f in _BRAND.values() if not (FONT_DIR / f).exists()]
    if missing:
        FONTS.update(_FALLBACK)
        return FONTS

    for key, (name, filename) in _BRAND.items():
        pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / filename)))
        FONTS[key] = name

    # Plus Jakarta Sans ships no italic in the vendored subset; synthesise the
    # family so <b>/<i> inline tags resolve instead of silently dropping.
    pdfmetrics.registerFontFamily(
        FONTS["sans"],
        normal=FONTS["sans"],
        bold=FONTS["sans_bold"],
        italic=FONTS["sans"],
        boldItalic=FONTS["sans_bold"],
    )
    pdfmetrics.registerFontFamily(
        FONTS["mono"],
        normal=FONTS["mono"],
        bold=FONTS["mono_bold"],
        italic=FONTS["mono"],
        boldItalic=FONTS["mono_bold"],
    )
    FONTS["sans_italic"] = FONTS["sans"]
    BRAND_FONTS_LOADED = True
    return FONTS


# ------------------------------------------------------------ glyph safety ---

# The vendored Plus Jakarta Sans is the Latin subset. Anything outside it would
# render as a blank box, so unsupported marks are rewritten before layout.
GLYPH_SUBSTITUTIONS = {
    "≥": ">=",
    "≤": "<=",
    "→": "->",
    "←": "<-",
    "⇒": "=>",
    "✓": "Yes",
    "✔": "Yes",
    "✗": "No",
    "✘": "No",
    "✅": "Yes",
    "❌": "No",
    "×": "x",
    "…": "...",
    " ": " ",
    " ": " ",
    "​": "",
}


def glyph_safe(text: str) -> str:
    for bad, good in GLYPH_SUBSTITUTIONS.items():
        if bad in text:
            text = text.replace(bad, good)
    return text
