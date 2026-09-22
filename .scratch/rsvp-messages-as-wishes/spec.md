---
category: enhancement
state: ready-for-agent
status: ready-for-agent
---

# RSVP Messages as Moderated Wishes

## Problem Statement

An invited guest can currently submit an optional message with an RSVP, while
the invitation has a separate moderated-wish concept. The same guest-written
content is therefore split across two flows even though an RSVP message is
intended to be a hope, prayer, congratulations, or personal message for the
couple.

The split makes moderation incomplete: RSVP messages are retained with
attendance data but do not enter the wish review workflow or the public wishes
experience. It also creates two competing meanings for a guest message and
would require storing the same message in two places if the flows were simply
copied together.

## Solution

Treat every non-blank RSVP message as a moderated wish while keeping the RSVP
as the source of attendance information. An RSVP submission with a message
creates one pending wish linked to that RSVP. The message is stored on the
wish, not duplicated on the RSVP.

The existing standalone wish submission remains available and continues to
create an unlinked pending wish. Both sources use the same pending, published,
and rejected lifecycle. Published wishes appear in the public invitation;
their source is never exposed to guests.

When an RSVP is submitted through a personalized recipient link, the RSVP
retains nullable recipient provenance. This helps the invitation owner
understand the source of a response without treating a shared link as proof of
the author's identity. The public wish author remains the RSVP submitter's
name.

## User Stories

1. As an invited guest, I want to submit an RSVP without logging in, so that I can respond quickly.
2. As an invited guest, I want to choose attending, not attending, or maybe, so that my attendance intent is clear.
3. As an invited guest, I want to provide a guest count when attending, so that the couple can plan seating and catering.
4. As an invited guest, I want to submit a non-attending or maybe response without a guest count, so that irrelevant information is not required.
5. As an invited guest, I want to write a hope, prayer, congratulations, or message while submitting my RSVP, so that I can share something meaningful with the couple.
6. As an invited guest, I want the RSVP field to be labelled “Hope & prayer”, so that I understand how the message will be used.
7. As an invited guest, I want whitespace-only input to be treated as empty, so that it does not create a meaningless public contribution.
8. As an invited guest, I want a non-blank RSVP message to be saved even when I cannot attend, so that I can still send a blessing.
9. As an invited guest, I want my RSVP message to be reviewed before publication, so that I understand it may not appear immediately.
10. As an invited guest, I want my name to appear with my published wish, so that the message retains its author.
11. As an invited guest, I want repeated RSVP submissions to remain separate, so that a correction or later response is not silently merged with an earlier one.
12. As an invited guest, I want each repeated RSVP message to become its own moderated wish, so that each contribution can be reviewed independently.
13. As an invited guest, I want an RSVP without a message to create no wish, so that attendance-only responses do not add empty content.
14. As an invited guest, I want a direct wish submission to remain available, so that I can leave a message without submitting attendance information.
15. As an invited guest, I want direct wishes and RSVP-generated wishes to appear in the same public wishes experience, so that all approved messages are presented consistently.
16. As an invited guest, I want to see only published wishes, so that unreviewed or rejected content remains private.
17. As an invited guest, I want published wishes to show the author's name and message, so that the public list feels personal.
18. As an invited guest, I do not want to see whether a wish came from an RSVP or a standalone submission, so that all published wishes have equal presentation.
19. As an authenticated moderator, I want to see pending wishes from both submission paths, so that no guest message bypasses review.
20. As an authenticated moderator, I want RSVP-generated wishes marked as coming from an RSVP, so that I understand their context during review.
21. As an authenticated moderator, I want to see RSVP attendance status and guest count for RSVP-generated wishes, so that I can moderate with relevant context.
22. As an authenticated moderator, I want to publish a pending wish, so that it becomes visible in the invitation.
23. As an authenticated moderator, I want to reject a pending wish, so that unsuitable content does not become public.
24. As an authenticated moderator, I want rejecting a wish to leave the RSVP unchanged, so that content moderation does not alter attendance data.
25. As an authenticated moderator, I want rejected wishes retained, so that moderation history is not lost.
26. As the invitation owner, I want RSVP attendance data kept separate from guest-written content, so that each concept has a clear source of truth.
27. As the invitation owner, I want existing RSVP messages converted into pending wishes, so that previously submitted guest content is not lost during migration.
28. As the invitation owner, I want messages submitted through personalized links to retain recipient provenance, so that responses can be understood in invitation context.
29. As the invitation owner, I want recipient provenance kept separate from public authorship, so that a household link does not incorrectly rename the person who wrote the message.
30. As the invitation owner, I want RSVP and wish creation to succeed or fail together, so that an RSVP cannot be saved without its associated wish.
31. As the invitation owner, I want public RSVP and wish endpoints throttled, so that repeated automated submissions are limited.
32. As the invitation owner, I want guest-written content escaped on output, so that messages cannot inject executable markup.
33. As a maintainer, I want one moderated-wish lifecycle for both sources, so that moderation rules do not diverge.
34. As a maintainer, I want the message stored in exactly one domain record, so that edits, moderation, and public rendering do not disagree.
35. As a maintainer, I want existing invitation-scoping rules preserved, so that RSVP and wish records cannot be mixed across invitations.
36. As a maintainer, I want behavior tested at the Laravel HTTP boundary, so that tests protect user-visible behavior rather than implementation details.

## Implementation Decisions

