---
category: feature
state: ready-for-agent
status: ready-for-agent
triage: ready-for-agent
---

# Admin Dashboard for Managed Invitation Content

## Problem Statement

The public Anggit–Adis invitation currently reads its guest-facing content
directly from application configuration. This is suitable for the first
release, but the invitation owner cannot update names, dates, event details,
photos, gifts, story entries, audio, or other content without changing code and
deploying again.

The project needs an authenticated admin dashboard that lets the invitation
owner manage content safely, review a private preview, and publish a complete
valid invitation without exposing unfinished changes to guests.

## Solution

Introduce a managed `Invitation aggregate` backed by persistent content rather
than treating `config/invitation.php` as the long-term source of truth. Provide
an authenticated admin dashboard with section-based editing, explicit draft
saving, admin-only preview, validation, and atomic publish.

Seed the current Anggit–Adis configuration as the initial published version so
the existing public invitation remains available during migration. Keep the
public root URL and the existing invitation renderer, changing its data source
to the published version with a safe configuration fallback during rollout.

Provide a simple media library for images, audio, and decorative resources.
Referenced assets cannot be hard-deleted; they can be archived and removed
permanently only after no invitation content references them.

## User Stories

1. As an invitation admin, I want to sign in before managing invitation content, so that public guests cannot edit the invitation.
2. As an invitation admin, I want only an authorized admin role to access content management, so that verified users without permission cannot change the published invitation.
3. As an invitation admin, I want to see an overview of the current invitation status, so that I know whether I am looking at a draft, a published version, or content needing attention.
4. As an invitation admin, I want to edit general invitation content, so that I can change the title, timezone, cover copy, guest greeting, and invitation label without code changes.
5. As an invitation admin, I want to edit the couple's names and roles, so that the public invitation reflects the correct identities.
6. As an invitation admin, I want to edit each parent's names, so that family information remains accurate.
7. As an invitation admin, I want to replace the bride and groom portraits, so that the couple section can use updated photos.
8. As an invitation admin, I want to choose the decorative frame for couple portraits, so that managed assets can be reused without changing layout code.
9. As an invitation admin, I want to add, edit, reorder, and remove event entries, so that ceremony and reception details remain current.
10. As an invitation admin, I want to edit event date, time, venue, timezone-relevant information, and map links, so that guests receive actionable schedule details.
11. As an invitation admin, I want to configure the countdown target and label, so that the countdown matches the primary wedding event.
12. As an invitation admin, I want to edit the opening quote and reference, so that the invitation's opening message can change without a deployment.
13. As an invitation admin, I want to replace the quote frame, so that the opening section can use a different managed asset.
14. As an invitation admin, I want to edit the gifts introduction, so that the explanation matches the couple's preference.
15. As an invitation admin, I want to add, edit, reorder, and remove gift accounts, so that published account details remain accurate.
16. As an invitation admin, I want account numbers and holders validated before publish, so that guests are less likely to receive unusable payment details.
17. As an invitation admin, I want to add, edit, reorder, and remove gallery images, so that the photo gallery can evolve over time.
18. As an invitation admin, I want to edit gallery alt text, so that the public gallery remains accessible.
19. As an invitation admin, I want to add, edit, reorder, and remove love-story entries, so that the story can be updated without restructuring the page.
20. As an invitation admin, I want to edit story titles, periods, copy, and ornaments, so that each story entry remains complete.
21. As an invitation admin, I want to replace the invitation audio, so that the music can be updated while keeping the existing cover interaction.
22. As an invitation admin, I want to upload images, audio, and decorative resources to a media library, so that content editors do not need server access.
23. As an invitation admin, I want to reuse an existing media asset in multiple content fields, so that duplicate uploads are unnecessary.
24. As an invitation admin, I want referenced media assets protected from hard deletion, so that publishing content cannot be broken accidentally.
25. As an invitation admin, I want to archive unused media assets, so that the library remains manageable without losing referential safety.
26. As an invitation admin, I want to save incomplete changes as a draft, so that I can work across multiple editing sessions.
27. As an invitation admin, I want draft changes to remain invisible to public guests, so that unfinished content is never exposed.
28. As an invitation admin, I want to preview the draft using the same invitation renderer as guests, so that I can verify visual composition and interactions before publishing.
29. As an invitation admin, I want preview access restricted to authenticated admins, so that unfinished content and private assets do not leak through a public link.
30. As an invitation admin, I want publish validation to list every missing or invalid required field, so that I can fix the draft efficiently.
31. As an invitation admin, I want optional sections such as gallery or story to be empty when appropriate, so that the validation rules reflect real invitation needs.
32. As an invitation admin, I want the couple, primary event, countdown, and cover to be required for publishing, so that the public invitation cannot be structurally incomplete.
33. As an invitation admin, I want to publish the complete invitation atomically, so that guests never see a mixture of draft and previously published sections.
34. As an invitation admin, I want to see who published the current version and when, so that published changes are auditable.
35. As an invitation admin, I want to continue seeing the current invitation if no managed published version exists, so that migration or deployment does not produce a blank public page.
36. As a guest, I want the public root URL to show only the published version, so that I never see admin drafts.
37. As a guest, I want the published version to preserve the existing cover, music, countdown, RSVP, gallery, gifts, story, and interaction behavior, so that content management does not change the invitation experience unexpectedly.
38. As a guest, I want missing optional content to leave a clean section or be omitted gracefully, so that the invitation remains readable.
39. As an invitation admin, I want existing moderated wishes management to remain available separately, so that guest-submitted messages can continue to be reviewed without coupling them to content editing.
40. As a maintainer, I want the public invitation renderer to consume a stable invitation content contract, so that the dashboard can change persistence without duplicating the guest UI.
41. As a maintainer, I want the current configuration imported idempotently, so that staging and production setup can be repeated safely.
42. As a maintainer, I want content validation at the server boundary, so that invalid or unsafe data cannot be published by bypassing the dashboard UI.
43. As a maintainer, I want authorization enforced at every admin endpoint, so that hiding dashboard links is not the only protection.
44. As a maintainer, I want media references validated before publish, so that archived or missing assets cannot silently break the invitation.
45. As a maintainer, I want public rendering, draft preview, save, and publish covered by stable tests, so that future dashboard changes do not regress the invitation.

