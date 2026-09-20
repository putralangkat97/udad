---
category: feature
state: ready-for-qa
status: ready-for-qa
triage: ready-for-agent
---

# 12: Admin-Only Draft Preview

**What to build:** Let an authorized admin preview the current draft using the
same guest-facing invitation renderer and interactions without exposing the
draft through the public root URL.

**Blocked by:** 09: Draft General, Couple, Event, and Opening Content; 10: Media Library and Referenced Asset Management; 11: Draft Gifts, Gallery, Story, and Audio Content

**Status:** ready-for-qa

- [ ] Provide an admin-only preview entry point for the current draft.
- [ ] Render preview content through the same public invitation composition and
      data contract.
- [ ] Keep cover reveal, music, countdown, gallery, RSVP, gifts, story, and
      responsive behavior usable in preview.
- [ ] Prevent guests and unprivileged users from opening draft preview.
- [ ] Make it clear to the admin that the page is a draft preview and is not
      public.
- [ ] Verify public root rendering still uses only the published version.
