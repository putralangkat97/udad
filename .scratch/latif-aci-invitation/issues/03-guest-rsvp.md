---
category: enhancement
state: done
status: done
---

# 03: Guest RSVP

**What to build:** Add an end-to-end public RSVP flow. A guest can submit an attending, not attending, or maybe response from the invitation without logging in, receive validation and result feedback, and have the response persisted by Laravel.

**Blocked by:** 02: Complete Static Invitation Experience

**Status:** done

- [x] RSVP submissions are stored with the `latif-aci` invitation identity, guest name, attendance status, optional guest count, optional message, and timestamps.
- [x] The only allowed statuses are attending, not attending, and maybe.
- [x] Attending responses require a positive guest count.
- [x] Not attending and maybe responses do not require a guest count.
- [x] Repeated submissions are retained as separate records rather than rejected as duplicates.
- [x] Guests can submit the RSVP without authentication.
- [x] The RSVP form provides clear validation errors, success feedback, and recoverable failure feedback.
- [x] The public endpoint uses CSRF protection, validation, throttling, and appropriate content-length limits.
- [x] Feature tests cover successful responses, all statuses, guest-count rules, repeated submissions, unauthenticated access, and invalid input.
