# Dillon Command Center — 2026-08-17

Generated: 2026-08-17T13:07:17.711Z

## One approval surface

Tier 0 scouts ran in parallel. Review ranked items below. One approval executes the Tier-1 batch.

## P0 stack

1. **[comms]** 00_Inbox/slack/2026-07-30-jason-sean-bot-case-status-alert — Open Slack ask (automation) (tier 0)
   - evidence: `00_Inbox/slack/2026-07-30-jason-sean-bot-case-status-alert.md`
2. **[comms]** 00_Inbox/slack/2026-07-30-jenny-brand-direction — Open Slack ask (question) (tier 0)
   - evidence: `00_Inbox/slack/2026-07-30-jenny-brand-direction.md`
3. **[comms]** 00_Inbox/slack/2026-07-30-melissa-guidelines-training-prompt — Open Slack ask (content) (tier 0)
   - evidence: `00_Inbox/slack/2026-07-30-melissa-guidelines-training-prompt.md`
4. **[comms]** 00_Inbox/slack/2026-07-30-sean-callrail-status — Open Slack ask (report) (tier 0)
   - evidence: `00_Inbox/slack/2026-07-30-sean-callrail-status.md`

## Lane status

- ✓ **Command / routing** (`command`) — 4 open Slack loops, 0 moving clients
- ! **Gmail / Slack / follow-up** (`comms`) — 4 slack notes, 4 open
  - artifacts: `00_Inbox/slack/2026-07-30-jason-sean-bot-case-status-alert.md`, `00_Inbox/slack/2026-07-30-jenny-brand-direction.md`, `00_Inbox/slack/2026-07-30-melissa-guidelines-training-prompt.md`, `00_Inbox/slack/2026-07-30-sean-callrail-status.md`
- ✓ **Client roster / pulse** (`clients`) — {"files":38,"incomplete":0,"complete":38}
  - artifacts: `/workspace/Daily-Briefs/frontmatter-report.md`
- – **Research / Grok / X scout** (`intelligence`) — skills: research-sweep
- ! **Site health / factory queue** (`websites`) — {"total":5,"pass":1,"warn":0,"fail":1,"skipped":3}
  - artifacts: `/workspace/Daily-Briefs/site-health-report.md`
- ✓ **Prospect discover / qualify** (`outreach`) — completed
- – **Paid media scouts** (`ads`) — skills: metrics-pull
  - blocked: live reads need MCP: google-ads, meta-ads
- – **AM brief / client reports** (`reporting`) — skills: am-report, client-report

## Tier 2 queue (Dillon only)

- Outbound: Gmail send, Slack post, deploy/publish, spend changes, credentials
- See `tier2-queue.md` in the run folder for prepared decision-ready items

## Superseded crons

- Do not schedule separate slack-intake, am-report, or client-pulse crons.
- Run `/dillon-command` once; lanes fan out in parallel.
