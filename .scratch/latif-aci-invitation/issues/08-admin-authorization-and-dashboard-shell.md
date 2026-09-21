---
category: feature
state: ready-for-qa
status: ready-for-qa
triage: ready-for-agent
---

# 08: Admin Authorization and Dashboard Shell

**What to build:** Provide the authenticated admin entry point for invitation
content management, with a section-based dashboard shell that clearly separates
content management from existing wishes moderation.

**Blocked by:** 07: Invitation Aggregate and Config Migration

**Status:** ready-for-qa

- [x] Allow an authorized admin to open the invitation content dashboard.
- [x] Deny guests and authenticated users without admin permission from content
      management routes and actions.
- [x] Provide navigation for overview/general, couple, events/countdown,
      opening, gifts, gallery, story, media library, and publish.
- [x] Show the current draft/published status in the dashboard shell.
- [x] Preserve the existing wishes moderation workflow as a separate area.
- [x] Cover authorization success and denial at the HTTP boundary.
