# 01: Create and open personalized recipient links

**What to build:** Let an admin create an invitation recipient/group with one display name, see it in a dedicated Guests page, and copy a personalized `/invite/{token}` link. When the link is opened, the published invitation cover shows the recipient name as `Dear, {displayName}`. The generic invitation at `/` remains available with `Dear Guest`.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] An admin-only Guests page is available to authorized admins.
- [ ] An admin can create a recipient with a required display name.
- [ ] Duplicate display names are allowed.
- [ ] A created recipient receives a unique opaque token.
- [ ] The Guests page displays a complete copyable `/invite/{token}` link.
- [ ] An active recipient link renders the published invitation with the recipient display name on the cover.
- [ ] The generic `/` invitation renders `Dear Guest`.
- [ ] Unknown or malformed recipient tokens return 404.
- [ ] Unauthenticated users and non-admin users cannot access recipient management or mutations.
- [ ] Feature tests cover the public route, generic route, creation flow, validation, and authorization.
- [ ] Existing RSVP behavior remains unchanged.
