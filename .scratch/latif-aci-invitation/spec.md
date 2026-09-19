---
category: enhancement
state: ready-for-agent
status: ready-for-agent
---

# Recreate the Latif & Aci Wedding Invitation

## Problem Statement

The current `anggit-adis` project is a Laravel starter application and does not yet provide a public wedding invitation experience. The desired invitation already exists as a plain HTML implementation at `inv.moromoroit.com`, with a distinctive visual system built from decorative image assets, custom fonts, music, photo collages, animations, and a narrow mobile-first layout.

The project needs a Laravel-native version that preserves the reference invitation's guest experience while replacing its standalone HTML/PHP behavior with an Inertia React frontend and Laravel-backed RSVP and wishes behavior.

## Solution

Build one public invitation for the `latif-aci` invitation identity at the site root. Recreate the reference's visual style and guest interactions using the existing Laravel 13 + Inertia React stack and the supplied local assets.

The invitation will include the cover/reveal experience, couple information, event details, countdown, RSVP, moderated wishes, gifts, gallery, music controls, and responsive behavior. RSVP submissions and wishes will be persisted by Laravel. Invitation content will remain configuration-based for v1 rather than requiring a CMS.

## User Stories

1. As an invited guest, I want to open the public invitation without creating an account, so that I can view the wedding information immediately.
2. As an invited guest, I want to see a visually faithful cover screen, so that the invitation feels like the supplied reference.
3. As an invited guest, I want to activate the invitation through the cover interaction, so that the main invitation content is revealed intentionally.
4. As an invited guest, I want the invitation to begin background music after my cover interaction, so that the browser's user-gesture audio rules are respected.
5. As an invited guest, I want to pause and resume the background music, so that I can control the experience.
6. As an invited guest, I want the music control to show whether music is active, so that I understand the current playback state.
7. As an invited guest, I want the invitation to preserve the reference's cream, terracotta, decorative, and handwritten visual language, so that the recreation feels intentional rather than generic.
8. As an invited guest, I want the supplied custom fonts to be used in the appropriate sections, so that the typography matches the reference.
9. As an invited guest, I want the supplied decorative images to be used locally, so that the invitation does not depend on the original site's asset paths.
10. As an invited guest, I want the supplied couple photos to appear in the invitation, so that the couple sections and gallery reflect the initial Latif & Aci content.
11. As an invited guest, I want the invitation to work on a mobile screen, so that I can view it comfortably from a phone.
12. As an invited guest, I want the invitation to retain a narrow phone-like canvas on desktop, so that the visual composition remains faithful to the reference.
13. As an invited guest, I want the desktop outer area to visually separate the invitation canvas from the page background, so that the invitation maintains its phone-preview presentation.
14. As an invited guest, I want the invitation to prevent unwanted horizontal overflow, so that decorative elements do not make the page difficult to navigate.
15. As an invited guest, I want the invitation sections to reveal with tasteful motion as I scroll, so that the experience preserves the reference's animated character.
16. As an invited guest, I want the motion to remain usable on smaller screens, so that animation does not prevent me from reading or completing the invitation.
17. As an invited guest, I want to read the couple's introduction and family information, so that I understand who is getting married.
18. As an invited guest, I want to see the bride and groom presented as distinct sections, so that the couple information is easy to follow.
19. As an invited guest, I want to view the ceremony and reception details, so that I know when and where each event takes place.
20. As an invited guest, I want event times to be presented in Asia/Jakarta time, so that the displayed schedule matches the wedding location.
21. As an invited guest, I want to open a map link for the event location, so that I can plan how to attend.
22. As an invited guest, I want to see a live countdown to the wedding date, so that I can anticipate the event.
23. As an invited guest, I want the countdown to use the wedding location's timezone, so that the remaining time is consistent for all guests.
24. As an invited guest, I want the countdown to stop at zero after the event begins, so that it does not display negative values.
25. As an invited guest, I want to submit an RSVP without logging in, so that responding is quick and accessible.
26. As an invited guest, I want to enter my name, so that the couple can identify my response.
27. As an invited guest, I want to confirm that I will attend, so that the couple can plan for me.
28. As an invited guest, I want to say that I cannot attend, so that the couple receives an accurate response.
29. As an invited guest, I want to respond that my attendance is uncertain, so that I can communicate a maybe response honestly.
30. As an attending guest, I want to enter the number of guests attending with me, so that the couple can estimate attendance.
31. As a non-attending guest, I want to submit an RSVP without entering a guest count, so that the form does not require irrelevant information.
32. As a maybe guest, I want to submit an RSVP without committing to a guest count, so that an uncertain response is not treated as a confirmed seat reservation.
33. As an invited guest, I want to include a message with my RSVP, so that I can send my congratulations.
34. As an invited guest, I want clear validation feedback when required RSVP information is missing, so that I can correct the form before submitting it.
35. As an invited guest, I want a clear success message after submitting an RSVP, so that I know my response was stored.
36. As an invited guest, I want a clear error message when the RSVP cannot be stored, so that I know I may need to try again later.
37. As an invited guest, I want repeated RSVP submissions to be accepted as separate responses, so that I can correct or clarify a previous response without being blocked.
38. As an invited guest, I want to submit a public wish for the couple, so that I can leave a message for them and other guests.
39. As an invited guest, I want to know that submitted wishes may require approval, so that I understand why my message may not appear immediately.
40. As an invited guest, I want to see only approved wishes, so that the public message list remains appropriate.
41. As an invited guest, I want approved wishes to show the sender's name and message, so that the messages retain their personal context.
42. As an authenticated moderator, I want to view pending wishes, so that I can review new public content.
43. As an authenticated moderator, I want to publish a pending wish, so that it becomes visible to guests.
44. As an authenticated moderator, I want to reject a pending wish, so that unsuitable content does not become public.
45. As a guest, I want the wishes list to remain scrollable when it becomes long, so that the invitation page remains usable.
46. As an invited guest, I want to read the gift explanation, so that I understand how to send an optional gift.
47. As an invited guest, I want to see the configured bank details, so that I can send a gift using the published information.
48. As an invited guest, I want to copy a bank account number, so that I do not have to retype it manually.
49. As an invited guest, I want confirmation that an account number was copied, so that I know the copy action succeeded.
50. As an invited guest, I want to view the couple's gallery, so that I can see the supplied photos.
51. As an invited guest, I want to open a gallery image in a larger viewer, so that I can inspect the photo without leaving the invitation.
52. As an invited guest, I want to close the gallery viewer, so that I can return to the invitation at the same scroll position.
53. As an invited guest, I want the gallery to remain usable on mobile, so that image viewing does not require a desktop screen.
54. As an invited guest, I want loading feedback while the invitation assets are becoming available, so that the page does not appear broken during initial loading.
55. As an invited guest, I want the invitation to remain readable if an optional animation or audio feature is unavailable, so that core information is still accessible.
56. As the invitation owner, I want the initial Latif & Aci content stored in a configuration source, so that content changes do not require redesigning the page structure.
57. As the invitation owner, I want the invitation to use a stable internal invitation key, so that RSVP and wish records cannot be mixed with another invitation in the future.
58. As the invitation owner, I want RSVP and wish data persisted by Laravel, so that submissions survive page reloads and are available for review.
59. As the invitation owner, I want public submission endpoints to be throttled, so that basic abuse does not overwhelm the invitation.
60. As the invitation owner, I want user-provided messages escaped before display, so that guest content cannot inject markup into the invitation.
61. As the invitation owner, I want the existing authentication system to protect moderation actions, so that only authorized users can publish or reject wishes.
62. As a maintainer, I want the invitation sections to be separated by guest-facing behavior rather than by copied source-HTML fragments, so that the implementation can be maintained without losing visual fidelity.
63. As a maintainer, I want automated tests at the Laravel HTTP boundary, so that externally observable RSVP, wish, and moderation behavior is protected without coupling tests to React internals.
64. As a maintainer, I want the visual-only interactions checked through browser/manual QA, so that animation and responsive layout are evaluated as users experience them.

