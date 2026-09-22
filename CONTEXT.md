# Wedding Invitation

This context describes the managed wedding invitation and the people and
content states around it.

## Invitation

**Invitation**:
A guest-facing wedding experience containing the couple's identity, schedule,
media, story, and attendance information.
_Avoid_: Website, landing page, campaign

**Invitation content**:
The editable guest-facing information that belongs to an invitation, including
copy, event details, links, media references, gifts, and story entries.
_Avoid_: Theme, layout, configuration

**Invitation aggregate**:
The complete managed content of one invitation, including its couple, events,
media references, gifts, and story sections.
_Avoid_: Page, form, config file

**Guest**:
A person who views the public invitation or submits an RSVP.
_Avoid_: User, admin

**Invitation recipient**:
A person, household, or group represented by one personalized invitation link
and one display name on the invitation cover.
_Avoid_: Guest record, RSVP participant

**Recipient link**:
An opaque shareable URL that resolves one invitation recipient to the published
invitation.
_Avoid_: Guest URL, name slug

**Archived recipient**:
An invitation recipient retained for recordkeeping whose personalized link no
longer displays the recipient name.
_Avoid_: Deleted guest, inactive user

**Admin**:
An authenticated person authorized to manage invitation content or moderation.
_Avoid_: Guest, ordinary user

## Content lifecycle

**Draft**:
Invitation content that is saved for further editing and is not yet the public
version.
_Avoid_: Unpublished website, temporary data

**Preview**:
A private rendering of draft invitation content used for review before it is
made public.
_Avoid_: Staging site, test page

**Published version**:
The invitation content currently visible to guests.
_Avoid_: Live draft, current config

**Atomic publish**:
The act of making one complete valid invitation version public at once, so
guests never see a mixture of draft and previously published sections.
_Avoid_: Partial publish, section publish

## Assets and participation

**Media asset**:
A publishable image, audio file, or decorative resource referenced by
invitation content.
_Avoid_: File, upload

**Media library**:
The managed collection of media assets available for invitation content.
_Avoid_: Public folder, attachment list

**Moderated wish**:
A guest message from a direct wish submission or an RSVP that is reviewed
before it can appear publicly in the invitation. A published wish exposes its
author and message, but not its source or RSVP context.
_Avoid_: Comment, review

**RSVP**:
A guest's participation record containing their name, attendance choice,
optional guest count, and optional invitation-recipient provenance.
_Avoid_: Wish, invitation recipient

**Hope and prayer**:
The optional RSVP prompt where a guest writes a congratulations, blessing,
hope, prayer, or other message for the couple. A non-blank response becomes a
pending moderated wish.
_Avoid_: RSVP status, private note

**Wish source**:
The submission context for a wish: either a direct wish submission or a source
RSVP. Source context is available to moderators but is not shown publicly.
_Avoid_: Wish author, recipient identity
