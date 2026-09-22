---
category: enhancement
state: done
status: done
---

# 04: Remove Duplicate RSVP Message Storage

**What to build:** Complete the expand–contract migration by removing the old RSVP message storage and transitional write path after all new and legacy messages are represented by Wishes.

**Blocked by:** 01: Capture RSVP Messages as Linked Pending Wishes; 02: Complete the Unified Wishes Experience; 03: Backfill Existing RSVP Messages into Wishes

**Status:** done

- [x] New RSVP submissions no longer persist guest-written content on the RSVP record.
- [x] Wish is the single source of truth for RSVP-generated and direct guest messages.
- [x] The old RSVP message column and unused compatibility behavior are removed safely.
- [x] RSVP attendance and guest-count behavior remains unchanged.
- [x] Existing linked Wishes remain readable, moderatable, and publicly publishable.
- [x] Full feature tests and migration verification are defined for the contract step.