## Implementation Decisions

- The invitation is a single public experience at the site root and uses the stable internal invitation key `latif-aci` for configuration and persisted records.
- The frontend remains Inertia React within the existing Laravel 13 application. The original standalone HTML/PHP structure is a visual reference, not an implementation dependency.
- The public page is organized into reusable invitation sections: loading, cover/reveal, couple, events, countdown, RSVP, wishes, gifts, gallery, and music control.
- The desktop presentation retains a 440px maximum invitation canvas centered inside a dark outer backdrop. On narrow screens the canvas fills the viewport while preserving the same visual composition.
- The reference's cream background, terracotta accent color, decorative PNG frames, custom fonts, photo treatment, handwritten typography, and motion language are treated as the visual system for v1.
- Supplied images, fonts, and audio are copied into the Laravel public asset area and referenced locally. The implementation must not depend on the original site's relative asset paths.
- The initial copy remains the current mixed English/Indonesian wording from the reference. Copywriting and localization are deferred.
- Invitation content is configuration-based for v1. The configuration includes couple data, event data, timezone, map links, asset references, audio reference, gift accounts, and gallery entries.
- Event display and countdown calculations use the `Asia/Jakarta` timezone.
- The cover interaction is the user gesture that reveals the invitation and may start audio, complying with browser autoplay restrictions.
- Music playback is controlled by an explicit toggle. Audio is not required for the invitation's core information to remain usable.
- The countdown displays days, hours, minutes, and seconds until the configured event date and displays zero values once the event has started.
- RSVP is public and does not require guest authentication.
- RSVP records contain the invitation key, guest name, attendance status, optional guest count, optional message, and timestamps.
- RSVP attendance status is one of `attending`, `not_attending`, or `maybe`.
- A positive guest count is required only when the status is `attending`. The count is not required for `not_attending` or `maybe`.
- Repeated RSVP submissions are retained as separate records rather than deduplicated by guest name.
- Wishes are public submissions but are not publicly visible until moderation publishes them.
- Wish records contain the invitation key, guest name, message, moderation status, and timestamps.
- Wish moderation status is one of `pending`, `published`, or `rejected`.
- The public wishes list contains only published records and exposes only guest name and approved message.
- Authenticated moderation provides the smallest useful workflow: list pending wishes, publish a wish, or reject a wish. A full content-management system is not part of v1.
- The gift section includes the exact configured bank details from the supplied initial content and provides copy-to-clipboard actions.
- The gallery uses local supplied photos and opens images in an in-page viewer without navigating away from the invitation.
- Video-message upload and camera capture are explicitly excluded from v1.
- RSVP and wish endpoints use Laravel validation, CSRF protection, request throttling, sensible content-length limits, and escaped output.
- Existing Laravel authentication protects moderation actions. Guests do not need accounts to view or submit.
- The primary automated seam is the public Laravel HTTP boundary for page data, RSVP submission, wishes retrieval, and moderation actions.
- Browser/manual QA is used for visual fidelity, reveal and music behavior, countdown presentation, gallery behavior, clipboard feedback, and responsive layout.
- The project should not add a new frontend dependency unless the existing React, Radix, and browser APIs cannot provide the required behavior.

