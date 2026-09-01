# M2B — Legibility, Depth & Living Glyphs

Physical QA on a Samsung Galaxy Z Fold-class viewport showed that M2A had reached the correct conceptual baseline but exposed a composition problem: distinct SDF grammars could still become visually illegible when the mathematical eye began too near a motif. In practice this turned Yesod into a blue wall, Geburah into a single giant arc, Kether into clipped white/black wedges, and Hod into a blown-out lattice.

M2B attacks that problem without backing away from mathematical complexity.

## Rendering changes

- Canonicalized the mathematical ray origin to `[0, 0, 2.72]`. Realm composition no longer inherits the selected Tree node's world-space position.
- Added a second `realmGlyphDE` field. Solid geometry and canonical sacred-geometry linework are now independent. Rays may strike architecture while still accumulating neon from a pentagram, hexagram, tesseract-like frame, wave-ring, helix, or lattice behind it.
- Added shader-space filmic highlight compression so Kether, Tiphareth, and Hod can remain emissive without simply clipping to flat white/yellow.
- Added gesture energy. Touch-drag / wheel movement injects a short-lived excitation value into the coordinate field and glyph glow; it decays exponentially instead of creating non-deterministic motion.
- Retuned Hod and Malkuth cell spacing to create more negative space and less first-hit clutter.
- Replaced Yesod's complete enclosing spherical shell with a tilted lunar torus plus ninefold wave structure, preventing the realm from opening on a featureless colored wall.

## Architectural rule

A realm now has two simultaneous geometries:

1. **Structural field** — the surfaces the ray can actually hit.
2. **Glyph field** — thin canonical mathematical motifs used for luminous accumulation and symbolic legibility.

This is important for later path work: transformations can alter the structural field and the glyph field at different rates, allowing the user to see one Sephirah's symbolic grammar emerge inside another before the spatial topology fully changes.

## Physical acceptance targets

On Fold hardware, check especially:

- Kether: no large white horizon/wedge at initial entry; nested frame/crown geometry should occupy middle depth.
- Geburah: at least one pentagram should become readable during descent instead of only a giant red arc.
- Tiphareth: hexagram / sixfold mandala should remain readable against solar glow.
- Hod: preserve complexity but recover dark negative space and orange crystalline edges rather than full-screen yellow clipping.
- Yesod: open into violet/indigo depth with ring/lunar linework rather than a flat blue field.
- Netzach: vines should read as spatial tendrils rather than broad screen-filling ribbons.

## Verification boundary

The local artifact environment can execute the deterministic/static audit and JavaScript syntax checks. It does not have the installed Vite/Three dependency tree or a browser GPU context, so production Vite build and GLSL driver compilation remain physical-machine acceptance steps.
