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
A guest message that is reviewed before it can appear publicly in the
invitation.
_Avoid_: Comment, review
