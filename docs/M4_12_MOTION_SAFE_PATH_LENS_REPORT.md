# M4.12 — Motion-Safe Descent + Complete Path Lens

## Why this pass exists

Physical Fold QA showed that the stable M4.10/M4.11 app could still glitch when the user dragged/"scrolled" rapidly inside some fractal realms. The renderer itself was accepted; the remaining problem was the coupling between high-frequency Android pointer events and recursive shader state.

## Stability correction

`useFractalNavigation` is now an input governor rather than a direct depth mutator.

- pointer/wheel events enqueue bounded zoom intent;
- coalesced pointer deltas are clamped to ±72 CSS pixels per event;
- R3F consumes the queue at a capped velocity each frame;
- depth can no longer jump multiple expensive recursive branches because one delayed Android event arrived late;
- FractalRealm and PathMetamorphosis reserve temporary quality headroom while motion is active and around depth-stage boundaries;
- no realm motif, depth stage, recursive law, glow system, or accepted dedicated Malkuth fast-path was removed.

## Complete macro path lens

The documentary path layer expands from the two operative paths to all 22 canonical edges.

- topology remains in `treeTopology.js`;
- documentary Hermetic path records remain in `attributions/hermeticPaths777.js`;
- actual traversability remains exclusively in `PATH_OPERATORS`;
- Study + 777 reveals connected Hebrew-letter / cosmic-attribution inscriptions directly around the Tree;
- a focused path can be inspected even if its custom fractal metamorphosis has not yet been implemented;
- only the two accepted operators show a `TRANSITUS` action.

## Source-critical note

The full path atlas represents the 777 / Golden Dawn-era baseline for path letters, elemental/planetary/zodiacal assignments and Tarot titles. Later Crowleyan reception changes—most importantly the Heh/Tzaddi Emperor/Star switch—are explicitly not silently merged into this baseline. Those can be represented as a distinct attribution layer later.

## Preserved systems

- M4.10 strict-port/no-store runtime lock;
- dedicated Malkuth ~16 KB shader fast-path;
- Tree-first boot and parallel-only shader warmup;
- M4.11 astrolabe field, graph resonance, number crowns and multi-current paths;
- 10 bespoke realm grammars and four-stage depth rites;
- in-place WebGL context recovery;
- reversible Geburah↔Tiphareth and Yesod↔Malkuth path metamorphoses;
- Vision / Study / Contemplate and Core / 777 separation;
- procedural sonification remains on hold.
