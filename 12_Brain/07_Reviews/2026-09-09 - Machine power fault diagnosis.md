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

Most recent: 2026-09-09 at 13:57 and 13:43, **fourteen minutes apart.** Then
09-08, 09-07, 09-06, twice on 09-04, 09-03, twice on 09-02, 08-31, 08-26,
08-25, 08-22. All during daytime working hours, under load.

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

Ranked: PSU (SFF units are a wear item and the fan clogs), then the outlet or
circuit, then the cord or power strip.

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

1. **A UPS is the actual fix.** A desktop with no battery has no tolerance for
   a dip. This is a cheap consumer purchase and it ends the whole class of
   problem.
2. **Different outlet, different circuit.** Not shared with anything that has a
   motor or compressor — a heater, an AC unit, a fridge.
3. **Open the case and clear the PSU fan.** SFF EliteDesks clog.
4. **Run HP's own diagnostics.** F2 during boot, HP PC Hardware Diagnostics
   UEFI, full component test.
5. **Turn off Fast Startup.** `HiberbootEnabled` is currently `1`. It is not the
   cause, but it hides the machine's true shutdown state and makes every one of
   these harder to read. Requires an elevated prompt; it is a system setting, so
   Dillon runs it.

## Related

- [[12_Brain/07_Reviews/2026-09-09 - Session estate consolidation]]
