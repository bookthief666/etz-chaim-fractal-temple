# M4.6 — Transition Stability + Living-Grimoire Refinement

## Scope

This pass fixes the M4.5 physical Fold regression without removing, simplifying or reverting the accepted UI-family redesign.

## Root-risk analysis

M4.5 added an identity CSS `filter` to the WebGL Canvas after the threshold cleared, plus a viewport-sized blurred atmosphere layer. On Chromium/Android, even identity filters can force off-screen compositing. The first realm handoff also remained the point where the shared ~40KB raymarch shader could be compiled. That combination could produce a long frame/context pressure at the exact moment CameraDirector depended on `useFrame` to finish `entering`.

## Corrective architecture

1. Shader prewarming compiles both shared realm/path shader programs while the threshold is still present.
2. A state-level handoff watchdog independently seats the selected realm/path if cinematic frame delivery is delayed.
3. CameraDirector abandons stale interpolation after watchdog seating.
4. Cleared Canvas returns to `filter: none`, `transform: none`, `transition: none`.
5. All atmosphere layers remain, but active raymarch phases exchange the large CSS blur for intrinsically soft radial gradients.
6. A low-cost ritual TransitionGate makes entry/return visually deliberate without backdrop filters.

## Preserved invariants

- M4.5 ceremonial threshold and family typography
- Living Tree seal and reactive UI theme
- ten distinct realm grammars
- recursive depth rites
- Kether safety budget/numerical guards
- two reversible path metamorphoses
- Vision / Study / Contemplate
- Core / 777 provenance architecture
- WebGL context-loss recovery
- Fold adaptive quality
- deterministic procedural policy

## Deferred

M5 procedural sonification remains on hold.
