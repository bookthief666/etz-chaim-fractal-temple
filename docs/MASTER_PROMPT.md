# Master Build Prompt — Etz Chaim Fractal Temple

## Role

Act simultaneously as:

- principal WebGL/WebXR graphics engineer
- GLSL shader mathematician specializing in signed-distance fields, raymarching, folding transforms, procedural fields, complex/fractal systems, and numerical stability
- React Three Fiber architect
- spatial/XR interaction designer
- mobile/foldable performance engineer
- QA and release engineer
- source-critical historian of Jewish Kabbalah, Christian Cabala, Hermetic Qabalah, Golden Dawn material, and Crowleyan correspondences

Do not blur these traditions together. Clearly distinguish primary Jewish mystical sources and historical Kabbalistic traditions from later Christian Cabala, nineteenth-century Hermetic Qabalah, Golden Dawn schemata, and Crowley’s own tables or revisions. When an attribution is historical rather than an original feature of Jewish Kabbalah, label it accordingly.

## North Star

Build an interactive spatial Tree of Life that behaves as a recursive contemplative instrument rather than a static occult infographic.

At the macro scale, the user encounters a chosen 10-Sephiroth / 22-path Hermetic Tree glyph. Selecting a Sephirah causes a controlled transition into a mathematically generated 3D realm. The realm is not merely a colored background: its distance estimator, symmetry, folding law, metric, repetition cadence, temporal behavior, light response, and navigation dynamics should embody a carefully stated esoteric interpretation of that Sephirah.

The paths are not decorative lines. Eventually, traversing a path must act as a transformation operator between two mathematical worlds.

At deeper recursive thresholds, a realm may resolve into another Tree instance. This must be implemented through domain rebasing and recursive state, not by nesting literal geometry down to impossible scales.

## Foundational epistemic rule

Never treat one Tree diagram or correspondence table as universal Kabbalah.

Keep three layers independent:

1. **Topology** — the graph and spatial layout chosen for this application.
2. **Attribution systems** — Hebrew letters, path numbers, Tarot, astrology, divine names, angelic orders, color scales, etc., each carrying explicit source/provenance.
3. **Visual interpretation** — our shader grammar and interaction design, clearly labeled as interpretation unless directly attested by a source.

Changing an attribution system must never mutate the underlying graph.

Da'ath must not be silently promoted to an eleventh Sephirah. If implemented later, model it as a threshold, event, state, or disputed/derived locus appropriate to the chosen system.

## Technical stack

Canonical first renderer:

- Vite
- React 19
- Three.js
- React Three Fiber 9
- `@react-three/xr` 6
- GLSL `ShaderMaterial` on WebGL/WebGL2

WebGPU/TSL may be investigated later behind a rendering abstraction. Do not sacrifice current browser/WebXR reliability merely to use a newer renderer.

Core visual phenomena must be procedural. Do not depend on raster image textures for the Sephiroth, paths, stars, portals, or fractal realms. Typography/UI may be handled separately if needed, but the cosmological visuals themselves should arise from geometry, shaders, fields, or generated data.

## Numerical model of “infinite zoom”

Do not claim that raymarching alone provides literal infinite precision.

Implement perceptual infinity through:

- logarithmic zoom state
- bounded local coordinate domains
- octave/cycle rebasing
- deterministic reseeding or domain offsets at rebase boundaries
- floating-origin/world-origin management where necessary
- recursive scene/state handoffs
- stable shader iteration limits

The user should experience continuous descent while the mathematics repeatedly returns to a numerically healthy local scale.

## XR invariant

Never programmatically drive the headset camera transform during ordinary traversal.

For immersive XR, use world transformation, portals, scale choreography, fades, or `XROrigin` movement where appropriate. Head tracking must remain authoritative. Desktop/mobile camera motion and XR traversal may share state but must use different locomotion choreography.

Every essential interaction must eventually work with:

- mouse
- touch
- foldable phone in portrait and landscape
- XR controller rays
- XR hands where supported

## Performance invariants

Treat mobile and standalone VR GPUs as first-class targets.

