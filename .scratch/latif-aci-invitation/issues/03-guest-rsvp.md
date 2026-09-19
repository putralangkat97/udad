---
category: enhancement
state: ready-for-agent
status: ready-for-agent
---

# 03: Guest RSVP

**What to build:** Add an end-to-end public RSVP flow. A guest can submit an attending, not attending, or maybe response from the invitation without logging in, receive validation and result feedback, and have the response persisted by Laravel.

**Blocked by:** 02: Complete Static Invitation Experience

**Status:** ready-for-agent

- [ ] RSVP submissions are stored with the `latif-aci` invitation identity, guest name, attendance status, optional guest count, optional message, and timestamps.
- [ ] The only allowed statuses are attending, not attending, and maybe.
- [ ] Attending responses require a positive guest count.
- [ ] Not attending and maybe responses do not require a guest count.
- [ ] Repeated submissions are retained as separate records rather than rejected as duplicates.
- [ ] Guests can submit the RSVP without authentication.
- [ ] The RSVP form provides clear validation errors, success feedback, and recoverable failure feedback.
- [ ] The public endpoint uses CSRF protection, validation, throttling, and appropriate content-length limits.
- [ ] Feature tests cover successful responses, all statuses, guest-count rules, repeated submissions, unauthenticated access, and invalid input.
