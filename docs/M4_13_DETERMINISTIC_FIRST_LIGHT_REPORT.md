# M4.13 — Deterministic First Light

## Trigger

Fold physical QA on M4.12 showed the DOM/SVG first-light layer still visible together with the message `The Tree renderer was reseated before first light.` The renderer had been remounted by a 4.2-second wall-clock watchdog before first light was actually established. That recovery mechanism could restart legitimate mobile GPU work and extend the blank/loading state it was intended to cure.

## Fix

- Removed the wall-clock automatic Tree renderer remount.
- Preserved `webglcontextlost` / restoration as the only automatic renderer-recovery path.
- Reduced Tree readiness to two real R3F frames followed by one browser RAF, so readiness is tied to rendering rather than elapsed time.
- During first light the Canvas uses DPR 1 and renders only the canonical Tree core.
- Deferred ProceduralStars, TreeInstrumentField, sphere orbital ornamentation, numerical crowns, extra path motes, documentary HTML and OrbitControls until 180 ms after real first light.
- Kept the DOM/SVG Living Tree continuity layer visible until that real frame signal arrives.
- Replaced hidden automatic retry with a deliberate Living Tree reseat sigil only after a nine-second delay.
- Preserved all M4.12 motion-safe descent and 22-path documentary lens behavior.

## Non-regression invariants

The shared realm shader, dedicated Malkuth shader, path metamorphosis shader, realm kernels and `useFractalNavigation` are byte-for-byte unchanged from M4.12. No sacred geometry, recursive stage, shader motif, path operator or navigation governor was simplified.
