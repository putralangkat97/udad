---
category: feature
state: ready-for-qa
status: ready-for-qa
triage: ready-for-agent
---

# 13: Validation and Atomic Publish

**What to build:** Allow an admin to validate and publish a complete invitation
draft as one atomic published version, while preserving the previous public
version whenever validation fails.

**Blocked by:** 12: Admin-Only Draft Preview

**Status:** ready-for-qa

- [x] Require valid couple data, cover content, a primary event, countdown
      target, and required media references before publish.
- [x] Allow optional gallery and story collections to remain empty.
- [x] Show a complete, actionable validation error list when publish is blocked.
- [x] Publish all invitation sections as one consistent version.
- [x] Keep the previous published version active if publishing fails.
- [x] Show publisher identity and publish timestamp for the active version.
- [x] Make the public root route read the newly published version after success.
- [x] Prevent direct or unauthorized publish requests at the server boundary.
- [x] Verify that no draft-only values leak to guests.
