---
category: enhancement
state: done
status: done
---

# 01: Capture RSVP Messages as Linked Pending Wishes

**What to build:** Make a non-blank RSVP message create a pending Wish linked to the source RSVP, while preserving the existing RSVP message storage temporarily for the expand–contract migration.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] RSVP messages from attending, not-attending, and maybe submissions create one pending Wish.
- [x] Blank and whitespace-only RSVP messages create no Wish.
- [x] The Wish uses the RSVP submitter's name and normalized message.
- [x] Repeated RSVP submissions create separate RSVP and Wish records.
- [x] A generated Wish retains a reference to its source RSVP.
- [x] An RSVP submitted through a personalized recipient link retains nullable recipient provenance without changing public authorship.
- [x] RSVP and generated Wish creation succeed or fail together.
- [x] Existing validation, invitation scoping, CSRF protection, throttling, and message length limits remain enforced.
- [x] Feature tests cover the generated Wish behavior and persisted relationships.
