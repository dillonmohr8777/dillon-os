"""Synthetic Managed Deep Agents scaffold for the Independent Verifier."""

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
    name="independent-verifier-release-gate",
    model=MODEL,
    tools=[],
    subagents=[],
    permissions=[
        FilesystemPermission(operations=["write"], paths=["/**"], mode="deny"),
        FilesystemPermission(operations=["read"], paths=["/workspace/**"], mode="allow"),
        FilesystemPermission(operations=["read"], paths=["/**"], mode="deny"),
    ],
)
