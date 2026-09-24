<!--
DRAFT ONLY. Not opened. Do not post until Dillon says send.
Target: https://github.com/tamaratran/fast-jev-compaction/issues/new
-->

## Title

`Hooks (0)` on install — `session.compact` / `turn.complete` are not recognized Claude Code hook events (tested on Claude Code 2.1.272)

## Body

Installed via the documented path (`claude plugin marketplace add tamaratran/fast-jev-compaction`, then `claude plugin install fast-jev-compaction@fast-jev-compaction`) on Claude Code **2.1.272**. Install succeeds, plugin shows `enabled`, and the bundled validator passes:

```
claude plugin validate .claude-plugin/plugin.json
```
```
❯ ./fast-jev.ts hooks: session.compact, turn.complete
❯ ./fast-jev.ts calls: $.env.get (via getApiKey), $.http.fetch, $.session.compact, $.session.usage, $.settings.read (via getApiKey), $.ui.log, $.ui.toast (via notify)
✔ Validation passed with warnings
```

But `claude plugin details` reports zero hooks:

```
claude plugin details fast-jev-compaction@fast-jev-compaction
```
```
Hooks (0)
MCP servers (0)
LSP servers (0)
```

**This isn't a stale-cache artifact.** Checked against a known-working plugin from the official marketplace with the same "no explicit `hooks` key in `plugin.json`" pattern:

```
claude plugin details ai-plugins@claude-plugins-official
```
```
Hooks (3)  PostToolUse, PreToolUse, UserPromptSubmit
```

So `details` correctly discovers and counts real hooks when the event names are valid. It reports 0 specifically for `session.compact` and `turn.complete`.

Grepping the local Claude Code changelog (80+ documented hook events added over time — `PreToolUse`, `PostToolUse`, `SessionStart`, `SessionEnd`, `Stop`, `SubagentStop`, `ConfigChange`, `PreModelSwitch`, etc.) turns up **zero matches for `session.compact` or `turn.complete`.** The only compaction-related hook that exists is:

```
Added PreCompact hook support: hooks can now block compaction by exiting with code 2 or returning {"decision":"block"}
```

`PreCompact` is block-only — it cannot rewrite the compacted transcript, which is what this plugin needs (`session.compact` returning `{ messages }` to replace the built-in summary). So even porting the plugin to the real event wouldn't restore the intended behavior on this Claude Code version; that capability doesn't appear to be shipped yet.

**Ask:** is this targeting a newer/unreleased Claude Code build, or a different distribution than what `claude plugin install` resolves? Worth a note in the README either way — right now it installs cleanly and silently does nothing, which is a worse failure mode than refusing to install.

**Environment:**
- Claude Code 2.1.272 (Windows)
- fast-jev-compaction 0.3.0