- The canonical domain term remains **Moderated wish**. It includes messages submitted directly as wishes and messages originating from RSVP submissions.
- The RSVP is the participation record. It owns the invitation identity, submitter name, attendance status, optional guest count, optional recipient provenance, and timestamps.
- The Wish is the guest-content record. It owns the invitation identity, author name, message, moderation status, optional source RSVP reference, and timestamps.
- A non-blank RSVP message creates exactly one pending Wish. A blank or whitespace-only message creates no Wish.
- RSVP messages are trimmed before deciding whether they are blank and before persisting the resulting Wish content.
- RSVP attendance does not control wish creation. Attending, not-attending, and maybe responses may all produce wishes.
- Repeated RSVP submissions remain separate records. Each non-blank message produces a separate pending Wish linked to its own RSVP.
- The RSVP no longer duplicates the message after the data migration. The Wish is the sole storage location for the guest-written content.
- A Wish has an optional relationship to its source RSVP. Direct wish submissions leave this relationship empty.
- An RSVP may have nullable recipient provenance. Submissions made through a personalized recipient link record that recipient; submissions at the generic invitation URL do not.
- Recipient provenance is informational and does not replace the RSVP submitter's name or establish verified identity.
- RSVP creation and creation of its generated Wish occur in one database transaction.
- Existing standalone wish submissions continue to use the same validation, throttling, pending status, moderation actions, and public projection.
- Wish moderation remains `pending` to `published` or `rejected`. Rejection does not change or delete the source RSVP.
- Rejected Wishes remain stored for moderation history and are never included in the public wishes projection.
- Authenticated moderators see source context for RSVP-generated Wishes, including RSVP origin, attendance status, and guest count where present.
- Public guests see only published Wish author names and messages. The public response does not reveal whether a Wish came from an RSVP or direct wish submission.
- The public invitation renders the existing published-wishes projection so approved RSVP-generated and direct Wishes are visible together.
- The RSVP field is presented as “Hope & prayer” with supporting copy explaining that guests may leave a hope, prayer, congratulations, or message for the couple.
- Existing RSVP messages are backfilled into pending Wishes linked to their source RSVPs before the duplicated RSVP message field is removed.
- The migration must preserve invitation scoping, original message content after normalization, source RSVP identity, timestamps where practical, and the existing RSVP attendance record.
- Existing invitation-recipient behavior remains governed by the personalized recipient-link decision: recipient changes and link rotation do not rewrite submitted RSVP or Wish authorship.
- The existing invitation key continues to scope both RSVP and Wish records.
- Validation continues to enforce the existing 2,000-character maximum for guest messages.
- Public submission endpoints continue to use CSRF protection where applicable, throttling, validation, and safe escaped rendering.
- The primary implementation seam is the public Laravel HTTP boundary: submit RSVP, inspect persisted RSVP/Wish state, load the invitation, and exercise authenticated moderation actions.
- Existing Laravel authentication remains the authorization boundary for moderation. Guests remain unauthenticated for viewing and submitting.

## Testing Decisions

- Tests verify externally observable HTTP behavior and persisted domain outcomes. They do not assert controller internals, ORM implementation details, React component state, or CSS structure.
- The primary seam is the existing Laravel feature-test boundary used by the RSVP and Wish suites.
- RSVP feature tests cover messages for all three attendance statuses, blank and whitespace-only messages, messages over the length limit, and RSVP submissions without messages.
- RSVP feature tests verify that a successful message-bearing RSVP creates one pending Wish with the submitter's name and source RSVP reference.
- RSVP feature tests verify that a message-free RSVP creates no Wish and that repeated message-bearing RSVPs create separate RSVP/Wish pairs.
- Transaction behavior is tested through the externally visible outcome that an invalid or failed RSVP does not leave a partial generated Wish.
- Recipient-link tests verify that an RSVP submitted through a personalized link records recipient provenance without changing the public Wish author.
- Migration tests or migration-level verification cover conversion of existing non-blank RSVP messages into pending linked Wishes and removal of the duplicated RSVP message storage.
- Existing Wish feature tests remain the prior art for validation, pending visibility, published visibility, rejected exclusion, throttling, authorization, and safe output.
- Wish moderation tests verify that an RSVP-generated Wish displays source and attendance context to moderators, while direct Wishes remain valid without RSVP context.
- Moderation tests verify that publishing exposes the message publicly, rejection does not, and rejection leaves the source RSVP unchanged.
- Public invitation tests verify that only published Wishes are returned and that public payloads do not expose RSVP source or recipient provenance.
- Existing RSVP tests remain green for attendance statuses, guest-count rules, repeated submissions, and throttling.
- Frontend verification covers the renamed RSVP field, success and validation states, public published-wishes rendering, and moderation source indicators without coupling tests to component internals.
- The focused feature tests, frontend type checks, and full application test suite are run after implementation.

## Out of Scope

- Automatically publishing RSVP messages without moderation.
- Treating an invitation recipient link as verified identity.
- Replacing the existing wish moderation workflow with a new moderation system.
- Building a separate RSVP administration dashboard or RSVP editing workflow.
- Deduplicating repeated RSVP submissions or repeated guest messages.
- Sending notifications when a wish is created, published, or rejected.
- Allowing guests to edit or withdraw an RSVP or Wish after submission.
- Exposing RSVP attendance status, guest count, recipient provenance, or source type in the public invitation.
- Adding CAPTCHA, account creation, or guest authentication.
- Changing the invitation-recipient lifecycle beyond recording provenance on new RSVP submissions.
- Reworking unrelated invitation content, media, gifts, gallery, or authentication behavior.

## Further Notes

- The current codebase already has separate RSVP and Wish feature suites and an existing pending/published/rejected Wish lifecycle. This spec intentionally deepens that existing seam rather than introducing a parallel message system.
- The public invitation already receives published Wishes from the backend, but the frontend must render the public Wishes section as part of this change.
- The migration should be planned as a data-preserving change: create linked Wishes first, validate the backfill, then remove the duplicated RSVP message storage.
- The ADR should explain the trade-off between keeping guest-written content duplicated on RSVP records and making Wish the single source of truth while retaining a source relationship.
