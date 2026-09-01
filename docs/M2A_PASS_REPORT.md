# M2A — Sacred Geometry Shader Lab

## Objective

Replace the palette-variant fallback realms with a reusable sacred-geometry rendering language and ten distinct procedural grammars, while keeping the experience viable on Fold-class mobile hardware and preserving the topology / attribution / interpretation separation.

## Files added

- `src/shaders/modules/sacredGeometry.js`
- `src/shaders/modules/palette.js`
- `src/shaders/modules/realmKernels.js`
- `docs/M2A_PASS_REPORT.md`

## Files materially changed

- `src/shaders/fractalRealm.js`
- `src/components/FractalRealm.jsx`
- `src/components/SephirahInfoPanel.jsx`
- `src/data/realmProfiles.js`
- `src/data/visualGrammar.js`
- `src/App.jsx`
- `scripts/verify-tree.mjs`
- `package.json`
- `README.md`

## Rendering architecture

The fragment shader is now assembled from reusable GLSL source modules. The shared raymarcher handles bounded logarithmic descent, deterministic domain rebasing, normal estimation, cheap in-ray glow accumulation, fog and background response. Realm kernels are independent mathematical fields dispatched by a complete 1..10 shader-kind set.

## Geometry library

The shader library contains actual line-based pentagram and hexagram prisms rather than merely color-coded star textures, plus tesseract-like frame projections, box frames, octahedra, radial wave rings, helix tubes, toroidal forms, rounded boxes and repeat-cell helpers.

`tesseract-like` is deliberately qualified: the implemented form is a 3D visual metaphor built from nested rotated frame projections, not a claim of a mathematically exact 4D perspective projection.

## Performance design

- fixed compile-time maximum of 96 raymarch iterations
- runtime step budget scales from roughly 58 to 94
- coarse-pointer devices default to quality 0.72
- glow is accumulated during the existing raymarch instead of adding a heavyweight bloom/volumetric stack
- no raster textures introduced
- deterministic source rule remains enforced

## Correctness fix

M1 could stop immediately when the eye began inside a signed-distance solid because `d < epsilon` also catches all negative distances. M2A tests `abs(d) < epsilon` and advances by `abs(d)`, allowing the ray to find the true boundary. This specifically addresses the giant surface/horizon failure mode observed during physical Kether QA.

## Verification completed in the artifact environment

```text
Tree topology: 10 / 10 Sephiroth
Tree topology: 22 / 22 paths
Graph connectivity: PASS
Realm profiles: 10 / 10
Hermetic attribution records: 10 / 10
Sacred-geometry shader grammars: 10 / 10 distinct
Motif library: pentagram / hexagram / tesseract-like / wave / helix / lattice PASS
Neon shader-space glow system: PASS
Deterministic source audit: PASS
```

Shader modules also import successfully under Node and their JavaScript source passes `node --check`.

## Verification not claimed

`npm install` timed out in the artifact environment before dependencies could be fetched, so a Vite production build and real WebGL shader compilation are **not claimed** here. The Fold/Termux environment that already ran M1 should run `npm run check`; any GLSL compiler error from the physical device is release-blocking and should be fixed before visual evaluation.

## Physical acceptance targets

M2A passes visual acceptance only if the user can immediately distinguish at least:

- Geburah by pentagram/blade geometry
- Tiphareth by hexagram/solar geometry
- Hod by crystalline frame lattice
- Malkuth by crystal/strata structure
- Kether by sparse frame-crown geometry

If these read primarily as recolored versions of one field, M2A fails even if tests are green.