## Implementation Decisions

- Treat the complete managed content as one `Invitation aggregate` with related
  sections for couple, events, countdown, opening content, gifts, gallery, and
  story entries.
- Start with one active Anggit–Adis invitation, but keep the domain model
  invitation-keyed so a future multi-invitation feature does not require
  rewriting the public contract.
- Add persistent storage for draft content and the currently published version.
  Full version history and rollback are not part of v1.
- Keep the public root URL and use the existing invitation renderer for both
  public and preview modes.
- Public rendering reads the published version. A configuration fallback is
  retained until the initial production seed has been verified.
- Preview renders the draft through the same guest-facing composition and
  interaction code, but requires an authenticated admin.
- Use one explicit `admin` role in v1. Do not introduce editor/reviewer/owner
  role matrices until a real authorization need appears.
- Separate content-management authorization from ordinary authentication and
  from existing wishes moderation authorization.
- Organize the dashboard into section-based editing areas: overview/general,
  couple, events/countdown, opening, gifts, gallery, story, media library, and
  publish.
- Use explicit Save actions. Saving creates or updates draft content; it never
  makes the draft public.
- Publishing is atomic for the whole invitation aggregate.
- Draft content may be incomplete. Publishing requires valid couple data, a
  valid cover, at least one primary event, a valid countdown target, and valid
  references to required media assets.
- Gallery and story collections are optional and may be empty.
- Event map links must be valid URLs. Dates and countdown targets must be
  interpreted using the invitation timezone.
- Gift account numbers and holders must be present when a gift account exists;
  no payment provider integration is included.
- Media assets are stored through application storage and represented by media
  records. Binary content is not stored directly in invitation records.
- Existing public asset references are imported into the initial published
  content during an idempotent migration/seed step.
- A media asset that is referenced by draft or published content cannot be
  hard-deleted. Unused assets may be archived and permanently deleted only
  after reference checks pass.
- Keep the existing public RSVP behavior and existing wishes moderation
  behavior unless a separate ticket changes them.
- Do not make the removed public wishes section a required part of the managed
  invitation content. Existing moderation endpoints may remain available for
  future use.
- Validate and authorize on the server, not only through frontend form rules.
- Deploy through staging first: back up the database, run migrations, run the
  idempotent initial seed, verify the published version, then promote to
  production.

## Testing Decisions

- Test the highest stable external seam: admin edit → draft save → preview →
  publish → public invitation rendering.
- Laravel HTTP feature tests should cover admin authorization, draft creation
  and updates, server-side validation, preview access, atomic publish, public
  published-version selection, and configuration fallback during migration.
- Feature tests should cover couple, event, countdown, opening, gift, gallery,
  story, audio, and media-library validation at the request boundary.
- Tests should verify that a failed publish leaves the previous published
  version unchanged.
- Tests should verify that a successful publish makes the complete new version
  visible and does not expose draft-only fields to guests.
- Tests should verify that unprivileged authenticated users and guests cannot
  save, preview, publish, archive, or delete managed content.
- Tests should verify media reference protection and archive/delete behavior.
- Tests should verify the initial config import is idempotent and preserves the
  current invitation content.
- Existing wishes moderation tests remain the regression seam for wishes
  workflows; they are not replaced by dashboard tests.
- Browser/manual QA should verify each dashboard section, validation messages,
  draft isolation, admin-only preview, publish feedback, mobile public
  rendering, audio, countdown, gallery, RSVP, gifts, and story behavior.
- Accessibility QA should cover labels, keyboard navigation, focus states,
  upload controls, validation announcements, preview access, and public
  invitation readability.
- Run TypeScript checks, focused feature tests, the full Laravel test suite,
  and the production build for each implementation slice.
- Tests should assert external behavior and stable content contracts, not React
  component internals or CSS implementation details.

## Out of Scope

- Full multi-tenant invitation management.
- Custom public slugs or multiple public invitation URLs.
- Full version history, diffing, rollback, or scheduled publishing.
- Autosave.
- Public preview tokens or shareable draft links.
- Theme, CSS, layout, animation, or visual-style editing from the dashboard.
- A general-purpose CMS for unrelated content.
- Payment-provider integration or automated gift reconciliation.
- Video uploads, camera capture, or video moderation.
- Guest authentication for viewing or submitting RSVP.
- New notification, email, WhatsApp, analytics, or marketing integrations.
- Rebuilding the existing wishes moderation workflow unless required by a
  separate approved ticket.

## Further Notes

- The current public invitation remains configuration-backed until the initial
  managed published version is seeded and verified.
- The public route should never be allowed to fail closed to a blank invitation
  during migration; the fallback is a release-safety measure.
- The dashboard should be implemented in vertical slices, beginning with the
  invitation aggregate and initial published seed, then admin authorization,
  general/couple content, events and countdown, media library, remaining
  sections, preview, and atomic publish.
- The current repository already contains authentication, a dashboard route,
  RSVP persistence, and wishes moderation that can serve as implementation
  prior art.
