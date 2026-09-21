"""Self-check for classify(). Run: python test_classify.py"""
import sys, types
from pathlib import Path

# The vendor SDK lives outside the vault and is not needed to test routing.
_stub = types.ModuleType("tencentdb_agent_memory")
_stub.MemoryClient = object
sys.modules.setdefault("tencentdb_agent_memory", _stub)

from sync_vault import classify

def s(p): return classify(Path(p))[0]

# Momentum is the company brain, not a client silo and not Dillon's personal brain.
assert s("01_Clients/Momentum 360/overview.md") == "momentum-shared"
assert s("04_SOPs/onboarding.md") == "momentum-shared"
assert s("11_Agents/scout.md") == "momentum-shared"
assert s("08_Prospects/list.md") == "momentum-shared"
assert s("SEO/plan.md") == "momentum-shared"
assert s("ai-division/readme.md") == "momentum-shared"

# Real clients stay isolated. This is the line that must never regress.
assert s("01_Clients/Nexla/overview.md") == "client-nexla"
assert s("01_Clients/Puttery NYC/notes.md") == "client-puttery-nyc"
assert s("02_FullTimeJob/Empeon/role.md") == "employer-empeon"

# Personal stays personal.
assert s("12_Brain/03_Concepts/x.md") == "dillon-shared"
assert s("12_Brain/01_Captures/x.md") == "dillon-private-captures"
assert s("00_Inbox/x.md") == "dillon-private-inbox"
assert s("10_Sessions/x.md") == "dillon-private-sessions"
assert s("02_Campaigns/x.md") == "dillon-private-campaigns"

print("classify: all checks pass")
