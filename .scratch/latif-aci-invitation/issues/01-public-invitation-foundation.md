---
category: enhancement
state: done
status: done
---

# 01: Public Invitation Foundation

**What to build:** Replace the starter public welcome experience with the foundation of the `latif-aci` invitation. A guest can open `/`, see the invitation loading state and cover, activate the cover, and reach the initial invitation shell using locally served assets and configuration-based content.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] The public root route renders the invitation through the existing Laravel + Inertia React application.
- [x] The invitation has a stable `latif-aci` identity in its configuration and public page data.
- [x] Supplied image, font, and audio assets are available from local public URLs rather than the reference site's relative paths.
- [x] The loading state does not leave the guest stuck if an optional asset fails to load.
- [x] The cover preserves the narrow invitation canvas and reveals the invitation through an explicit guest interaction.
- [x] Desktop shows the invitation canvas centered inside a dark outer backdrop; narrow screens use the available viewport width without horizontal overflow.
- [x] A Laravel feature test verifies that the public invitation route is reachable and returns the expected Inertia page.
