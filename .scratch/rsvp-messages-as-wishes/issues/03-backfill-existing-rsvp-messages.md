---
category: enhancement
state: done
status: done
---

# 03: Backfill Existing RSVP Messages into Wishes

**What to build:** Convert previously stored non-blank RSVP messages into pending Wishes linked to their original RSVPs, preserving guest content and invitation history before the duplicated storage is removed.

**Blocked by:** 01: Capture RSVP Messages as Linked Pending Wishes

**Status:** done

- [x] Every existing non-blank RSVP message becomes one pending linked Wish.
- [x] Existing RSVP attendance, guest count, submitter name, and invitation scope remain unchanged.
- [x] Existing blank or null RSVP messages create no Wish.
- [x] Backfilled Wishes retain their original author and message after normalization.
- [x] Backfill behavior is safe to run through the deployment migration path without creating duplicate Wishes.
- [x] Migration-level verification covers populated, blank, repeated, and invitation-scoped RSVP data.
