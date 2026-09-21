# Report pairing - generated versus actually sent

**Read only. Nothing was sent. The paused sender was not resumed.**

| | |
|---|---|
| Run | 2026-09-21 weekly cadence, job `report-pairing-check` |
| Scope | all 26 clients marked `active` in `client-operations/registry/clients.json` |
| Generated | newest dated deliverable folder matching report / weekly-update / performance / dashboard |
| Sent | newest on-disk send evidence: a delivery receipt with `sent_verified`, a verified Gmail `messageId`, or a `SENT-`/`sent-to-` artifact |

## Headline

**13 of 26 active clients have no evidence on disk that a report was ever sent to them.**
Of the 13 that do, every single one last sent between **2026-09-08 and 2026-09-10**.
Nothing has been sent to any client in the **11 days** since 2026-09-10.

The generated-to-sent gap is small for the clients that send at all (0 to 6 days).
The real gap is that generation kept running and sending stopped: 8 clients carry a
**2026-09-14** generated report with a last send of 09-08 to 09-10, and that 09-14
batch was never delivered to anyone.

## Per-client table

Sorted by days since last send, descending. `gap` is generated minus sent.

| client | last generated | last sent | gap (days) | days since last send |
|---|---|---|---:|---:|
| align-hcm | 2026-07-30 | **never** | - | **never sent** |
| bercos-popcorn | **none found** | **never** | - | **never sent** |
| bigorange-marketing | **none found** | **never** | - | **never sent** |
| bok-law-firm | **none found** | **never** | - | **never sent** |
| bridge-software | 2026-09-03 | **never** | - | **never sent** |
| cindy-may-christmas | **none found** | **never** | - | **never sent** |
| gt-clinic | **none found** | **never** | - | **never sent** |
| momentum-360 | 2026-08-31 | **never** | - | **never sent** |
| pritzker-law-group | 2026-09-14 | **never** | - | **never sent** |
| pro-fence-deck | **none found** | **never** | - | **never sent** |
| puttery-nyc | 2026-09-14 | **never** | - | **never sent** |
| shadow-heating-cooling | **none found** | **never** | - | **never sent** |
| tags-2-go | **none found** | **never** | - | **never sent** |
| fresh-blends-kwik-trip | 2026-09-14 | 2026-09-08 | 6 | 13 |
| kimberly-james-bridal | 2026-09-14 | 2026-09-08 | 6 | 13 |
| nkcdc | 2026-09-08 | 2026-09-08 | 0 | 13 |
| omega-landscaping | 2026-09-14 | 2026-09-08 | 6 | 13 |
| onsite-concrete-landscape | 2026-09-14 | 2026-09-08 | 6 | 13 |
| replenish-7-eleven | 2026-09-14 | 2026-09-08 | 6 | 13 |
| va-claims-edge | 2026-09-14 | 2026-09-08 | 6 | 13 |
| fagan-painting | 2026-09-08 | 2026-09-09 | -1 | 12 |
| hope-wellness-center | 2026-09-14 | 2026-09-09 | 5 | 12 |
| bar-crawl-usa | 2026-09-14 | 2026-09-10 | 4 | 11 |
| deborah-mara | 2026-09-14 | 2026-09-10 | 4 | 11 |
| nexla | 2026-09-14 | 2026-09-10 | 4 | 11 |
| revive-systems | 2026-09-14 | 2026-09-10 | 4 | 11 |

## Clients with no send evidence at all

These 13 active clients have nothing on disk showing a report reached them.
Split by whether a report was even generated:

**Generated but never sent (5):**

| client | last generated | age at 2026-09-21 |
|---|---|---:|
| align-hcm | 2026-07-30 | 53 days |
| bridge-software | 2026-09-03 | 18 days |
| momentum-360 | 2026-08-31 | 21 days |
| pritzker-law-group | 2026-09-14 | 7 days |
| puttery-nyc | 2026-09-14 | 7 days |

**No report generated and none sent (8):**

- `bercos-popcorn`
- `bigorange-marketing`
- `bok-law-firm`
- `cindy-may-christmas`
- `gt-clinic`
- `pro-fence-deck`
- `shadow-heating-cooling`
- `tags-2-go`

For this second group the absence is consistent - no report exists, so none could
be sent. That is a different failure from the first group, where a report was built
and then went nowhere.

## Clients where the gap exceeds 21 days

**By the generated-minus-sent definition: none.** The largest gap among clients that
send is 6 days.

**By days-since-last-send: 13 clients are past 21 days by an unbounded margin,**
because they have never sent. Every client that has sent is at 11 to 13 days, under
the threshold - but all of them will cross it on 2026-10-01 if the sender stays paused.

## A discrepancy worth correcting

The weekly manifest for this job states: "As of 2026-09-14 the worst was Omega at 34
days - last actual send August 11." **That does not match what is on disk.**

`clients/omega-landscaping/deliverables/2026-09-08-weekly-report-2026-09-01-to-2026-09-08/email-delivery-receipt.json`
records `status: sent_verified`, `sentAt: 2026-09-08T23:51:28.000Z`, `messageId:
1a0836f0d94a0331`, to `contact@omegalandscapingandconcrete.com` with six CCs. That is a
verified weekly-report send on 2026-09-08, not August 11.

Either the manifest note is stale, or it was measuring a different thing (a specific
report series, or a Slack delivery rather than email). The manifest note should be
corrected or its measurement restated, because it currently overstates the Omega gap
by 28 days and understates the real problem - which is not one client at 34 days, it
is every client stopping on the same three days in September.

## Mechanism

This is the asymmetry the manifest names, and the numbers confirm it:

- `weekly-client-marketing-reports` (ACTIVE, Mondays 10:00) keeps generating. Eight
  clients have a 2026-09-14 report.
- `finish-twelve-weekly-report-sends` (PAUSED) is the send half. Nothing has been
  delivered since 2026-09-10.

Generation running while sending is paused manufactures backlog at a fixed rate of
one batch per week. The 2026-09-14 batch is already undelivered; today is a Monday
cadence run, so a 2026-09-21 batch is due to be generated at 10:00 and will become
the second undelivered batch.

## Two clients that must not be emailed regardless

- `fagan-painting` - recorded inactive since 2026-09-09 in `System/approval-queue.md`,
  though the registry still reads `active`. Registry and queue disagree.
- `nkcdc` - Dillon marked do-not-email on 2026-09-14.

Both still appear in this table as active clients with generated reports. If the
sender is ever resumed, both need excluding first.

## Gate

Nothing was sent. The paused sender was not resumed. Both are approval-gated and this
file stops at that boundary.
