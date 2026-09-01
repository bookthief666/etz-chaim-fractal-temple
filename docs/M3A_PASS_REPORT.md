# M3A — Recursive Sephirah Worlds

## Scope

M3A is the first internal-progression milestone. It preserves the accepted M2B Tree, ray camera, glyph field, filmic response and interaction model while changing realm descent from a continuously scaled scene into a recurring four-stage rite.

## Depth state

`FractalRealm.jsx` derives three deterministic uniforms from positive logarithmic descent:

- `uDepthStage` — integer-like float 0..3
- `uDepthPhase` — 0..1 progress within the current stage
- `uDepthEpoch` — number of complete four-stage cycles

Autonomous descent remains slow; direct touch/wheel descent can cross stages quickly. The UI receives stage changes only when the discrete stage changes, avoiding per-frame React state churn.

Every realm profile now carries four human-readable `depthRite` labels and a `recursiveLaw`.

## Sacred geometry / performance

Added loop-free angular folding helpers `polarRepeat` and `polarRingCell`. They allow one local motif evaluation to appear in N angular sectors and are used instead of naïvely evaluating many independent copies.

Deep stages intentionally add geometry only in selected realms so the expensive SDF cost does not multiply everywhere at once.

## Showcase recursion

### Geburah

Stage 0: primary pentagram + blades.
Stage 1: fivefold satellite pentagram court.
Stage 2: repeated pentagram tunnel along depth.
Stage 3: nested pentagrams at two additional scales.

### Tiphareth

Stage 0: primary hexagram / solar rings.
Stage 1: sixfold small-hexagram court.
Stage 2: two deeper recursive hexagrams.
Stage 3: repeating solar/hexagram corridor.

### Yesod

Stage 0: mirrored lunar bodies / torus / ninefold ring.
Stage 1: nine moon beads.
Stage 2: repeated phase corridor.
Stage 3: reflected image-within-image wave/torus shell.

### Malkuth

Stage 0: crystal cell / strata / four- and tenfold rings.
Stage 1: fourfold material gates.
Stage 2: framed mineral corridor with crystal altar forms.
Stage 3: nested crystal/cage field.

Malkuth's color response is also retuned so green accent light no longer dominates the whole display. The solid material field now varies through an interpretive citrine / olive / russet / black quadrant law.

## First path operator schema

`src/data/pathOperators.js` contains two topology-valid, reversible transform designs:

- `geburah__tiphareth`: fivefold severity → sixfold solar harmony
- `yesod__malkuth`: phase/image → crystal/material stratification

These are explicitly visual/mathematical interaction records, not historical path attributions.

## Composition

The return sigil is smaller and lower in the field. A larger transparent target preserves interaction accessibility while reducing visual obstruction of principal glyphs.

## Static verification

Expected `npm run test` output includes:

- Tree topology: 10 / 10
- Tree paths: 22 / 22
- connected graph
- 10 / 10 realm profiles
- 10 / 10 four-stage recursive rites
- two valid path-operator prototypes
- all ten distinct shader kinds
- sacred geometry helpers and M3A depth uniforms present
- deterministic source audit

The artifact environment also syntax-checks `.js/.mjs` modules and imports the assembled shader source successfully. Browser GLSL compilation and Vite production build remain physical-machine checks.
