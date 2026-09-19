---
category: enhancement
state: ready-for-agent
status: ready-for-agent
---

# 04: Guest Wishes and Moderation

**What to build:** Add an end-to-end guest wishes flow. Guests can submit a message without logging in, published wishes appear in the invitation, and authenticated moderators can review pending wishes and publish or reject them.

**Blocked by:** 02: Complete Static Invitation Experience

**Status:** ready-for-agent

- [ ] Wish submissions are stored with the `latif-aci` invitation identity, guest name, message, moderation status, and timestamps.
- [ ] New wishes begin in the pending state and are not publicly visible.
- [ ] The public wishes list returns only published wishes with guest name and approved message.
- [ ] Guests can submit wishes without authentication and receive clear success or failure feedback.
- [ ] The wishes list remains usable when many published messages are present.
- [ ] Authenticated moderators can view pending wishes and publish or reject each wish.
- [ ] Unauthenticated users cannot access moderation actions.
- [ ] The public and moderation endpoints use validation, throttling, CSRF protection where applicable, content-length limits, authorization, and safe escaped output.
- [ ] Feature tests cover pending visibility, published visibility, rejected exclusion, guest submission, authorization, publish, reject, and invalid input.
