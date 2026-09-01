import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PATHS, SEPHIROTH } from '../src/data/treeTopology.js'
import { PATH_OPERATORS } from '../src/data/pathOperators.js'
import {
  PHASE_OWNERSHIP,
  RUNTIME_PHASE,
  RUNTIME_PHASES,
  ownsPhase,
} from '../src/runtime/phases.js'
import {
  INITIAL_RENDERER_LIFECYCLE,
  RENDERER_EVENT,
  RENDERER_STATUS,
  rendererLifecycleReducer,
} from '../src/runtime/rendererLifecycle.js'
import {
  loadRealmProgram,
  REALM_SHADER_FAMILIES,
  REALM_SHADER_IDS,
} from '../src/shaders/realmRegistry.js'
import { compatibilityRealmProgram } from '../src/shaders/compatibilityRealm.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => fs.readFile(path.join(root, relative), 'utf8')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

assert(RUNTIME_PHASES.length === 6, 'Runtime must expose exactly six authoritative phases')
assert(
  RUNTIME_PHASES.join('|') === 'THRESHOLD|TREE|INGRESS|REALM|PATH|RETURN',
  'Runtime phases must preserve the M4.15 state order',
)

for (const [owner, phases] of Object.entries(PHASE_OWNERSHIP)) {
  assert(phases.length > 0, `${owner} requires an owning phase`)
  for (const phase of phases) assert(RUNTIME_PHASES.includes(phase), `${owner} owns invalid phase ${phase}`)
}

assert(ownsPhase('canonicalTree', RUNTIME_PHASE.INGRESS), 'Tree must remain visible during ingress')
assert(ownsPhase('canonicalTree', RUNTIME_PHASE.RETURN), 'Tree must remain visible during return')
assert(ownsPhase('canonicalTree', RUNTIME_PHASE.THRESHOLD), 'Canonical DPR-1 Tree core must preserve M4.13 first-light preseating')
assert(!ownsPhase('canonicalTree', RUNTIME_PHASE.REALM), 'Tree renderer must unmount during REALM')
assert(!ownsPhase('canonicalTree', RUNTIME_PHASE.PATH), 'Tree renderer must unmount during PATH')
assert(ownsPhase('realmRenderer', RUNTIME_PHASE.REALM), 'Realm renderer must own REALM')
assert(!ownsPhase('realmRenderer', RUNTIME_PHASE.TREE), 'Realm renderer must not exist during TREE')
assert(ownsPhase('pathRenderer', RUNTIME_PHASE.PATH), 'Path renderer must own PATH')
assert(!ownsPhase('pathRenderer', RUNTIME_PHASE.REALM), 'Path renderer must not exist during REALM')

const [experience, app, atmosphere, styles, registry, realm, rendererGuard, compatibility] = await Promise.all([
  read('src/components/Experience.jsx'),
  read('src/App.jsx'),
  read('src/components/TempleAtmosphere.jsx'),
  read('src/styles.css'),
  read('src/shaders/realmRegistry.js'),
  read('src/components/FractalRealm.jsx'),
  read('src/components/RendererGuard.jsx'),
  read('src/shaders/compatibilityRealm.js'),
])

assert(experience.includes("ownsPhase('canonicalTree', phase)"), 'Experience must gate the Tree through ownership')
assert(experience.includes("ownsPhase('realmRenderer', phase)"), 'Experience must gate realms through ownership')
assert(experience.includes("ownsPhase('pathRenderer', phase)"), 'Experience must gate paths through ownership')
assert(!experience.includes('ShaderPrewarmer') && !app.includes('compileAsync'), 'No speculative shader compiler may mount')
assert(atmosphere.includes('atmosphere-isolated'), 'Temple atmosphere must expose isolated REALM/PATH mode')
assert(styles.includes('.atmosphere-isolated .temple-aurora') && styles.includes('animation: none !important'), 'Isolated atmosphere must freeze compositor animations')

