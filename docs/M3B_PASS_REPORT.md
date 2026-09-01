# M3B — Kether Stabilization + Path Metamorphosis

## Why this pass changed scope

M3A physical QA confirmed that recursive geometry was working, especially in Tiphareth, but exposed a serious Kether failure mode: after entering Kether the browser could stall and the returned Tree could become a white/dead view. M3B therefore treats renderer resilience as a release blocker before scaling path traversal.

The pass then implements the previously planned M3B path operators as actual traversable mathematical worlds.

## Root-cause-oriented Kether changes

No single unverified cause is asserted. Instead, M3B removes several independent risk factors visible in the M3A architecture:

1. The raymarch envelope was world-centered rather than camera-centered.
2. Kether's nested tesseract-like estimator had no realm-specific mobile budget.
3. invalid SDF/normal arithmetic had no explicit fallback.
4. the full-screen procedural pass was paying unnecessary high-detail shell tessellation and mobile MSAA/DPR cost.
5. a WebGL context loss had no app-level recovery path.

### Camera-locked ray box

`FractalRealm.jsx` and `PathMetamorphosis.jsx` now move a low-overhead box envelope to the display camera's world position each frame. The mathematical ray origin remains canonical (`0,0,2.72`), but screen rays no longer depend on the macro Tree's world origin.

### Kether budget

- mobile quality: `0.56`
- desktop quality: `0.88`
- Kether-specific raymarch budget: `mix(40, 66, uQuality)`
- third recursive frame omitted below quality `0.68`
- deep crown cell guarded by quality
- lower filmic exposure
- slightly reduced glow/motion pressure

### Numerical guards

`safeDistance()` catches out-of-range and NaN-like SDF results using GLSL-1-compatible comparisons. Normal construction falls back to a stable forward normal when its gradient becomes invalid or degenerate. Ray travel also exits safely if it stops being finite/reasonable.

### Adaptive Fold quality

Frame deltas above roughly 34 ms progressively reduce the local `uQuality`; stable pacing slowly restores the realm/path baseline. This does not change ritual stage, topology, or deterministic state.

The coarse-pointer Canvas profile caps DPR at 1.35 and disables MSAA.

### Context recovery

`RendererGuard.jsx` handles `webglcontextlost` / `webglcontextrestored`. On loss, App resets safely to the Tree and remounts the R3F Canvas using `rendererNonce`. The last meaningful focus is preserved where possible.

## Traversable path architecture

### Tree selection

Supported operative paths now have a larger invisible hit cylinder on touch devices, direction-aware moving motes, and a stronger selected state. They only become interactive when the currently studied Sephirah is one of their endpoints.

`SephirahInfoPanel` also exposes any currently implemented operative path, improving discoverability without labeling all 22 edges as complete.

### Path folio

`PathInfoPanel.jsx` shows:

- directed source → destination;
- operator label;
- visual transform law;
- mathematical transform law;
- palette law;
- four-stage traversal rite;
- explicit disclaimer that this is an interpretive instrument layer, not a historical path attribution.

### Path state machine

The App state machine now supports:

`tree → entering → path → destination fractal`

as well as:

`path → returning → tree`

The existing realm flow remains:

`tree → entering → fractal → returning → tree`

Path completion hands directly into the destination Sephirah with a fresh realm navigation state.

## Path shader 1 — Geburah ↔ Tiphareth

A dedicated lightweight path shader interpolates mathematical law rather than cross-fading screenshots.

The canonical operator changes:

- pentagram SDF → hexagram SDF;
- fivefold wave symmetry → sixfold symmetry;
- cutting plane → solar halo / center;
- satellite fivefold court → sixfold court;
- scarlet/ember → gold/white.

Reverse traversal uses the same continuous field with canonical progress inverted.

## Path shader 2 — Yesod ↔ Malkuth

The second operator changes:

- ninefold phase field → fourfold organization;
- lunar torus + moon beads → octahedral crystal + box frame;
- phase displacement → straighter material coordinates;
- fluid reflection palette → fourfold material palette family.

The intermediate bridge continuously varies the angular repetition count instead of performing a hard scene cut.

## Interaction

Path progress advances autonomously very slowly but is primarily direct-manipulation driven:

- drag down: advance;
- drag up: rewind;
- interaction excites the shader field;
- four named path stages are surfaced in the HUD;
- arrival holds briefly before destination handoff so the final state is perceivable.

## Static verification performed

- `npm run test`: PASS
- `tsc` JSX parse over `App.jsx` and all component JSX: PASS
- `node --check` on ordinary JS shader/data modules: PASS
- assembled realm fragment shader: ~40 KB, balanced braces, `main()` present
- assembled path fragment shader: ~15 KB, balanced braces, `main()` present
- deterministic no-`Math.random()` audit: PASS

## Verification boundary

`npm run build` cannot complete in the artifact environment because its copied project does not contain `node_modules` and `vite` is therefore unavailable. No claim is made about production build or Samsung GPU GLSL compilation until Termux runs those checks.
