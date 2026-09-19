---
category: enhancement
state: done
status: done
---

# 04: Guest Wishes and Moderation

**What to build:** Add an end-to-end guest wishes flow. Guests can submit a message without logging in, published wishes appear in the invitation, and authenticated moderators can review pending wishes and publish or reject them.

**Blocked by:** 02: Complete Static Invitation Experience

**Status:** done

- [x] Wish submissions are stored with the `latif-aci` invitation identity, guest name, message, moderation status, and timestamps.
- [x] New wishes begin in the pending state and are not publicly visible.
- [x] The public wishes list returns only published wishes with guest name and approved message.
- [x] Guests can submit wishes without authentication and receive clear success or failure feedback.
- [x] The wishes list remains usable when many published messages are present.
- [x] Authenticated moderators can view pending wishes and publish or reject each wish.
- [x] Unauthenticated users cannot access moderation actions.
- [x] The public and moderation endpoints use validation, throttling, CSRF protection where applicable, content-length limits, authorization, and safe escaped output.
- [x] Feature tests cover pending visibility, published visibility, rejected exclusion, guest submission, authorization, publish, reject, and invalid input.
