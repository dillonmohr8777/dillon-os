"""Self-check for generate.py's pure logic. Run: python test_generate.py"""
from pathlib import Path

from PIL import Image

from generate import already_done, compute_cost, composite_logo, size_for_format, validate_size


def demo() -> None:
    assert size_for_format("feed_link") == "1216x640"
    assert size_for_format("feed_square") == "1088x1088"
    assert size_for_format("feed_portrait") == "1088x1360"
    try:
        size_for_format("bogus")
        raise AssertionError("expected ValueError for unknown format")
    except ValueError:
        pass

    validate_size(1216, 640)  # must not raise
    try:
        validate_size(1200, 630)
        raise AssertionError("expected ValueError for non-multiple-of-16 size")
    except ValueError as exc:
        assert "1200x630" in str(exc) and "divisible by 16" in str(exc)

    rows = [{"client": "bok-law-firm", "week": "2026-W38", "slot": "monday", "path": __file__}]
    assert already_done(rows, "bok-law-firm", "2026-W38", "monday") is not None
    assert already_done(rows, "bok-law-firm", "2026-W38", "saturday") is None
    assert already_done(rows, "other-client", "2026-W38", "monday") is None
    # a ledger row pointing at a missing file must not count as done
    missing_rows = [{"client": "c", "week": "w", "slot": "s", "path": "C:/does/not/exist.png"}]
    assert already_done(missing_rows, "c", "w", "s") is None

    assert compute_cost(None) is None
    usage = {"input_tokens_details": {"text_tokens": 100, "image_tokens": 0}, "output_tokens": 1000}
    cost = compute_cost(usage)
    assert cost is not None and cost > 0

    # composite_logo must hard-fail on a missing file and on an opaque (no-alpha) logo
    base = Image.new("RGB", (1088, 1360), "white")
    try:
        composite_logo(base, Path("C:/does/not/exist.png"))
        raise AssertionError("expected AssertionError for missing logo file")
    except AssertionError as exc:
        assert "missing" in str(exc)

    opaque_logo_path = Path(__file__).parent / "_test_opaque_logo.png"
    Image.new("RGB", (100, 100), "red").save(opaque_logo_path)
    try:
        composite_logo(base, opaque_logo_path)
        raise AssertionError("expected AssertionError for logo with no alpha channel")
    except AssertionError as exc:
        assert "alpha" in str(exc)
    finally:
        opaque_logo_path.unlink()

    print("ok")


if __name__ == "__main__":
    demo()
