# M4.10 — Malkuth Fast-Path + Runtime Lock

## Physical QA evidence
The Fold screenshot submitted after the M4.9 handoff still displayed `/ M4.8` in the live HUD. This proves the browser was connected to an older Vite process/runtime for that test; M4.9 source renders `/ M4.9`.

Vite normally chooses the next open port when 5173 is already occupied. That is dangerous in this physical-QA workflow: a fresh server can silently start on 5174 while the browser remains connected to an older 5173 process. M4.10 fixes this by pinning port 5173 with `strictPort: true`, adding no-store response headers, and exposing one centralized runtime build stamp.

## Malkuth compiler fast-path
Malkuth no longer enters through the ~40 KB ten-realm monolithic fragment program. It receives a dedicated program containing the exact accepted Malkuth grammar: crystal cells, fourfold strata/gates, tenfold mineral rings, corridor, altar, recursive crystal/cage, fourfold material palette and depth rites.

The dedicated program also separates structural and glyph distance evaluation. Normals evaluate only the structural DE, and the emissive glyph field is sampled on alternating march steps with compensated accumulation. This reduces redundant SDF work without removing Malkuth geometry or changing its ritual stages.

## Dev-runtime stability
React StrictMode was removed from the Vite physical-QA entrypoint. StrictMode's development-only remount/effect replay is valuable for ordinary application logic but duplicates GPU material/program setup during mobile WebGL testing. Production semantics are unchanged; the Fold QA runtime now avoids that artificial stressor.

## Preserved systems
No accepted visual, ritual, documentary, path, recursive, or UI-family system was removed. M4.8 no-box interaction, M4.9 Tree-first boot, M3B/M4 recovery, all ten realm grammars and both operative paths remain.

## Static source-size audit
At packaging time the assembled dedicated Malkuth fragment source is ~16.1 KB versus ~40.2 KB for the shared ten-realm fragment, a ~60% source reduction before driver optimization while retaining every Malkuth stage/motif.
