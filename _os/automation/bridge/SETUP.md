# Bridge setup (one-time, Dillon)

The collector runs from Task Scheduler as `Momentum-ManagedAgents-Collector`
(at logon, then every 10 minutes). It reads the Anthropic API key from Windows
Credential Manager at run time and hands it to one child process. Until the
credential exists, every run logs one line and exits — nothing breaks, nothing
runs.

## 1. Rotate the key first

The key used on 2026-09-14 was pasted into a chat transcript. Create a new one
at console.anthropic.com → Settings → API keys, then delete the old one. Every
agent, environment, vault and deployment keeps working after rotation.

## 2. Store the new key (once)

In a normal terminal, not in any Claude or Codex session:

```
cmdkey /generic:Momentum.ManagedAgents.ApiKey /user:anthropic /pass:<paste the new key>
```

That writes a DPAPI-protected generic credential readable only by your Windows
account. It never enters an environment variable, a file, or git.

Check it exists without revealing it:

```
cmdkey /list | findstr Momentum.ManagedAgents
```

## 3. Confirm the collector runs

```
Start-ScheduledTask -TaskName Momentum-ManagedAgents-Collector
Get-Content C:\Users\dillo\repos\dillon-os\_os\automation\bridge\collector.log -Tail 5
```

A healthy run prints one line per open session. `bridge.sqlite` is the journal;
`deliveries\<client>\<session>\` is where collected files land. Both are
gitignored.

## Why not just set ANTHROPIC_API_KEY

Because Claude Code switches from your Max subscription to API billing the
instant that variable exists in any persistent scope — even empty. The whole
point of this design is that the key lives in exactly one place and touches
exactly one process at a time.