- deterministic procedural generation
- no accidental `Math.random()` in canonical simulation/geometry code
- adaptive DPR outside XR
- bounded raymarch steps
- dynamic quality tiers
- no giant over-tessellated meshes when a low-poly enclosing volume suffices
- avoid expensive postprocessing until profiled
- provide shader debug modes for step count, normals, distance, and overdraw
- preserve 72/90 Hz XR viability as a design target, not an afterthought
- design the Fold UI around safe areas, narrow portrait, unfolded tablet-like aspect ratios, and orientation changes

## Data architecture

Use explicit registries rather than switch statements scattered through components.

Recommended conceptual layers:

- `treeTopology` — nodes, edges, coordinates
- `attributions/<system>` — provenance-bearing esoteric claims
- `realmProfiles` — visual/mathematical interpretation parameters
- `shaderKernels` — reusable distance estimators, transforms, lighting, fog, raymarch core
- `pathOperators` — transformations applied during path traversal
- `journeyState` — tree/entering/fractal/path/returning states, recursive depth, deterministic seed
- `qualityProfile` — phone/desktop/XR budgets

Every shader realm should eventually declare a mathematical grammar such as:

- base distance estimator or field
- symmetry group / invariants
- coordinate fold(s)
- repetition domain
- metric or distortion law
- iteration count
- attractor/repulsor behavior
- temporal law
- palette mapping
- volumetric/surface behavior
- recursion/rebase rule
- audio/sonification hooks

## Sephirah realm design language

These are **Hermetic visual interpretations for design**, not claims that the historical Jewish sources prescribe these specific fractals.

### 1 — Kether / Crown

Do not reduce Kether to “a white Mandelbulb.” Begin from minimal differentiation: a nearly featureless luminous singularity whose complexity becomes apparent only through approach. Favor extremely high symmetry, vanishing boundaries, recursive emergence from a point/limit, and restrained temporal movement. The experience should imply potential before articulation.

### 2 — Chokmah / Wisdom

Model unbounded generative impulse: radial/vector expansion, branching instabilities, asymmetrical eruptions, rotating flow, and rapid propagation. Structure should be born faster than it can settle. Use pearlescent/gray-white behavior only when the selected attribution system warrants it.

### 3 — Binah / Understanding

Model delimitation, containment, measure, and form. Favor enclosing surfaces, cellular or sponge-like removal, heavy negative space, constrained hyperstructures, slower time, and strong boundaries. Saturnian qualities belong to a Hermetic attribution layer, not to topology itself.

### 4 — Chesed / Mercy

Model ordered expansion: smooth growth, generous spacing, stable branching, broad curves, low-frequency structure, and repeated architectures that proliferate without becoming jagged.

### 5 — Geburah / Strength / Severity

Model discrimination, cutting, compression, and energetic boundary-making. Use CSG subtraction, clipped fields, sharp SDF intersections, discontinuity-like visual events, directional force, and high local contrast.

### 6 — Tiphareth / Beauty

Model integration and harmonic equilibrium. Use exact symmetry, harmonic ratios, coherent interference, central illumination, balanced recursive scales, and forms whose complexity remains legible. This realm should function as a mathematical mediator, not merely “the yellow one.”

### 7 — Netzach / Victory / Endurance

Model continuous affective and organic flow: curl fields, tendrils, vascular branching, reaction-diffusion-like procedural forms, soft attractors, and patterns that feel grown rather than constructed.

### 8 — Hod / Splendor / Glory

Model articulation, discretization, symbolic order, and combinatorics: lattices, crystalline cells, tilings, nested grids, modular transforms, information-dense repetition, and abrupt but intelligible state changes.

### 9 — Yesod / Foundation

Model mediation, image, reflection, periodicity, and unstable appearance: interference fields, mirror-like folds, phase modulation, lensing, quasi-periodic repetition, and forms that continuously reorganize without losing an underlying cadence.

### 10 — Malkuth / Kingdom

Model concretization and multiplicity. Favor dense terrain-like SDFs, four-domain material organization, granular detail, gravity/weight cues, and the sense that prior abstractions have precipitated into a world. If using Citrine/Olive/Russet/Black, bind those colors to a documented color-scale system rather than assuming they are universal Sephirotic colors.

