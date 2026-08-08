"""Synthetic Managed Deep Agents scaffold for Runtime Watchtower and Agent SRE."""

from deepagents import (
    FilesystemPermission,
    GeneralPurposeSubagentProfile,
    HarnessProfile,
    register_harness_profile,
)
from managed_deepagents import define_deep_agent

MODEL = "openai:gpt-5.5"
register_harness_profile(
    MODEL,
    HarnessProfile(
        general_purpose_subagent=GeneralPurposeSubagentProfile(enabled=False),
    ),
)

agent = define_deep_agent(
    name="runtime-watchtower-agent-sre",
    model=MODEL,
    tools=[],
    subagents=[],
    permissions=[
        FilesystemPermission(operations=["read", "write"], paths=["/**"], mode="deny"),
    ],
)
