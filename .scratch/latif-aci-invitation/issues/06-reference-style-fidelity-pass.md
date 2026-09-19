---
category: enhancement
state: ready-for-qa
status: ready-for-qa
triage: ready-for-agent
---

# 06: Recreate Reference Invitation Style

## Problem Statement

The current Latif & Aci invitation has the required guest-facing behavior, but
its visual composition still needs to match the supplied `inv.moromoroit.com`
reference more closely. The owner wants the same style language, spacing rhythm,
padding, margins, colors, local fonts, decorative treatment, and responsive
composition without changing the existing invitation behavior or content.

The approved reference is a local chronological set of eight mobile screenshots,
starting with the cover and ending with the love-story/closing section.

## Solution

Refine the invitation's visual system and section layout against the screenshot
reference. Preserve the current Latif & Aci configuration, RSVP and wishes data
contracts, gallery behavior, gifts, music, moderation, and accessibility
fallbacks.

The result should feel like the same hand-drawn wedding invitation: warm cream
canvas, terracotta ink, custom handwritten typography, generous vertical spacing,
thin illustrated frames, framed cards, rounded terracotta actions, and oversized
decorative art. Mobile remains the primary composition; larger screens retain the
existing centered 440px invitation canvas.

## User Stories

1. As an invited guest, I want the invitation background to match the reference's warm cream tone, so that the experience feels visually authentic.
2. As an invited guest, I want the primary ink and controls to use the reference's terracotta tone, so that the page has a consistent visual identity.
3. As an invited guest, I want the existing local handwritten fonts used in the appropriate hierarchy, so that headings, script accents, and body copy feel like the reference.
4. As an invited guest, I want the cover to preserve the reference's framed, illustrated save-the-date composition, so that the first screen sets the expected mood.
5. As an invited guest, I want the couple section to use the reference's large decorative typography and illustrated photo treatment, so that the couple information is easy to recognize.
6. As an invited guest, I want the event section to use framed cards, bows, thin borders, and generous spacing, so that ceremony and reception details remain readable and decorative.
7. As an invited guest, I want the countdown section to use the reference's clipped-photo/card visual language, so that the countdown feels integrated with the invitation.
8. As an invited guest, I want the RSVP section to have open spacing, thin terracotta field borders, handwritten labels, and rounded buttons, so that the form feels like part of the design rather than a generic form.
9. As an invited guest, I want RSVP validation, success, and error feedback to remain available after the styling changes, so that visual fidelity does not reduce usability.
10. As an invited guest, I want wishes to appear inside the reference-style framed presentation, so that public messages remain readable and visually integrated.
11. As an invited guest, I want gift accounts to use the reference's nested framed-card treatment and copy buttons, so that optional gifting remains clear and convenient.
12. As an invited guest, I want the gallery to use the reference's film-strip composition where local assets support it, so that the photo section preserves the intended character.
13. As an invited guest, I want gallery images to remain openable and dismissible in the existing viewer, so that styling changes do not disrupt photo browsing.
14. As an invited guest, I want the love-story section to use alternating illustration and text compositions, so that the chronological story remains engaging to read.
15. As an invited guest, I want the reference motifs—wavy frames, bows, vinyl records, hearts, birds, rings, and floral line art—to appear in the corresponding sections, so that the invitation does not feel generic.
16. As an invited guest, I want unavailable decorative motifs to be approximated without breaking layout, so that missing assets do not block the visual pass.
17. As an invited guest, I want the invitation to fill the available mobile width, so that the reference composition remains legible on phones.
18. As an invited guest, I want the invitation to retain a centered 440px maximum canvas on larger screens, so that desktop still presents a phone-like invitation.
19. As an invited guest, I want decorative art to overlap section boundaries without causing horizontal scrolling, so that the page remains comfortable to navigate.
20. As an invited guest, I want the invitation to preserve its current reveal, music, countdown, gallery, copy, RSVP, and wishes interactions, so that the style pass does not alter the guest journey.
21. As an invitation owner, I want the current Latif & Aci copy and configuration preserved, so that a style recreation does not accidentally replace the invitation's identity.
22. As an invitation owner, I want the visual rules documented as a stable reference, so that future changes can be evaluated against the same source.
23. As a maintainer, I want the visual work to stay within the existing frontend stack and local asset pipeline, so that the invitation does not acquire unnecessary dependencies.
24. As a maintainer, I want automated checks to continue passing after the CSS changes, so that visual refinement does not regress application behavior.

