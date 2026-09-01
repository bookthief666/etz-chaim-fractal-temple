# M4.7 — Realm Ingress Integrity + Living-Grimoire Refinement

## Physical regression reproduced from Fold QA

The M4.6 screenshots show Malkuth correctly selected, followed immediately by the `ASCENSUS · RETURN` gate. That state can only be reached through the explicit return action; a WebGL-context fault restores the Tree directly and would also emit the renderer recovery message.

The accepted UI placed two return affordances live immediately when `fractal`/`path` mounted: the DOM `Ascend to Tree` action and a large invisible world-space hit sphere. On Android, late/synthesized touch delivery or a short central navigation gesture can therefore be misread as a return request after ingress.

## Fix

- Added a 1.15s post-ingress return interlock in the application state machine.
- Both HUD and world-space return controls remain visible; neither is removed or simplified.
- HUD action visibly settles, then arms.
- World talisman now requires a fresh pointer-down/pointer-up cycle after arming.
- Drag movement is rejected as a return gesture.
- Long/stale pointer cycles are rejected.
- Large invisible hit volume is retained for Fold/XR usability.
- Talisman is moved into a peripheral camera-relative position so the primary vertical-drag lane stays clear.
- The underlying realm/path shaders, recursive geometry, M4.5 family UI, M4.6 transition gate, Kether safeguards and M3B path systems are unchanged.

## UI continuation

- Added restrained illuminated-corner engraving to folios/dossiers.
- Added return-control settling/arming feedback in the established Cinzel/grimoire visual language.
- Reduced-motion behavior remains honored.

## Acceptance target

Malkuth, Kether, Tiphareth, Yesod and Geburah must all survive repeated entry, immediate post-entry vertical drag, return, and re-entry without spontaneous `ASCENSUS`.
