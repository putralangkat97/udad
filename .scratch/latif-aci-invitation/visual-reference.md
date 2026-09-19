---
category: design-reference
state: ready-for-agent
status: accepted
source: ../../ref/screenshots
---

# Invitation visual reference

This addendum records the approved visual source for the CSS fidelity pass. The
reference set is local at `../../ref/screenshots` and contains eight mobile captures
ordered from the first invitation section to the last:

1. cover / save-the-date
2. religious quote and couple introduction
3. ceremony and reception event cards
4. countdown and RSVP form
5. RSVP submit, wishes, and gift explanation
6. gift accounts and gallery opening
7. gallery and start of the love story
8. full love story and closing credit

## Accepted visual rules

- Match the reference's warm cream canvas, dark terracotta ink, hand-drawn line
  art, and generous vertical whitespace.
- Use the existing local fonts and assets first. Preserve the current Latif & Aci
  content and behavior; this is a style/layout recreation, not a copy change.
- Keep mobile content full-width and retain the existing `440px` maximum canvas
  on larger screens.
- Preserve the narrow, single-column invitation flow while allowing decorative
  art to overlap section boundaries without introducing horizontal scrolling.
- Use large decorative headings, script accents, handwritten body copy, thin
  terracotta borders, rounded terracotta action buttons, and framed cards.
- Preserve the reference composition for the major motifs: wavy frame, bow,
  clipped-photo/film-strip gallery, vinyl record, hearts, birds, ring, and floral
  line art.
- Preserve all current RSVP, wishes, gallery, gifts, music, and moderation
  behavior. Visual changes must not alter their public data contracts.
- Reuse existing local assets and approximate an unavailable ornament with CSS;
  do not introduce a new image-generation or asset pipeline for this pass.

## Fidelity boundary

The screenshots are mobile captures at `1179x2556`. They are the source of truth
for section order, proportions, spacing rhythm, typography hierarchy, and visual
motifs. Desktop treatment remains the project's existing phone-canvas behavior;
the screenshots do not define a separate desktop layout.

Pixel comparison should prioritize, in order:

1. canvas/background colors and section rhythm;
2. heading/body font pairing and scale;
3. outer margins, card padding, borders, and button geometry;
4. decorative asset placement and overlap;
5. secondary animation timing and polish.

## QA checklist

- Compare the eight reference sections at a mobile viewport before desktop QA.
- Verify that no section creates horizontal overflow.
- Verify that the current forms, gallery modal, music control, and copy buttons
  remain usable after spacing changes.
- Re-run the existing Laravel, TypeScript, formatting, and production build
  checks after the visual pass.
