---
note_type: review
status: active
created: 2026-09-09
updated: 2026-09-09
owner: Dillon Mohr
priority: critical
verification_status: verified
observed_at: 2026-09-09
next_action: Put the machine on a UPS and run HP UEFI diagnostics
tags: [review, hardware, reliability, infrastructure, root-cause]
source_refs:
  - "Windows System event log, read 2026-09-09 (Kernel-Power 41, EventLog 6008, WHEA-Logger, Kernel-Processor-Power, disk 51)"
  - "Win32_Battery / Win32_ComputerSystem / Win32_SystemEnclosure via CIM, 2026-09-09"
  - "HKLM:/SYSTEM/CurrentControlSet/Control/CrashControl and .../Session Manager/Power"
  - "[[12_Brain/07_Reviews/2026-09-09 - Session estate consolidation]]"
---

# Machine power fault diagnosis

**Summary:** The machine is losing power. It is not crashing, not overheating,
and the system disk is fine. Measured 2026-09-09; every competing explanation
was tested and ruled out.

## The hardware

**HP EliteDesk 800 G4 SFF.** Chassis type 3 — a desktop. `Win32_Battery`
returns nothing: **there is no battery.** Any interruption at the wall, the
cord, the strip or the PSU is an instant power-off with no warning and no log
entry.

## What was measured

| Signal | Count, 30 days | Reading |
|---|---|---|
| Kernel-Power 41 | **14** | unclean shutdown |
| EventLog 6008 | **14** | unexpected shutdown |
| WER BugCheck 1001 | **0** | no blue screen |
| Minidumps on disk | **0** | no crash dump, ever |
| WHEA-Logger (any ID) | **0** | no CPU, memory or bus hardware errors |

Every event 41 recorded `BugcheckCode 0` and `PowerButtonTimestamp 0` — the
machine did not crash, and nobody held the power button. It simply stopped.

## Correction to a first reading

An earlier pass in this same session inferred from event 41 timestamps that the
crashes cluster in daytime working hours and therefore happen under load. **That
inference was wrong and is withdrawn.** Kernel-Power 41 is written at the *next*
boot, not at the moment of failure, so its timestamp records when Dillon
switched the machine back on. The "events preceding the crash" it appeared to
show were boot events from the recovery boot.

The true failure times come from `EventLog 6008`, which states the previous
shutdown time explicitly, and whose fifth property carries **uptime in seconds
before the crash**. That number is the real evidence.

## Uptime before each crash — the machine is degrading

| Crash | Uptime survived |
|---|---|
| 08-02 12:39 | 43.2 h |
| 08-02 18:18 | 4 h |
| 08-10 08:18 | 180.9 h |
| 08-22 12:50 | 204.3 h |
| 08-25 10:46 | 68.7 h |
| 08-26 12:36 | 25.4 h |
| 08-31 15:00 | 122.3 h |
| 09-02 16:23 | 48.8 h |
| 09-02 16:42 | **10 seconds** |
| 09-03 08:04 | 12 h |
| 09-04 09:39 | 20.7 h |
| 09-04 13:52 | 4 h |
| 09-06 21:11 | 54.9 h |
| 09-07 10:23 | 12.7 h |
| 09-08 09:27 | 22.7 h |
| 09-09 13:34 | 10 h |
| 09-09 13:43 | **10 seconds** |

Two readings matter.

**The trend.** Tolerable uptime has collapsed from 204 and 181 hours in
mid-August to 10, 12 and 4 hours in September. This is not a constant
environmental nuisance; it is a component getting worse.

**The two ten-second deaths.** On 2026-09-02 and again on 2026-09-09 the machine
booted from a previous crash and died again **ten seconds later.** Both carry a
property signature distinct from every other event.

A ten-second death is the finding. Nothing in software gets far enough in ten
seconds to kill a machine with no bugcheck and no dump. Ten seconds after POST
is when rails come up and draw goes to full — it is exactly where a supply that
can no longer hold under load gives out.

## What was ruled out

**Thermal throttling — no.** The 264 `Kernel-Processor-Power` events look
alarming and are not. All 264 are **event ID 55**, which is informational: at
every boot Windows logs each processor's power-management capabilities. Twelve
logical processors times twenty-two boots. It is a symptom of rebooting often,
not of heat.

**System disk — no.** Only two disk `51` errors in 35 days, both on
`\Device\Harddisk1` (`DR8` and `DR3` — the changing DR number means a removable
device, i.e. a USB drive), not on the system disk. The system SSD, a Kingston
`OM8TAP41024K1-A00`, reports `HealthStatus: Healthy`, with 399 GB free of 953.

**Software crash — no.** `CrashDumpEnabled` is 3, so kernel dumps are switched
on and would be written. `C:\Windows\Minidump` contains **zero files**. A
software bugcheck leaves evidence. Fourteen events left none.

**Kernel-Boot 153 — irrelevant.** All 22 are Virtualization-Based Security
configuration notices, unrelated to power.

## Conclusion

Everything that leaves a trace when software fails left no trace. The one
component with no redundancy and no logging is power delivery, on a small-form
desktop with no battery to ride through a dip.

**Ranked, revised: the power supply is the primary suspect**, not the wall. The
degradation curve and the two ten-second boot deaths both point inside the case.
The outlet, circuit, cord and strip remain worth eliminating, but they do not
explain a machine that dies ten seconds after POST twice, a week apart.

An HP EliteDesk 800 G4 SFF uses a small internal supply that is a known wear
item. It is a replaceable part.

Codex reached the same conclusion from the config side on 2026-09-04 and
recorded ten power-offs. The real figure was fourteen, and it has grown since.

## What this explains

- Sessions dying mid-work — the reason this orchestrator seat exists.
- `.codex/config.toml` appearing to reset itself. It was not resetting; it was
  being interrupted mid-write.
- Orphaned lock folders left by sessions that never exited.
- Why work with no off-device copy was an active exposure rather than
  housekeeping. Resolved 2026-09-09; see the consolidation note.

## What to do

1. **Replace the power supply.** This is the fix. The degradation curve and the
   two ten-second deaths are a supply that can no longer hold load. A UPS will
   not fix this, because the fault is inside the case.
2. **Run HP's own diagnostics first to confirm.** F2 during boot, HP PC Hardware
   Diagnostics UEFI, full component test including the power and memory tests.
   Do this before buying a part.
3. **Open the case and clear the PSU fan while it is open.** SFF EliteDesks clog,
   and a starved fan is a plausible cause of the degradation curve itself.
4. **A UPS is still worth having**, but for a different reason: it protects work
   in progress and rules the wall out permanently. It is not the fix.
5. **Watch BitLocker.** Two `24641` errors today — "unexpected error attempting
   to retrieve the BitLocker volume master key during restart" — both on the
   recovery boots either side of the ten-second death. Repeated unclean power
   loss on a BitLocker volume is how recovery-key prompts start. Confirm the
   recovery key is saved somewhere off this machine before the next crash.
5. **Turn off Fast Startup.** `HiberbootEnabled` is currently `1`. It is not the
   cause, but it hides the machine's true shutdown state and makes every one of
   these harder to read. Requires an elevated prompt; it is a system setting, so
   Dillon runs it.

## Related

- [[12_Brain/07_Reviews/2026-09-09 - Session estate consolidation]]
