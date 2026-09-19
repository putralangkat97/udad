---
category: enhancement
state: ready-for-qa
status: ready-for-qa
---

# 05: Invitation Hardening and Release QA

**What to build:** Prepare the complete invitation for release by verifying the guest experience across devices and hardening the public RSVP and wishes behavior. The result is a visually faithful, accessible, and safe invitation that passes the project's verification checks.

**Blocked by:** 03: Guest RSVP; 04: Guest Wishes and Moderation

**Status:** ready-for-qa

- [ ] Mobile, tablet, and desktop layouts match the intended narrow invitation canvas and remain free of unintended horizontal overflow.
- [ ] Cover reveal, music fallback and toggle, countdown, scroll animations, gallery viewer, clipboard feedback, RSVP states, wishes, and moderation behavior are manually verified.
- [ ] Form labels, buttons, modal dismissal, keyboard interaction, focus behavior, contrast, and non-audio fallbacks are usable.
- [x] User-provided guest names and messages cannot inject executable markup into public or moderation views.
- [x] Public RSVP and wish submissions are throttled and return appropriate errors when limits or validation rules are exceeded.
- [x] The existing Laravel feature tests, focused invitation tests, TypeScript checks, and project quality checks pass.
- [ ] The supplied assets and gift-account details are verified as authorized for publication before deployment.
