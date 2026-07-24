# Marketing Chief dashboard access for Cursor

## Outcome

Cursor cannot authenticate directly to the owner-only ChatGPT Site. The exact
source behind deployed Sites version 14 has therefore been copied into the
private `dillon-os` repository at:

`_os/marketing-chief-operator-studio`

Live dashboard:

https://dillon-marketing-chief.dillonmohr8777.chatgpt.site

## Access model

- Live site access remains owner-only for Dillon Mohr.
- Cursor receives full source, redacted seed, schema, migrations, tests, and
  application logic through `dillon-os`.
- No bypass token, session credential, or production secret is shared.
- The Sites source repository remains canonical. The `dillon-os` copy is a
  collaboration snapshot until Dillon approves a source-of-truth migration.

## Verification contract

From `_os/marketing-chief-operator-studio`:

```powershell
npm ci
npm run lint
npm test
```

Cursor should report proposed changes by exact path and pull request, and must
keep deployment and consequential external actions behind separate approval.