## Testing Decisions

- Tests should verify externally observable behavior at the highest stable seam and should not assert React component implementation details, CSS class names, or internal state wiring.
- Laravel feature tests should cover the public invitation response, RSVP validation, successful RSVP persistence, all three attendance statuses, guest-count rules, repeated submissions, throttling behavior where practical, and failure responses.
- Laravel feature tests should cover wish submission, published-wish retrieval, exclusion of pending and rejected wishes, and authenticated publish/reject moderation actions.
- Security-oriented tests should verify that unauthenticated users cannot perform moderation actions and that user-provided messages are safely returned without executable markup.
- Existing prior art is the project's Pest feature-test suite under `tests/Feature`, including authentication and dashboard tests. New behavior should follow that style and use the existing test application setup.
- Visual and interaction checks should be performed in a browser at mobile, tablet, and desktop viewport sizes. These checks should cover the cover reveal, audio toggle, scroll animations, countdown, gallery modal, copy buttons, RSVP states, wish rendering, and desktop phone-canvas presentation.
- Accessibility checks should confirm that form labels, buttons, modal dismissal, focus behavior, readable contrast, and non-audio fallbacks remain usable.
- The project checks should include the focused Pest tests, TypeScript checks, and the existing application test suite after implementation.

## Out of Scope

- Video-message upload, camera capture, or video moderation.
- Guest-specific invitation links, guest-list import, access codes, or preloaded guest records.
- A reusable multi-invitation product or invitation management dashboard.
- A full CMS for editing invitation copy, assets, events, gifts, or theme settings.
- Guest authentication for viewing or submitting RSVP and wishes.
- CAPTCHA integration.
- Rewriting or translating the current mixed English/Indonesian copy.
- Replacing the supplied design assets with a new art direction.
- Changing the existing Laravel authentication/settings product outside the moderation capability required for wishes.
- Sending email, SMS, WhatsApp, or push notifications after RSVP submission.
- Analytics, guest tracking, or marketing integrations.

## Further Notes

- The supplied fonts, photographs, audio, and gift-account information must be authorized for publication before deployment.
- The original reference uses a separate PHP RSVP endpoint and several external browser libraries. The Laravel version should reproduce the guest-visible behavior without carrying those implementation dependencies forward.
- A later ticket-decomposition pass should split this specification into vertical slices under `.scratch/latif-aci-invitation/issues/`, with foundational configuration and the first end-to-end public invitation slice blocking later RSVP, wishes, and moderation slices.