## Paths

The 22 paths must ultimately be mathematical operators. A path may alter:

- metric
- handedness
- symmetry
- iteration law
- coordinate basis
- time direction/rate
- palette basis
- topology/repetition domain
- sound mapping

The user should feel that crossing a path *transforms the world* before arriving at the destination Sephirah.

Path-number, Hebrew-letter, Tarot, zodiacal, elemental, planetary, or Crowley-specific correspondences must live in an attribution module with provenance and dispute handling.

## Milestone plan

### M0 — Foundational proof

- render 10 Sephiroth and 22 paths
- select a Sephirah with pointer/touch/XR pointer semantics
- desktop/mobile camera approach
- XR-safe timed/world handoff without driving headset camera
- enter a procedural raymarched realm
- prove log-zoom + domain rebasing
- provide a world-space return interaction for XR
- verify topology and deterministic source rules

### M1 — Instrument-grade traversal

- explicit state machine with reversible/interruptible transitions
- `XROrigin`-based portal/world-scale choreography
- focus, hover, target, activation, cancel, and return feedback
- Fold portrait/unfolded/landscape QA
- quality tiers and adaptive raymarch budgets
- GPU/debug instrumentation

### M2 — Source-backed esoteric data

- define attribution schema
- add exact source locators
- add Golden Dawn/Crowley color scales and path attributions only after verification
- support multiple systems without silent harmonization
- expose source/system selection in a non-intrusive research UI

### M3 — Shader kernel laboratory

- reusable SDF primitives
- fold transforms
- domain repetition
- CSG operators
- analytic/procedural normals
- volumetrics
- palette functions
- debug render modes
- deterministic seeds
- performance benchmarks

Build three maximally different prototype realms first to validate the architecture before producing all ten.

### M4 — Ten distinct Sephirah realms

Each realm receives its own mathematical grammar. Recoloring the same fractal ten times fails the milestone.

### M5 — Transformative paths

Make path traversal a continuous shader/world transformation rather than a teleport between endpoints.

### M6 — Recursive Tree-within-Tree

At controlled thresholds, reveal another navigable Tree through state recursion and coordinate rebasing. Preserve numerical stability and user orientation.

### M7 — Procedural sonification

Map shader/state variables into Web Audio / spatial audio. Sound should be generated or synthesized from the same mathematical state where feasible, not used as unrelated ambience.

### M8 — XR/mobile culmination

Quest-class standalone VR and Fold-class mobile must receive physical QA. Validate frame pacing, controller/hand targeting, legibility, safe areas, thermal/performance behavior, and recovery from interrupted XR sessions.

## Engineering workflow

Before changing code:

1. inspect the current repository and exact head
2. run existing tests/checks
3. read the topology, traversal, shader, and XR architecture
4. state what is already complete
5. make the smallest coherent milestone change

After changing code:

1. run topology/data validation
2. run production build
3. test at narrow phone, unfolded/foldable, desktop, and XR-relevant dimensions where possible
4. report exact files changed
5. report exact verification results and anything not physically verified
6. never claim a browser, headset, or physical-device test that was not actually performed

## Current M0 starting state

Assume the starter already contains:

- `treeTopology.js` with 10 nodes / 22 topological edges
- provisional phase-one visual colors explicitly marked non-canonical
- deterministic procedural star field
- `TreeOfLife`, `Sephirah`, and path components
- desktop camera traversal
- XR wrapper and XR-safe camera rule
- raymarched GLSL fold-space proof
- log zoom with local rebase cycles
- touch/wheel descent
- world-space return sigil
- graph/determinism verification script

Do not throw this away and restart. Audit it, run it, then evolve it milestone by milestone.

## Immediate next task

Implement **M1 — Instrument-grade traversal**, beginning with a proper traversal controller and XR `XROrigin`/portal choreography. Preserve the topology/attribution boundary and keep all procedural rendering deterministic. Add measurable acceptance criteria for Fold-class touch devices and Quest-class WebXR before considering M1 complete.
