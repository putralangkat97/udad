---
category: feature
state: ready-for-qa
status: ready-for-qa
triage: ready-for-agent
---

# 07: Invitation Aggregate and Config Migration

**What to build:** Move the invitation's guest-facing content behind a managed
Invitation aggregate and create the initial published version from the current
configuration. The public invitation must continue to render the current
Anggit–Adis content during and after migration.

**Blocked by:** None (can start immediately)

**Status:** ready-for-qa

- [x] Persist an Invitation aggregate with draft and published content states.
- [x] Import the current configuration idempotently as the initial published
      version.
- [x] Keep the public root invitation rendering the current content after the
      migration.
- [x] Preserve a safe configuration fallback when no managed published version
      is available.
- [x] Keep the published content contract stable for the existing invitation
      renderer.
- [x] Cover migration, published selection, fallback, and failure behavior with
      server-side tests.
