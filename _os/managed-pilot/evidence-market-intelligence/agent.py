"""Synthetic Managed Deep Agents scaffold for Evidence and Market Intelligence."""

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
    name="evidence-market-intelligence",
    model=MODEL,
    tools=[],
    subagents=[],
    permissions=[
        FilesystemPermission(operations=["read", "write"], paths=["/workspace/**"], mode="allow"),
        FilesystemPermission(operations=["read", "write"], paths=["/**"], mode="deny"),
    ],
)
