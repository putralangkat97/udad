# 03: Rotate recipient links and finalize domain behavior

**What to build:** Add recipient-token rotation and finalize the personalized-cover domain behavior. Admins can revoke a shared recipient link by rotating its token. Cover rendering must use an explicit display-name value rather than comma-delimited parsing, while RSVP remains independent. Capture the durable decisions in the project glossary and ADR.

**Blocked by:** 01 — Create and open personalized recipient links.

**Status:** ready-for-agent

- [ ] An admin can rotate an active recipient token.
- [ ] Token rotation produces a new opaque token and invalidates the previous link immediately.
- [ ] The new link continues to render the recipient's display name.
- [ ] The old link no longer resolves as an active personalized link.
- [ ] Display names containing commas render intact.
- [ ] RSVP submission and stored RSVP data remain independent from recipient records.
- [ ] The project glossary defines invitation recipient, recipient link, and archived recipient consistently.
- [ ] An ADR records the separate recipient model, opaque links, immediate updates, and RSVP independence.
- [ ] Feature tests cover rotation, old-token invalidation, comma-containing names, and RSVP independence.
- [ ] The complete recipient flow and existing invitation tests pass.
