---
category: feature
state: ready-for-qa
status: ready-for-qa
triage: ready-for-agent
---

# 10: Media Library and Referenced Asset Management

**What to build:** Give admins a managed media library for invitation images,
audio, and ornaments, with safe reuse and deletion rules that prevent a draft
or published invitation from losing a referenced asset.

**Blocked by:** 07: Invitation Aggregate and Config Migration; 08: Admin Authorization and Dashboard Shell

**Status:** ready-for-qa

- [x] Upload supported image, audio, and decorative media through the admin
      dashboard.
- [x] List available media with enough metadata to select the correct asset.
- [x] Reuse one media asset across multiple invitation content fields.
- [x] Select managed assets from general, couple, opening, gallery, story, and
      audio forms.
- [x] Archive unused assets without breaking existing content.
- [x] Prevent hard deletion while an asset is referenced by draft or published
      content.
- [x] Allow permanent deletion only after reference checks confirm the asset is
      unused.
- [x] Validate file type, size, storage failure, and authorization at the server
      boundary.
