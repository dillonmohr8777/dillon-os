#!/usr/bin/env python3
"""Create a Composio Tool Router session for BROWSER_TOOL and print MCP config."""

from __future__ import annotations

import json
import os
import sys


def main() -> int:
    api_key = os.getenv("COMPOSIO_API_KEY")
    user_id = os.getenv("COMPOSIO_USER_ID", "dillon-os")
    if not api_key:
        print(
            "COMPOSIO_API_KEY is not set. Add it to Cursor MCP secrets or export it, then rerun.",
            file=sys.stderr,
        )
        return 1

    try:
        from composio import Composio
    except ImportError:
        print("Install composio-core: pip install composio-core", file=sys.stderr)
        return 1

    composio = Composio(api_key=api_key)
    session = composio.create(user_id=user_id, toolkits=["BROWSER_TOOL"])

    config = {
        "mcpServers": {
            "composio-browser": {
                "url": session.mcp.url,
                "headers": {"x-api-key": api_key},
            }
        }
    }
    print(json.dumps(config, indent=2))
    print("\nPaste the composio-browser block into Cursor Settings → MCP.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
