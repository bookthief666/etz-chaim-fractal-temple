# M4.8 — Oracular Interface + Realm Continuity

## Intent

Continue the accepted Living Grimoire family direction without regression. The pass addresses three physical Fold findings:

1. the M4.7 study folio could no longer scroll because a late CSS engraving override reset `overflow` to `hidden`;
2. the boxed folio/menu grammar remained too conventional relative to the Monas Hieroglyphica family language;
3. a fractal could run briefly, lose WebGL context under mobile GPU pressure, and be recovered by ejecting the user to the Tree.

## Interaction correction

The old Sephirah study panel is removed from the Tree selection path. Selection now uses a borderless oracular manuscript margin with four registers: Essence, Geometry, Paths, and Documentary/Sources. The reading leaf alone is scrollable (`touch-action: pan-y`, `overscroll-behavior: contain`, momentum scrolling), while the ingress sigil remains outside the scrolling region and therefore always reachable.

## Living selection response

When a Sephirah is focused:

- other Sephiroth recede rather than competing for attention;
- the focused sphere grows an animated multi-axis invocation corona;
- connected paths remain legible;
- the DOM reading margin inherits the active Sephirah palette;
- entry is performed through a rotating circular threshold sigil.

## No-box family grammar

The following conventional boxes are removed from the primary interaction language:

- Tree Sephirah folio;
- path-selection dossier;
- contemplation threshold card;
- top segmented-mode containers;
- status/action button chrome.

Active study content remains available as a scholar's margin rather than a card. Source records are reduced to typographic/marginal annotations rather than nested boxes.

## Ingress choreography

CameraDirector now uses a deterministic bounded curved approach in non-XR screen mode. The transition gate adds radial law-lines, ritual stage words and the selected Hebrew name. XR camera authority remains untouched.

## Renderer continuity

Fractal and path raymarchers now use a gentle ignition profile: initial mobile raymarch quality begins conservatively and rises toward the accepted realm profile over ~2.2 seconds. This prevents the first frames of a newly mounted high-complexity realm from immediately consuming the full GPU budget.

A WebGL context loss while inside an active realm/path now:

- preserves selected/path journey state;
- remounts the renderer;
- resumes `fractal` or `path` in place;
- does not synthesize Ascensus;
- keeps M4.7 deliberate return protections intact.

## Preserved invariants

- 10 distinct Sephirah shader grammars
- four-stage recursive depth rites
- 2 reversible path metamorphoses
- Vision / Study / Contemplation
- Core / 777 documentary separation
- source provenance
- Kether numerical guards
- adaptive Fold quality
- camera-locked ray boxes
- M4.5 threshold and atmosphere
- M4.6 shader prewarm / entry watchdog
- M4.7 return arming / deliberate pointer intent
- deterministic source rules
- XR tracked-camera invariant

## Verification

`npm test`: PASS.

Global TypeScript parser pass over all JS/JSX source files: zero syntax errors.

Local import audit: 73 imports, zero missing.

Production Vite build remains a physical/Termux verification because this artifact environment does not contain the project dependency tree.
