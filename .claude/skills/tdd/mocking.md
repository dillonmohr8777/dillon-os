# When to Mock

Mock at **system boundaries** only:

- External APIs
- Databases (prefer a test DB when one exists)
- Time and randomness
- File system (sometimes)

Do not mock your own modules, internal collaborators, or anything you control.

## Designing for mockability

Pass external dependencies in rather than creating them internally.

Prefer SDK-style interfaces (one function per external operation) over a generic fetcher that forces conditional mocks.
