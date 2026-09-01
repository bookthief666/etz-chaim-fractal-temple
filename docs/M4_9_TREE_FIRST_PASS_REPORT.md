# M4.9 — Tree-First Boot / First Light

## Physical trigger

Samsung Galaxy Z Fold physical QA showed the M4.8 ritual/HUD layer alive after threshold clearance while the macro R3F Tree remained visually absent for an unacceptable interval.

## Root cause corrected

M4.8 still mounted `ShaderPrewarmer` immediately with the Canvas. Its compatibility path allowed synchronous `gl.compile()` of the full shared realm (~40 KB fragment source) and path (~15 KB fragment source) programs before the macro Tree had proven a visible frame. On a mobile Chromium/WebGL driver this speculative work can starve or reset the same GPU context needed to reveal the Tree.

## Invariants introduced

1. **Tree wins first frame.** `TreeFrameProbe` requires seven delivered Tree frames after the ceremonial threshold clears.
2. **No speculative synchronous shader compile.** Warmup is allowed only when `KHR_parallel_shader_compile` and `compileAsync` are both available.
3. **Warmup is delayed and sequential.** Realm program first, path later, after the Tree has remained visible.
4. **Immediate first-light continuity.** A topology-derived Living Tree seal remains visible until WebGL has demonstrated real Tree frames, so a slow GPU never presents an empty temple center.
5. **Boot watchdog.** If no Tree frames arrive after 4.2 seconds, the renderer is remounted once rather than leaving the app stranded.
6. **Threshold compositing stays cheap.** The ceremonial veil supplies the visual concealment; the Canvas no longer pays a blur/filter compositor tax while hidden.

## Explicit non-regressions

No Sephirah geometry, fractal kernel, recursion rite, path metamorphosis, M4 provenance layer, M4.5 family UI, M4.6 transition gate, M4.7 return interlock, or M4.8 borderless oracular interaction was removed or simplified.

## Verification

- project audit: PASS
- 43 JS/JSX modules parsed with TypeScript parser: PASS
- 75 local imports / 0 missing: PASS
- realm fragment: 40,205 bytes, balanced braces, `main()` present
- path fragment: 15,120 bytes, balanced braces, `main()` present
- CSS braces: balanced
- production Vite build: NOT EXECUTED in artifact environment (`vite: not found`; node_modules absent)

Physical Fold acceptance remains authoritative for first visible Tree latency and mobile WebGL behavior.
