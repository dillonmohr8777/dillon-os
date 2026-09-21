# Quiet radar independent QA

Reviewed September 4, 2026. Scope: `radar-state.mjs`, its test file, `RADAR-RUNBOOK.md`, and the installed `quiet-client-action-radar/automation.toml`. Source/config files were not changed. No external acquisition, client action, or canonical queue write was performed.

Initial verdict: **fail for fully enforced dispatch bounds and reliable daily catch-up**, with two confirmed defects below. The maker has acknowledged both and is preparing corrections; these initial findings have not yet been retested against the fixes. The existing checkpoint, overlap, three-active-worker, pause, bedtime, and DST tests pass. This is local implementation QA, not proof of a scheduled run.

## Confirmed defects

### P2 — A missed morning suppresses the entire day's lead table

Evidence: `radar-state.mjs:66`; `RADAR-RUNBOOK.md:58`.

`leadTableDue` requires local time before noon, even when the daily stamp is absent. If the desktop is asleep, the scheduler is deferred, or the source cannot be acquired during the four-hour window, the requested daily table never becomes due later that day. The configuration acknowledges scheduler/host availability limits, so this is an ordinary recovery case, not an artificial date.

Reproduced with the exported `plan` function and a fresh state:

```text
2026-09-05T15:59:00Z  (11:59 Eastern): leadTableDue=true
2026-09-05T16:00:00Z  (12:00 Eastern): leadTableDue=false
2026-09-05T20:00:00Z  (16:00 Eastern): leadTableDue=false
```

Smallest correction: keep the once-per-date condition, make an unperformed daily job eligible after 08:00 through the remaining permitted daytime, and retain source/worker dedupe. Add a missed-morning catch-up assertion. If a morning-only window is intentional, disclose that it is not guaranteed daily and surface the missed run rather than silently dropping it.

### P2 — Two new tasks per wake is not enforced by the writer

Evidence: `radar-state.mjs:64`, `radar-state.mjs:116`; `RADAR-RUNBOOK.md:42`.

The plan reports `maxNewTasksThisWake: 2`, but no wake ID or per-wake dispatch count is recorded or checked. Starting from an empty state, three distinct `register-thread` events at the same timestamp succeed. The third creates an active record despite the advertised two-new-task bound. The separate **three-active-worker** bound correctly rejects a fourth active thread, and paused-outcome dedupe correctly rejects a duplicate.

Reproduced in memory, without creating sessions:

```javascript
let state = initialState();
const at = '2026-09-05T12:00:00Z';
for (let n = 0; n < 3; n++) {
  state = applyEvent(state, {
    action: 'register-thread', threadId: 't' + n,
    sourceKey: 's' + n, clientId: 'momentum-360'
  }, at);
}
// state.threads.length === 3
// plan(state, at).maxNewTasksThisWake === 2
```

Smallest correction: either persist/check an actual wake-bound dispatch budget before creating each external task, or explicitly label the two-per-wake bound as a prompt-level policy rather than a tested writer guarantee. Registration happens after task creation, so writer rejection alone cannot undo an already-created external task; the caller must check/reserve before dispatch and reconcile failed setup separately.

## Checks performed and boundaries

- `node --test radar-state.test.mjs`: **13 tests, 13 pass, 0 fail**.
- Independent in-memory probes above reproduced both defects.
- A normal textual cursor and a Base64-style cursor were accepted; a newline-only cursor was rejected. No cursor defect was confirmed.
- Installed TOML readback: `kind = "heartbeat"`, `status = "ACTIVE"`, 15-minute cadence, exact current thread ID, and **no `notification_policy = "failed_runs_only"` override**.
- The prompt/runbook require the scheduler's `NOTIFY` or `DONT_NOTIFY` result, quiet unchanged passes, no external auto-sends, exact client identity, and no visible helper windows. Those are configured rules, not end-to-end notification receipts.
- The review did not execute a scheduled wake, verify phone notification delivery, manipulate the app scheduler, create worker sessions, or run real pause/resume. Those remain unproven rather than failed tests.
- The CLI lock/write path and process-crash recovery were not integration-tested. No claim of crash recovery is supported by the current unit suite.

The Ponytail review guidance kept this to existing Node tests and targeted standard-library probes, with no framework or implementation edits.

## Confirmation after maker corrections

Confirmation date: September 4, 2026. **Both initial defects are cleared in the inspected local implementation. Verdict: pass with noted integration risk.** The initial findings above remain as the original evidence record, not current defects.

- Updated suite: `node --test radar-state.test.mjs` returned **15 tests, 15 pass, 0 fail**.
- An independent in-memory confirmation performed **12 assertions, all passed**. A never-run daily lead job is now due at noon, 16:00, and 23:59 Eastern; it is not due during the following midnight period. A completion stamp suppresses the current date and permits the next date after 08:00.
- Dispatch requires `wake-start`; two successful registrations exhaust that wake's budget. JSON round-trip persistence plus repeating the same wake ID cannot reset the counter. Completing one worker does not permit a third new registration in the same wake. A different wake permits new registrations while retaining the three-active-worker ceiling.
- The runbook now explicitly preserves a wake ID throughout the turn/resume, counts unrecorded and setup-pending real workers when checking capacity, and catches up a missed morning lead job later the same day.
- Native TOML remains an ACTIVE heartbeat at a 15-minute cadence on the exact current thread, without a `failed_runs_only` notification override.

Reviewed SHA-256 identities:

```text
radar-state.mjs
1EB8D38C45A5F27F9266272556232C59F36FE682C70B54964F83608C7B4C939A
radar-state.test.mjs
E108580DA7CD4A5E66FDEEFF92B14DEC7ECF3F039F4F7D147B4BC1B010EADDAF
RADAR-RUNBOOK.md
D1F51F4566C93467F5E2E76597DE78C0672EFAB148432A6BD816B7471C68B88B
```

Remaining integration boundary: the helper limits **recorded** workers and trusts the caller's wake identity. Actual task creation, setup reconciliation, notification delivery, scheduler activation, and verified pause/resume must still be exercised by the live orchestrator. This confirmation creates no task, changes no live state, and is not a scheduled-run receipt.
