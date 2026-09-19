---
category: enhancement
state: ready-for-agent
status: ready-for-agent
---

# 01: Public Invitation Foundation

**What to build:** Replace the starter public welcome experience with the foundation of the `latif-aci` invitation. A guest can open `/`, see the invitation loading state and cover, activate the cover, and reach the initial invitation shell using locally served assets and configuration-based content.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The public root route renders the invitation through the existing Laravel + Inertia React application.
- [ ] The invitation has a stable `latif-aci` identity in its configuration and public page data.
- [ ] Supplied image, font, and audio assets are available from local public URLs rather than the reference site's relative paths.
- [ ] The loading state does not leave the guest stuck if an optional asset fails to load.
- [ ] The cover preserves the narrow invitation canvas and reveals the invitation through an explicit guest interaction.
- [ ] Desktop shows the invitation canvas centered inside a dark outer backdrop; narrow screens use the available viewport width without horizontal overflow.
- [ ] A Laravel feature test verifies that the public invitation route is reachable and returns the expected Inertia page.