assert(REALM_SHADER_IDS.length === 10, 'All ten realms require explicit lazy dispatch')
assert(new Set(REALM_SHADER_IDS).size === 10, 'Realm shader IDs must be unique')
assert(Object.keys(REALM_SHADER_FAMILIES).length === 10, 'Every realm requires a shader family identifier')
assert(registry.match(/\(\) => import\(/g)?.length === 10, 'Each realm dispatch must use a dynamic import')
assert(realm.includes('loadRealmProgram') && !realm.includes('realmFragmentShader'), 'Runtime realm component must not statically import the giant shared program')

for (const realmId of REALM_SHADER_IDS) {
  const first = await loadRealmProgram(realmId)
  const second = await loadRealmProgram(realmId)
  assert(first === second, `${realmId} program cache must be deterministic`)
  assert(first.realmId === realmId, `${realmId} program identity mismatch`)
  assert(first.family === REALM_SHADER_FAMILIES[realmId], `${realmId} shader family mismatch`)
  assert(first.vertex.length > 100 && first.fragment.length > 4000, `${realmId} program is incomplete`)
  assert(!first.fragment.includes('uRealmKind'), `${realmId} must not retain shared runtime realm dispatch`)
  assert(!first.fragment.includes('Math.random'), `${realmId} shader source must remain deterministic`)
}

// M4.15.1 black-frame hardening: a JS module load is not evidence that the
// mobile GPU linked a drawable program. The active renderer must surface actual
// driver compiler errors and retain a tiny analytical compatibility path.
assert(rendererGuard.includes('debug.onShaderError'), 'RendererGuard must surface GPU shader compile/link errors')
assert(rendererGuard.includes('getProgramInfoLog') && rendererGuard.includes('getShaderInfoLog'), 'GPU failure reports must include driver diagnostics')
assert(experience.includes('programFailure') && experience.includes('onShaderError={reportProgramError}'), 'Experience must route GPU program failures to the active realm')
assert(realm.includes('compatibilityRealmProgram'), 'Realm entry must retain a compatibility renderer during shader ignition')
assert(realm.includes('COMPATIBILITY_HOLD_MS'), 'Compatibility renderer must cover the first compiler/ignition window')
assert(realm.includes('stableAge.current = 0'), 'Requested realm ignition must reset when its actual program becomes available')
assert(compatibilityRealmProgram.family === 'compatibility-analytical-realm', 'Compatibility shader identity mismatch')
assert(compatibilityRealmProgram.fragment.length > 1200, 'Compatibility shader is unexpectedly incomplete')
assert(!compatibility.includes('for (') && !compatibility.includes('while ('), 'Compatibility shader must remain loop-free for mobile driver safety')
assert(!compatibility.includes('Math.random'), 'Compatibility renderer must remain deterministic')

let lifecycle = rendererLifecycleReducer(INITIAL_RENDERER_LIFECYCLE, {
  type: RENDERER_EVENT.PHASE_CHANGED,
  phase: RUNTIME_PHASE.REALM,
})
lifecycle = rendererLifecycleReducer(lifecycle, { type: RENDERER_EVENT.CONTEXT_LOST })
assert(lifecycle.status === RENDERER_STATUS.CONTEXT_LOST, 'Actual context loss must enter context-lost state')
assert(lifecycle.contextLossCount === 1, 'Context loss must increment exactly once')
const preservedDuringLoss = rendererLifecycleReducer(lifecycle, {
  type: RENDERER_EVENT.PHASE_CHANGED,
  phase: RUNTIME_PHASE.TREE,
})
assert(preservedDuringLoss === lifecycle, 'Phase events must not override an active context-loss lifecycle')
lifecycle = rendererLifecycleReducer(lifecycle, { type: RENDERER_EVENT.RESTORE_STARTED })
lifecycle = rendererLifecycleReducer(lifecycle, { type: RENDERER_EVENT.CONTEXT_RESTORED })
lifecycle = rendererLifecycleReducer(lifecycle, {
  type: RENDERER_EVENT.RESTORE_PRESENTED,
  phase: RUNTIME_PHASE.REALM,
})
assert(lifecycle.status === RENDERER_STATUS.RUNNING, 'Restored REALM must resume running without phase mutation')
assert(lifecycle.contextRestorationCount === 1, 'Restoration must increment exactly once')
assert(rendererGuard.includes('webglcontextlost') && rendererGuard.includes('webglcontextrestored'), 'Recovery must use actual WebGL signals')
assert(!app.includes('setRendererNonce((value) => value + 1)\n\n    const repeated'), 'Legacy automatic graphics reseat path must remain removed')

assert(SEPHIROTH.length === 10 && PATHS.length === 22, 'Canonical topology must remain 10/22')
assert(Object.keys(PATH_OPERATORS).length === 2, 'The two implemented path operators must remain separate prototypes')
const topology = await read('src/data/treeTopology.js')
const operators = await read('src/data/pathOperators.js')
assert(!topology.includes('HERMETIC_PATHS_777'), 'Topology must remain separate from documentary path data')
assert(!operators.includes('HERMETIC_PATHS_777'), 'Path operators must remain separate from documentary attribution data')

console.log('M4.15 phases: THRESHOLD / TREE / INGRESS / REALM / PATH / RETURN PASS')
console.log('Renderer ownership: Tree/realm/path mutual exclusion PASS')
console.log('Compositor isolation: REALM/PATH static atmosphere PASS')
console.log('Realm dispatch: 10 / 10 lazy dedicated programs PASS')
console.log('Shader integrity: no uRealmKind in instantiated realm programs PASS')
console.log('Realm ignition: GPU error telemetry + analytical continuity fallback PASS')
console.log('Recovery lifecycle: context-loss state preservation PASS')
console.log('Deterministic procedural sources + topology 10/22 PASS')
console.log('Topology / path operators / documentary attribution separation PASS')
