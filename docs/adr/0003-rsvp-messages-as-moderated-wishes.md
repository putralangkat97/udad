# RSVP messages as moderated wishes

An RSVP remains the source of truth for participation: the guest name,
attendance choice, guest count, and optional recipient-link provenance. A
non-blank RSVP message is stored as one pending Wish linked to that RSVP, and
the RSVP does not retain a duplicate copy of the guest-written content.

This keeps guest messages in the existing pending, published, and rejected
moderation lifecycle while preserving attendance context for moderators. Direct
Wish submissions remain supported and use the same lifecycle. Public guests
see only the author and published message; source, attendance, guest count,
and recipient provenance remain private moderation context.

The alternative was to keep the message on RSVP records and copy it into
Wishes. That would create two sources of truth and make moderation or future
editing ambiguous, so the Wish owns the message and the RSVP relationship
provides provenance instead.
