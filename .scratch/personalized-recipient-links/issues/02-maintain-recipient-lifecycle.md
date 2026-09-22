# 02: Maintain invitation recipient lifecycle

**What to build:** Extend recipient management so admins can edit and archive invitation recipients. Changes apply immediately without invitation publishing. An archived recipient link remains safe to open but renders the generic invitation instead of the archived personalization.

**Blocked by:** 01 — Create and open personalized recipient links.

**Status:** ready-for-agent

- [ ] An admin can edit an existing recipient display name.
- [ ] Display-name edits are visible immediately through the active recipient link.
- [ ] An admin can archive a recipient without permanently deleting its record.
- [ ] An archived recipient token renders the generic published invitation.
- [ ] Archived recipient records remain available in admin management with clear archived state.
- [ ] Duplicate display names continue to be allowed during edits.
- [ ] Invalid or empty display names are rejected.
- [ ] Feature tests cover edit, archive, archived-link fallback, validation, and authorization.
- [ ] Recipient lifecycle changes do not modify invitation draft content, published content, or RSVP records.