## Implementation Decisions

- Modify the existing invitation presentation layer and its shared visual tokens;
  do not create a second invitation implementation.
- Treat the eight local screenshots as the source of truth for mobile section
  order, spacing rhythm, proportions, typography hierarchy, and ornament placement.
- Preserve the current Latif & Aci content, configuration model, public routes,
  RSVP contract, wishes contract, gift data, gallery behavior, music behavior, and
  moderation behavior.
- Keep the invitation mobile-first and full-width on narrow screens. Retain the
  existing 440px maximum canvas and centered desktop presentation.
- Use existing local fonts and assets before introducing any new asset. Missing
  ornaments may be represented with CSS approximation when that preserves the
  visual relationship without adding a new asset workflow.
- Prioritize visual changes in this order: canvas colors and section rhythm;
  typography pairing and scale; margins, padding, borders, and controls; asset
  placement and overlap; then animation polish.
- Preserve semantic controls, visible focus states, readable contrast, reduced
  motion behavior, native gallery dismissal, and audio failure fallbacks.
- Do not change server-side schemas, public data shapes, moderation rules, or
  invitation business logic for this visual pass.
- Do not add a frontend dependency unless existing CSS, React, and browser APIs
  cannot provide the required presentation behavior.

## Testing Decisions

- Use one primary external-behavior seam: browser/manual visual QA of the public
  invitation at mobile, tablet, and desktop widths. Compare the eight sections in
  chronological screenshot order rather than asserting CSS implementation details.
- Visual QA should check cream/terracotta colors, font hierarchy, section rhythm,
  padding, margins, card geometry, decorative overlap, gallery composition, and
  horizontal overflow.
- The same browser pass should verify that cover reveal, music toggle, countdown,
  RSVP submission states, wishes rendering, gift copy buttons, and gallery modal
  behavior remain usable after styling changes.
- Keep the existing Laravel HTTP feature tests as the regression seam for public
  invitation data, RSVP, wishes, moderation, validation, throttling, and safe
  output. Do not replace them with CSS or React implementation assertions.
- Run the existing TypeScript, formatting, focused feature tests, full Laravel
  suite, and production build checks after implementation.
- Accessibility QA should verify labels, focus indicators, modal dismissal,
  readable contrast, keyboard operation, and non-audio usability.

## Out of Scope

- Replacing Latif & Aci copy, names, dates, or configured event data with content
  from the screenshot reference.
- Changing RSVP, wishes, moderation, gifts, gallery, music, countdown, or reveal
  behavior.
- Adding guest authentication, a CMS, invitation-specific access codes, analytics,
  notifications, or a new invitation product architecture.
- Creating a new image-generation or illustration pipeline.
- Replacing supplied local fonts, photos, audio, or decorative assets without a
  separate content/asset decision.
- Designing a new desktop layout outside the existing phone-canvas rule.

## Further Notes

- The screenshot captures are 1179x2556 mobile images and are ordered from the
  first cover section to the final love-story/credit section.
- The screenshot reference is a visual source only; the current application
  remains the authority for Latif & Aci content and guest-facing behavior.
- The visual reference addendum records the accepted decisions and QA priority.
- Automated checks are complete. Browser/device visual QA remains outstanding
  because no usable browser tab is available in the current environment.
- Publication authorization for supplied photos, fonts, audio, and gift details
  remains a release concern covered by the existing hardening ticket.
