# Architecture Notes — M4

## 1. The project has four independent path authorities

The application must not encode one historical/reception system into the graph itself.

1. **Topology** — the chosen ten-node / twenty-two-edge Hermetic-Kircher-style spatial graph.
2. **Attribution systems** — documentary claims such as divine names, angelic orders, letters, Tarot or astrology, with provenance.
3. **Visual / interaction grammar** — our mathematical interpretation: SDFs, tesseract-like frames, pentagrams, hexagrams, path morphs, motion laws and palettes.
4. **Operative capability** — the deliberately small registry of paths that have implemented reversible metamorphoses.

The visual presentation layer and `PATH_OPERATORS` are independent. A working Yesod→Malkuth metamorphosis does not constitute a historical attribution claim about that edge, and a documentary attribution does not imply operative traversal.


## M4 study / ritual layer

M4 also introduces a separate application concern without collapsing it into the path authorities: **presentation mode**. Presentation mode decides how much of the existing information is surfaced; it does not rewrite topology, documentary claims, visual grammar, or operative capability.

- **Pure Vision** — direct Sephirah entry and minimal interface.
- **Study** — full folios, Core/777 documentary selector, source ledger, optional active dossier.
- **Contemplation** — compact threshold selection plus brief original stage cues.

The same realm/path state machine runs underneath all three modes. Switching modes never reseeds, mutates topology, or changes a historical attribution.

### Documentary provenance

`data/sources.js` owns source metadata. Historical records contain `provenance` references with supported fields and locators. UI resolves those references through `SourceLedger`; shaders never import the registry.

`attributions/hermeticPaths777.js` now provides documentary records for the two operative edges. `pathOperators.js` remains the interpretive transformation registry. The two modules are intentionally not merged.

### Ritual content

`ritualContent.js` contains original contemplative language only. It is explicitly non-quotational and independent from the historical attribution modules. Ten realm thresholds, forty depth-stage phrases and two reversible path rites are currently defined.

## 2. “Infinite zoom” is state + shader, not literal coordinate infinity

The raymarcher works with finite floating-point values and bounded iteration counts. Conceptual descent is therefore stored logarithmically and repeatedly mapped back into a safe local domain.

A realm currently exposes:

- `uLogZoom`
- `uDepthStage` (0..3)
- `uDepthPhase` (0..1 inside a stage)
- `uDepthEpoch` (number of complete rites)

The cycle can continue indefinitely in interaction while the active numerical domain remains bounded.

## 3. Scene responsibilities

- **Tree scene** — finite macro geometry, Sephirah focus, operative path focus.
- **CameraDirector** — non-XR cinematic entry/return only.
- **FractalRealm** — one Sephirah's recursive structural + glyph fields.
- **PathMetamorphosis** — continuous transformation operator between two realm grammars.
- **RendererGuard** — context-loss recovery boundary.
- **Realm registry** — per-Sephirah mathematical/interaction profile.
- **Path operator registry** — reversible interpretive transform laws.
- **Attribution registry** — documentary claims only; never scene topology.

## 4. Raymarch envelope

The fragment shader is the expensive renderer. Its containing geometry should be nearly free.

M3B replaces the high-detail world-centered icosphere with a **camera-locked box shell**. The box moves to the display camera's world position every frame. Back-face rendering fills the view while the shader computes the real scene mathematically.

Benefits:

- node/world position no longer distorts realm ray directions;
- far fewer rasterized triangles;
- Kether and side-pillar Sephiroth begin from the same display-space condition;
- the mathematical origin can remain canonical;
- the same mechanism still respects XR head orientation because the shader ray direction is derived from the rendered camera.

## 5. Realm field model

Every realm provides at least two distance fields:

- **structural SDF** — surfaces the ray can hit;
- **glyph SDF** — thin canonical sacred geometry used for emissive accumulation even when another surface occludes it.

This is why a pentagram, hexagram or lunar ring can remain legible through a deeper architecture rather than needing to be the nearest solid object.

The generated M4.16 raymarch evaluates structural distance at each active step and samples glyph distance at a compensated alternating cadence. Normal probes call the structural field only. The loop then applies realm-specific surface response and filmic compression.

## 6. Path field model

The macro Tree's 22 visible paths use one `LivingPathField`: two instanced draws, shared geometry/materials, one frame clock, and deterministic per-edge attributes. `PathSegment` owns only relevant hit targets and spatial documentary inscriptions. `pathVisualGrammar.js` supplies elemental, planetary, and zodiacal presentation laws; those laws are original interpretive mathematics rather than sourced occult doctrine.

The operative path renderer remains distinct:

M3B path shaders are not screenshot crossfades and do not evaluate two full realm shaders simultaneously.

Each path has a **dedicated reduced mathematical operator** containing representative source and destination laws. Progress continuously modifies:

- symmetry count;
- SDF motif;
- coordinate displacement;
- repetition/cell law;
- structural hardness;
- source/destination color basis.

This keeps the path legible and much cheaper than executing two complete realm raymarch fields per step.

`uReverse` inverts the canonical mathematical progress so the same shader supports both traversal directions while UI/color progress still runs naturally from 0→1.

## 7. Performance / resilience strategy

### Device baseline

Coarse-pointer devices currently use:

- DPR ceiling: `1.35`
- MSAA: disabled
- lower default `uQuality`

Desktop retains the higher profile.

### Adaptive quality

Realm/path components watch frame delta. Sustained slow frames reduce only the shader quality budget, with a floor. Stable frames slowly recover toward the device/realm baseline.

Adaptive quality must not:

- change topology;
- skip ritual stages;
- alter deterministic seed/state;
- silently change attribution content.

### Kether

Kether receives an additional conservative mobile budget because its nested frame estimator is one of the heaviest current kernels.

### Context loss

Mobile Chromium may kill or reset a WebGL context after a GPU watchdog event. `RendererGuard` treats the actual `webglcontextlost/restored` events as recovery signals. The unified lifecycle can reseat the Canvas while preserving the active rite; wall-clock first-light or entry timers never have remount authority.

## 8. XR locomotion invariant

Desktop/mobile may animate the Three camera for macro Tree entry/return.

Immersive XR must not programmatically drive the tracked headset camera. Current XR transitions therefore remain timed handoffs. A later XR pass should use `XROrigin`, world transformation, portals, fades or scale choreography while preserving authoritative head tracking.

## 9. Interaction state machines

### Sephirah

`tree → entering → fractal → returning → tree`

### Path

`tree → entering → path → fractal(destination)`

or, when aborted:

`tree → entering → path → returning → tree`

State boundaries are explicit so a path cannot accidentally inherit a previous realm's descent uniforms.

## 10. Scaling beyond M3B

Do not implement all twenty-two path shaders simply because the first two work.

Before scaling:

1. physically verify Kether never kills the Fold renderer;
2. verify both path operators in both directions;
3. measure visual legibility at 0%, ~50%, and 100%;
4. confirm destination handoff and abort behavior;
5. profile the Fold and later Quest.

Only then should additional paths be promoted from topology into operative visual transformations.
