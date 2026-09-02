import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { SEPHIROTH, PATHS, SEPHIRAH_BY_ID, PATH_BY_ID } from '../src/data/treeTopology.js'
import { REALM_PROFILES } from '../src/data/realmProfiles.js'
import { PHASE_ONE_VISUALS } from '../src/data/visualGrammar.js'
import { HERMETIC_777 } from '../src/data/attributions/hermetic777.js'
import { HERMETIC_PATHS_777 } from '../src/data/attributions/hermeticPaths777.js'
import { SOURCE_CATALOG } from '../src/data/sources.js'
import { REALM_RITUALS, PATH_RITUALS } from '../src/data/ritualContent.js'
import { PATH_OPERATORS, getDirectedPathOperator } from '../src/data/pathOperators.js'
import {
  createPathVisualGrammar,
  PATH_MOTION_FAMILY,
} from '../src/data/pathVisualGrammar.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

for (const [sourceId, source] of Object.entries(SOURCE_CATALOG)) {
  assert(source.id === sourceId, `Source registry key mismatch for ${sourceId}`)
  assert(source.author && source.title && source.locator && source.scope, `Source ${sourceId} requires author/title/locator/scope`)
}

assert(SEPHIROTH.length === 10, `Expected 10 Sephiroth, got ${SEPHIROTH.length}`)
assert(PATHS.length === 22, `Expected 22 paths, got ${PATHS.length}`)
assert(new Set(SEPHIROTH.map((node) => node.id)).size === 10, 'Sephirah IDs must be unique')
assert(new Set(PATHS.map((edge) => edge.id)).size === 22, 'Path IDs must be unique')

for (const edge of PATHS) {
  assert(SEPHIRAH_BY_ID[edge.a], `Path ${edge.id} references missing node ${edge.a}`)
  assert(SEPHIRAH_BY_ID[edge.b], `Path ${edge.id} references missing node ${edge.b}`)
  assert(edge.a !== edge.b, `Path ${edge.id} is a self-loop`)
}

const adjacency = new Map(SEPHIROTH.map((node) => [node.id, new Set()]))
for (const { a, b } of PATHS) {
  adjacency.get(a).add(b)
  adjacency.get(b).add(a)
}

const seen = new Set()
const queue = [SEPHIROTH[0].id]
while (queue.length) {
  const current = queue.shift()
  if (seen.has(current)) continue
  seen.add(current)
  queue.push(...adjacency.get(current))
}
assert(seen.size === SEPHIROTH.length, 'Tree graph must be connected')

const shaderKinds = []
for (const node of SEPHIROTH) {
  const realm = REALM_PROFILES[node.id]
  const visual = PHASE_ONE_VISUALS[node.id]
  const hermetic = HERMETIC_777[node.id]

  assert(realm, `Missing realm profile for ${node.id}`)
  assert(visual, `Missing visual grammar for ${node.id}`)
  assert(hermetic, `Missing Hermetic attribution record for ${node.id}`)

  assert(Number.isInteger(realm.shaderKind), `Realm ${node.id} shaderKind must be an integer`)
  assert(realm.shaderKind >= 1 && realm.shaderKind <= 10, `Realm ${node.id} shaderKind must be 1..10`)
  shaderKinds.push(realm.shaderKind)

  assert(realm.prompt?.length > 10, `Realm ${node.id} requires a contemplative prompt`)
  assert(Array.isArray(realm.depthRite) && realm.depthRite.length === 4, `Realm ${node.id} requires a four-stage depth rite`)
  assert(realm.depthRite.every((label) => typeof label === 'string' && label.length > 3), `Realm ${node.id} depth rite labels must be meaningful`)
  assert(realm.recursiveLaw?.length > 18, `Realm ${node.id} requires a recursive law`)
  assert(realm.dominantMotif?.length > 10, `Realm ${node.id} requires a dominant sacred-geometry motif`)
  assert(realm.supportingMotifs?.length > 8, `Realm ${node.id} requires supporting motif grammar`)
  assert(Number.isFinite(realm.glowStrength) && realm.glowStrength > 0, `Realm ${node.id} glowStrength must be positive`)
  assert(Number.isFinite(realm.motionScale) && realm.motionScale > 0, `Realm ${node.id} motionScale must be positive`)
  assert(
    Number.isFinite(realm.symbolDensity) && realm.symbolDensity >= 0 && realm.symbolDensity <= 1,
    `Realm ${node.id} symbolDensity must be in [0, 1]`,
  )
  if (realm.mobileQuality !== undefined) {
    assert(realm.mobileQuality > 0.35 && realm.mobileQuality <= 1, `Realm ${node.id} mobileQuality must be in (0.35, 1]`)
  }

  assert(/^#[0-9a-f]{6}$/i.test(visual.core), `Realm ${node.id} core color must be #RRGGBB`)
  assert(/^#[0-9a-f]{6}$/i.test(visual.aura), `Realm ${node.id} aura color must be #RRGGBB`)
  assert(/^#[0-9a-f]{6}$/i.test(visual.accent), `Realm ${node.id} accent color must be #RRGGBB`)

  assert(
    hermetic.divineName && hermetic.archangel && hermetic.angelicOrder,
    `Incomplete Hermetic record for ${node.id}`,
  )
  assert(Array.isArray(hermetic.provenance) && hermetic.provenance.length >= 2, `M4 requires source provenance for ${node.id}`)
  for (const reference of hermetic.provenance) {
    assert(SOURCE_CATALOG[reference.sourceId], `Unknown source ${reference.sourceId} on ${node.id}`)
    assert(Array.isArray(reference.fields) && reference.fields.length > 0, `Source ${reference.sourceId} on ${node.id} must declare supported fields`)
  }

  const ritual = REALM_RITUALS[node.id]
  assert(ritual?.threshold?.length > 20, `M4 requires a threshold phrase for ${node.id}`)
  assert(Array.isArray(ritual.stages) && ritual.stages.length === 4, `M4 requires four contemplative stage phrases for ${node.id}`)
  assert(ritual.stages.every((phrase) => phrase.length > 24), `M4 ritual phrases for ${node.id} must remain meaningful`)
}

assert(new Set(shaderKinds).size === 10, 'M2A requires a distinct shader grammar for all ten Sephiroth')
assert(REALM_PROFILES.kether.mobileQuality <= 0.60, 'M3B requires a conservative Fold quality profile for Kether')

const pathIds = new Set(PATHS.map((path) => path.id))
const pathShaderKinds = []
for (const [id, operator] of Object.entries(PATH_OPERATORS)) {
  assert(pathIds.has(id), `Path operator ${id} must target an existing topological edge`)
  assert(operator.id === id, `Path operator ${id} must preserve its topological ID`)
  assert(operator.reversible === true, `M3B prototype path operator ${id} must declare reversibility`)
  assert(operator.mathLaw?.length > 30, `Path operator ${id} requires a mathematical transform law`)
  assert(operator.visualLaw?.length > 24, `Path operator ${id} requires a visual transform law`)
  assert(Array.isArray(operator.forwardRite) && operator.forwardRite.length === 4, `Path operator ${id} requires four forward stages`)
  assert(Array.isArray(operator.reverseRite) && operator.reverseRite.length === 4, `Path operator ${id} requires four reverse stages`)
  assert(Number.isInteger(operator.shaderKind) && operator.shaderKind >= 1, `Path operator ${id} requires a shaderKind`)
  pathShaderKinds.push(operator.shaderKind)

  const topologyPath = PATH_BY_ID[id]
  const endpointSet = new Set([topologyPath.a, topologyPath.b])
  assert(endpointSet.has(operator.from) && endpointSet.has(operator.to), `Path operator ${id} endpoints must match topology`)
  assert(operator.from !== operator.to, `Path operator ${id} must transform between distinct Sephiroth`)

  const forward = getDirectedPathOperator(id, operator.from)
  const reverse = getDirectedPathOperator(id, operator.to)
  assert(forward?.destinationId === operator.to && forward.reversed === false, `Path operator ${id} forward direction failed`)
  assert(reverse?.destinationId === operator.from && reverse.reversed === true, `Path operator ${id} reverse direction failed`)

  const documentaryPath = HERMETIC_PATHS_777[id]
  assert(documentaryPath, `M4 requires a documentary Hermetic overlay for operative path ${id}`)
  assert(Number.isInteger(documentaryPath.keyScale), `M4 path ${id} requires a documentary key scale`)
  assert(documentaryPath.letter && documentaryPath.cosmicAttribution && documentaryPath.tarot, `M4 path ${id} documentary record is incomplete`)
  assert(Array.isArray(documentaryPath.provenance) && documentaryPath.provenance.length > 0, `M4 path ${id} requires provenance`)
  for (const reference of documentaryPath.provenance) {
    assert(SOURCE_CATALOG[reference.sourceId], `Unknown source ${reference.sourceId} on path ${id}`)
  }

  const pathRitual = PATH_RITUALS[id]
  assert(pathRitual, `M4 requires contemplative path language for ${id}`)
  assert(pathRitual.forward?.length === 4 && pathRitual.reverse?.length === 4, `M4 path ${id} requires four phrases in each direction`)
}
assert(Object.keys(PATH_OPERATORS).length >= 2, 'M3B requires at least two traversable path operators')
assert(new Set(pathShaderKinds).size === Object.keys(PATH_OPERATORS).length, 'Prototype path operators require distinct shader grammars')
assert(
  shaderKinds.slice().sort((a, b) => a - b).every((kind, index) => kind === index + 1),
  'M2A shader kinds must form the complete 1..10 dispatch set',
)

const realmShaderFiles = [
  'src/shaders/fractalRealm.js',
  'src/shaders/modules/sacredGeometry.js',
  'src/shaders/modules/palette.js',
  'src/shaders/modules/realmKernels.js',
]

const realmShaderText = (await Promise.all(
  realmShaderFiles.map((relative) => fs.readFile(path.join(root, relative), 'utf8')),
)).join('\n')

for (const requiredSymbol of [
  'sdPentagramPrism',
  'sdHexagramPrism',
  'sdTesseractFrameLike',
  'sdRadialWaveRing',
  'sdHelixTube',
  'neonSurface',
  'ketherDE',
  'chokmahDE',
  'binahDE',
  'chesedDE',
  'geburahDE',
  'tipharethDE',
  'netzachDE',
  'hodDE',
  'yesodDE',
  'malkuthDE',
  'realmGlyphDE',
  'filmicCompress',
  'uInteraction',
  'uDepthStage',
  'uDepthPhase',
  'uDepthEpoch',
  'depthGatePulse',
  'polarRepeat',
  'polarRingCell',
  'safeDistance',
]) {
  assert(realmShaderText.includes(requiredSymbol), `Realm shader library is missing ${requiredSymbol}`)
}

assert(
  realmShaderText.includes('vec3 ro = vec3(0.0, 0.0, 2.72)'),
  'M2B requires the canonical mathematical ray origin',
)
assert(
  !realmShaderText.includes('cameraPosition * 0.11'),
  'M2B must not inherit the Tree node position as the fractal ray origin',
)
assert(
  realmShaderText.includes('glyphAccum'),
  'M2B requires a separate emissive glyph accumulation field',
)
assert(
  realmShaderText.includes('stepBudget = mix(40.0, 66.0'),
  'M3B requires Kether-specific mobile raymarch budgeting',
)

const pathShaderText = await fs.readFile(path.join(root, 'src/shaders/pathMetamorphosis.js'), 'utf8')
for (const requiredSymbol of [
  'fiveToSixFields',
  'phaseToCrystalFields',
  'canonicalProgress',
  'uProgress',
  'uReverse',
  'glyphAccum',
  'filmicCompress',
]) {
  assert(pathShaderText.includes(requiredSymbol), `M3B path shader is missing ${requiredSymbol}`)
}

const appText = await fs.readFile(path.join(root, 'src/App.jsx'), 'utf8')
const experienceText = await fs.readFile(path.join(root, 'src/components/Experience.jsx'), 'utf8')
const realmComponentText = await fs.readFile(path.join(root, 'src/components/FractalRealm.jsx'), 'utf8')
const pathComponentText = await fs.readFile(path.join(root, 'src/components/PathMetamorphosis.jsx'), 'utf8')
const guardText = await fs.readFile(path.join(root, 'src/components/RendererGuard.jsx'), 'utf8')
const treeProbeText = await fs.readFile(path.join(root, 'src/components/TreeFrameProbe.jsx'), 'utf8')

assert(appText.includes('RUNTIME_PHASE.PATH') && appText.includes('RUNTIME_PHASE.REALM'), 'M4.15 app state machine must expose canonical PATH and REALM phases')
assert(experienceText.includes('<PathMetamorphosis'), 'M3B experience must render path metamorphosis')
assert(experienceText.includes('RUNTIME_CAPABILITIES.maxTreeDpr'), 'M3B/M4.14 Fold profile must cap DPR through the runtime capability policy')
assert(experienceText.includes('antialias: !IS_COARSE_POINTER'), 'M3B must disable unnecessary MSAA on coarse-pointer devices')
assert(realmComponentText.includes('camera.getWorldPosition'), 'M3B realm shell must follow the display camera')
assert(pathComponentText.includes('camera.getWorldPosition'), 'M3B path shell must follow the display camera')
assert(realmComponentText.includes('<boxGeometry'), 'M3B realm ray envelope must use the low-overhead camera-locked box shell')
assert(pathComponentText.includes('<boxGeometry'), 'M3B path ray envelope must use the low-overhead camera-locked box shell')
assert(realmComponentText.includes('qualityUniform.value'), 'M3B realm renderer requires adaptive local quality')
assert(pathComponentText.includes('qualityUniform.value'), 'M3B path renderer requires adaptive local quality')
assert(guardText.includes('webglcontextlost') && guardText.includes('event.preventDefault()'), 'M3B requires explicit WebGL context-loss recovery')

const modeSelectorText = await fs.readFile(path.join(root, 'src/components/ExperienceModeSelector.jsx'), 'utf8')
const ritualCueText = await fs.readFile(path.join(root, 'src/components/RitualCue.jsx'), 'utf8')
const sourceLedgerText = await fs.readFile(path.join(root, 'src/components/SourceLedger.jsx'), 'utf8')
const studyDrawerText = await fs.readFile(path.join(root, 'src/components/StudyDrawer.jsx'), 'utf8')
const pathPanelText = await fs.readFile(path.join(root, 'src/components/PathInfoPanel.jsx'), 'utf8')
const topologyText = await fs.readFile(path.join(root, 'src/data/treeTopology.js'), 'utf8')

for (const mode of ['vision', 'study', 'contemplation']) {
  assert(modeSelectorText.includes(`id: '${mode}'`), `M4 experience selector is missing ${mode}`)
}
assert(appText.includes('BUILD_INFO.milestone'), 'Current runtime label must derive from centralized BUILD_INFO')
assert(appText.includes('experienceMode'), 'M4 app must carry explicit experience mode state')
assert(appText.includes('<RitualCue'), 'M4 app must render restrained ritual cues')
assert(appText.includes('<ContemplationPanel'), 'M4 app must expose a contemplation threshold panel')
assert(ritualCueText.includes("mode !== 'contemplation'"), 'M4 ritual language must remain restricted to contemplation mode')
assert(sourceLedgerText.includes('getSources'), 'M4 study layer must render provenance through the source registry')
assert(appText.includes('<StudyDrawer'), 'M4 must preserve optional study access from inside active realms and paths')
assert(studyDrawerText.includes('HERMETIC_PATHS_777') && studyDrawerText.includes('getAttribution'), 'M4 active dossier must support both realm and path documentary layers')
assert(pathPanelText.includes('documentaryPath') && appText.includes('HERMETIC_PATHS_777'), 'M4 path dossier must receive documentary correspondences through the independent attribution layer')
assert(!topologyText.includes('HERMETIC_777') && !topologyText.includes('SOURCE_CATALOG'), 'Topology must remain independent from documentary attribution layers')
assert(!realmShaderText.includes('SOURCE_CATALOG') && !pathShaderText.includes('HERMETIC_PATHS_777'), 'Shaders must not import documentary authority as mathematical law')
assert(HERMETIC_777.malkuth.divineName.includes('Adonai Melekh'), 'M4 777 source lock requires the Table I Malkuth God-name Adonai Melekh')
assert(HERMETIC_777.yesod.disputedNote.includes('Liber LVIII'), 'M4 must preserve the Yesod textual variant')
assert(HERMETIC_777.malkuth.disputedNote.includes('Liber LVIII'), 'M4 must preserve the Malkuth textual variant')

const thresholdText = await fs.readFile(path.join(root, 'src/components/TempleThreshold.jsx'), 'utf8')
const atmosphereText = await fs.readFile(path.join(root, 'src/components/TempleAtmosphere.jsx'), 'utf8')
const livingSealText = await fs.readFile(path.join(root, 'src/components/LivingTreeSeal.jsx'), 'utf8')
const uiThemeText = await fs.readFile(path.join(root, 'src/data/uiTheme.js'), 'utf8')
const stylesText = await fs.readFile(path.join(root, 'src/styles.css'), 'utf8')
const htmlText = await fs.readFile(path.join(root, 'index.html'), 'utf8')

assert(appText.includes('<TempleThreshold'), 'M4.5 must expose a ceremonial threshold/main page')
assert(appText.includes('<TempleAtmosphere'), 'M4.5 must carry the family atmosphere through every phase')
assert(appText.includes('<LivingTreeSeal'), 'M4.5 title furniture must carry the living Tree seal')
assert(appText.includes('getUiTheme'), 'M4.5 UI must react to the active Sephirah/path palette without mutating realm data')
assert(thresholdText.includes('Initiate the Living Tree'), 'M4.5 threshold requires the deliberate entry action')
assert(thresholdText.includes('VISIO') && thresholdText.includes('STUDIUM') && thresholdText.includes('CONTEMPLATIO'), 'M4.5 threshold must expose the three registers of the instrument')
assert(atmosphereText.includes('temple-noise') && atmosphereText.includes('temple-vignette'), 'M4.5 requires noise and vignette atmosphere layers')
assert(livingSealText.includes('PATHS.map') && livingSealText.includes('SEPHIROTH.map'), 'M4.5 landing seal must derive from the actual Tree topology')
assert(uiThemeText.includes('PHASE_ONE_VISUALS'), 'M4.5 UI theme may read but must not rewrite the visual grammar')
for (const familyToken of ['UnifrakturCook', 'Cinzel Decorative', 'IM Fell English', 'JetBrains Mono', 'temple-threshold', 'living-tree-seal']) {
  assert(stylesText.includes(familyToken) || htmlText.includes(familyToken), `M4.5 family UI is missing ${familyToken}`)
}
assert(stylesText.includes('@media (prefers-reduced-motion: reduce)'), 'M4.5 animated UI requires a reduced-motion path')
assert(!thresholdText.includes('Math.random(') && !atmosphereText.includes('Math.random('), 'M4.5 atmosphere must remain deterministic')

const transitionGateText = await fs.readFile(path.join(root, 'src/components/TransitionGate.jsx'), 'utf8')
const cameraDirectorText = await fs.readFile(path.join(root, 'src/components/CameraDirector.jsx'), 'utf8')
assert(appText.includes('<TransitionGate'), 'M4.6 must expose the ritual transition aperture')
assert(!appText.includes('ENTRY_WATCHDOG_MS') && !appText.includes('entryWatchdog'), 'M4.15 must remove timer-driven renderer/entry recovery authority')
assert(!experienceText.includes('ShaderPrewarmer') && !experienceText.includes('compileAsync'), 'M4.15 must not speculatively compile during Tree/INGRESS')
assert(cameraDirectorText.includes('transition.current = null'), 'CameraDirector must abandon stale interpolation when its owning phase unmounts')
assert(stylesText.includes('.threshold-cleared canvas') && stylesText.includes('filter: none'), 'M4.6 cleared WebGL canvas must not retain an identity CSS filter')
assert(stylesText.includes('.atmosphere-realm .temple-aurora') && atmosphereText.includes('phaseClassName'), 'M4.15 atmosphere must retain all layers with canonical phase-aware compositing')
assert(transitionGateText.includes('INGRESSUS') && transitionGateText.includes('TRANSITUS') && transitionGateText.includes('ASCENSUS'), 'M4.6 transition gate must preserve the ritual-family register')
assert(!transitionGateText.includes('Math.random('), 'Transition UI must remain deterministic')

const returnSigilText = await fs.readFile(path.join(root, 'src/components/ReturnSigil.jsx'), 'utf8')
assert(appText.includes('RETURN_ARM_DELAY_MS') && appText.includes('returnArmed'), 'M4.7 requires a post-ingress return safety interlock')
assert(experienceText.includes('returnEnabled'), 'M4.7 return arming state must reach realm/path world controls')
assert(returnSigilText.includes('MAX_TAP_DRIFT') && returnSigilText.includes('beginIntent') && returnSigilText.includes('finishIntent'), 'M4.7 world return talisman requires a deliberate fresh pointer cycle')
assert(!returnSigilText.includes('onClick={activate}'), 'M4.7 must not use the stale-click-prone return sigil handler')
assert(returnSigilText.includes('addScaledVector(scratchRight, 0.46)'), 'M4.7 return talisman must remain peripheral to the primary vertical-drag lane')
assert(stylesText.includes('.control-button.primary.is-arming:disabled'), 'M4.7 UI must visibly distinguish the protected ingress interval')

const sephirahPanelText = await fs.readFile(path.join(root, 'src/components/SephirahInfoPanel.jsx'), 'utf8')
assert(sephirahPanelText.includes('sephirah-invocation'), 'M4.8 Sephirah selection must use the borderless invocation interface')
assert(sephirahPanelText.includes('invocation-registers') && sephirahPanelText.includes('threshold-sigil'), 'M4.8 selection must expose living registers plus a persistent circular threshold action')
assert(!sephirahPanelText.includes('className="sephirah-folio"'), 'M4.8 must not regress to the boxed Sephirah folio')
assert(stylesText.includes('.invocation-reading') && stylesText.includes('touch-action: pan-y'), 'M4.8 study leaves require explicit Fold vertical scrolling')
assert(stylesText.includes('.threshold-sigil') && stylesText.includes('.invocation-rune'), 'M4.8 requires sigil entry and non-box register controls')
assert(stylesText.includes('.experience-mode-selector') && stylesText.includes('background: transparent !important'), 'M4.8 top-level registers must abandon boxed segmented-control chrome')
assert(cameraDirectorText.includes('transitionAperture') === false, 'CameraDirector must remain renderer-only and not depend on CSS transition names')
assert(cameraDirectorText.includes('Math.sin(Math.PI * t) * 0.46'), 'M4.8 requires the bounded curved Sephirah approach')
assert(appText.includes('preserving the current rite') && !appText.includes("setPhase('tree')"), 'M4.15 WebGL recovery must preserve the active rite instead of ejecting to the Tree')
assert(realmShaderText && stylesText.includes('M4.8'), 'M4.8 UI marker missing')


// M4.14 — dedicated Tiphareth compiler path + privacy-browser capability policy.
const tipharethShaderText = await fs.readFile(path.join(root, 'src/shaders/tipharethRealm.js'), 'utf8')
const runtimeCapabilitiesText = await fs.readFile(path.join(root, 'src/data/runtimeCapabilities.js'), 'utf8')
const realmRegistryText = await fs.readFile(path.join(root, 'src/shaders/realmRegistry.js'), 'utf8')
assert(realmRegistryText.includes("tiphareth: () => import('./tipharethRealm.js')"), 'M4.15 must preserve dedicated Tiphareth through dynamic dispatch')
for (const requiredSymbol of ['tipharethDE', 'tipharethGlyphDE', 'sdHexagramPrism', 'polarRingCell', 'solar', 'uDepthStage', 'uDepthEpoch']) {
  assert(tipharethShaderText.includes(requiredSymbol), `M4.14 dedicated Tiphareth shader is missing ${requiredSymbol}`)
}
assert(tipharethShaderText.length < realmShaderText.length * 0.75, 'M4.14 dedicated Tiphareth shader should materially reduce compiler source size')
assert(!realmRegistryText.includes('compileAsync') && !experienceText.includes('compileAsync'), 'M4.15 realm dispatch must not initiate speculative WebGL compilation')
assert(runtimeCapabilitiesText.includes('privacyHardenedBrowser') && runtimeCapabilitiesText.includes('no speculative'), 'M4.15 retains capability-driven privacy-browser startup without a prewarm branch')
assert(experienceText.includes('RUNTIME_CAPABILITIES.powerPreference'), 'Runtime capability policy must reach the WebGL renderer')
console.log('M4.14 Tiphareth dedicated compiler fast-path + preserved solar recursion PASS')
console.log('M4.15 privacy-browser policy: quiet startup + no speculative GLSL warmup PASS')

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(full)))
    else files.push(full)
  }
  return files
}

const sourceFiles = (await walk(path.join(root, 'src'))).filter((file) => /\.(js|jsx)$/.test(file))
for (const file of sourceFiles) {
  const text = await fs.readFile(file, 'utf8')
  assert(!text.includes('Math.random('), `Non-deterministic Math.random found in ${path.relative(root, file)}`)
}

console.log('Tree topology: 10 / 10 Sephiroth')
console.log('Tree topology: 22 / 22 paths')
console.log('Graph connectivity: PASS')
console.log('Realm profiles: 10 / 10')
console.log('Hermetic attribution records: 10 / 10')
console.log('Sacred-geometry shader grammars: 10 / 10 distinct')
console.log('Recursive depth rites: 10 / 10 with four stages')
console.log('Kether stability budget + numerical guards: PASS')
console.log('Camera-locked low-overhead ray boxes: realm + path PASS')
console.log('Adaptive Fold quality + WebGL context-loss recovery: PASS')
console.log(`Traversable path operators: ${Object.keys(PATH_OPERATORS).length} / 2 prototype PASS`)
console.log('Path metamorphosis: five→six harmonization + phase→crystal condensation PASS')
console.log('Forward/reverse path rites: PASS')
console.log('M4 experience modes: Pure Vision / Study / Contemplation PASS')
console.log('M4.5 family UI retained: ceremonial threshold + living Tree seal + reactive grimoire atmosphere PASS')
console.log('M4.5 family typography retained: blackletter / Cinzel / Fell / mono register system PASS')
console.log('M4.15 transition stability: phase-owned camera handoff + native Canvas compositing PASS')
console.log('M4.6 UI continuation: ritual ingress/transitus/ascensus gate + phase-aware ambience PASS')
console.log('M4.7 Malkuth/realm ingress integrity: return interlock + fresh-pointer talisman + peripheral placement PASS')
console.log('M4.7 UI refinement: illuminated dossier furniture + armed-return feedback PASS')
console.log('M4.8 no-box Tree interaction: oracular registers + persistent threshold sigil + Fold scrolling PASS')
console.log('M4.8 realm continuity: curved ingress + gentle ignition + in-place WebGL reseating PASS')
console.log('Locator-bearing Hermetic provenance: 10 / 10 Sephiroth PASS')
console.log('Documentary overlays for operative paths: Lamed 22 / Tav 32 PASS')
console.log('Restrained contemplative rites: 10 realms + 2 reversible paths PASS')
console.log('Topology / documentary / visual-grammar separation: PASS')

assert(
  experienceText.includes('TreeFrameProbe') &&
  !experienceText.includes('shaderPrewarmEnabled'),
  'M4.15 must preserve the real-frame first-light gate while removing speculative prewarm',
)
assert(
  appText.includes('TreeAwakening') &&
  treeProbeText.includes('delivered.current'),
  'M4.9/M4.13 immediate first-light continuity + frame probe must remain wired',
)
console.log('M4.15 tree-first boot + zero speculative shader warmup: PASS')

console.log('Deterministic source audit: PASS')

// M4.10 — runtime identity + Malkuth compiler fast-path.
const buildInfoText = await fs.readFile(path.join(root, 'src/data/buildInfo.js'), 'utf8')
const viteConfigText = await fs.readFile(path.join(root, 'vite.config.js'), 'utf8')
const mainText = await fs.readFile(path.join(root, 'src/main.jsx'), 'utf8')
const malkuthShaderText = await fs.readFile(path.join(root, 'src/shaders/malkuthRealm.js'), 'utf8')

assert(
  buildInfoText.includes("milestone: 'M4.15'") &&
  buildInfoText.includes("runtime: 'm4.15.0'") &&
  buildInfoText.includes("milestone: 'M4.16'") &&
  buildInfoText.includes("runtime: 'm4.16.0'"),
  'Current runtime identity must be M4.16 while preserving the inherited M4.15 runtime lock',
)
assert(viteConfigText.includes('strictPort: true') && viteConfigText.includes('port: 5173'), 'M4.10 must not silently start a fresh Vite runtime on a different port')
assert(viteConfigText.includes("'Cache-Control': 'no-store"), 'M4.10 physical QA server must disable stale browser caching')
assert(!mainText.includes('import { StrictMode') && !mainText.includes('<StrictMode'), 'M4.10 Fold QA entrypoint must not use React dev StrictMode WebGL remount stress')
assert(realmRegistryText.includes("malkuth: () => import('./malkuthRealm.js')"), 'M4.15 must preserve dedicated Malkuth through dynamic dispatch')
assert(realmComponentText.includes('loadRealmProgram'), 'FractalRealm must mount the requested dedicated program lazily')
for (const requiredSymbol of [
  'malkuthDE',
  'malkuthGlyphDE',
  'Crystal within crystal',
  'sdOctahedron',
  'sdBoxFrame',
  'sdRadialWaveRing',
  'polarRingCell',
  'filmicCompress',
]) {
  if (requiredSymbol === 'Crystal within crystal') {
    assert(REALM_PROFILES.malkuth.depthRite.includes(requiredSymbol), 'M4.10 must preserve Malkuth recursive depth rite')
  } else {
    assert(malkuthShaderText.includes(requiredSymbol), `M4.10 dedicated Malkuth shader is missing ${requiredSymbol}`)
  }
}
assert(malkuthShaderText.length < realmShaderText.length * 0.75, 'M4.10 dedicated Malkuth shader should materially reduce first-entry compiler source size')
assert(REALM_PROFILES.malkuth.mobileQuality <= 0.68, 'M4.10 Malkuth Fold profile must use conservative ignition headroom')
console.log('M4.10 runtime lock: fixed 5173 + no-store + centralized build identity PASS')
console.log('M4.10 Malkuth dedicated compiler fast-path + preserved recursive grammar PASS')
console.log('M4.10 Fold QA: React dev StrictMode GPU remount stress disabled PASS')

// M4.11 — Living Tree Instrument. These are presentation/interaction
// invariants only: topology, documentary correspondences, and realm shader
// grammar remain owned by their existing independent layers.
const treeInstrumentText = await fs.readFile(path.join(root, 'src/components/TreeInstrumentField.jsx'), 'utf8')
const treeOfLifeText = await fs.readFile(path.join(root, 'src/components/TreeOfLife.jsx'), 'utf8')
const sephirahText = await fs.readFile(path.join(root, 'src/components/Sephirah.jsx'), 'utf8')
const pathSegmentText = await fs.readFile(path.join(root, 'src/components/PathSegment.jsx'), 'utf8')
const livingPathFieldText = await fs.readFile(path.join(root, 'src/components/LivingPathField.jsx'), 'utf8')
const livingPathShaderText = await fs.readFile(path.join(root, 'src/shaders/livingPaths.js'), 'utf8')

assert(treeOfLifeText.includes('<TreeInstrumentField'), 'M4.11 requires the non-topological astrolabe field behind the canonical graph')
assert(treeOfLifeText.includes('resonantIds') && treeOfLifeText.includes('resonant={resonantIds.has(node.id)}'), 'M4.11 requires graph-aware neighbor resonance rather than blanket dimming')
assert(treeInstrumentText.includes('does not add') && treeInstrumentText.includes('historical attributions'), 'M4.11 instrument field must explicitly remain interpretive visual grammar')
assert(treeInstrumentText.includes("[-2.15, 0, 2.15]") && treeInstrumentText.includes('pulseA'), 'M4.11 requires subtle pillar guides plus a breathing astrolabe field')
assert(sephirahText.includes('numberCrown') && sephirahText.includes('Array.from({ length: node.number }'), 'M4.11 focused Sephirah must carry its topology-derived numerical bead crown')
assert(sephirahText.includes('resonant = false') && sephirahText.includes('resonant ? 0.82'), 'M4.11 directly connected Sephiroth must remain visibly resonant')
assert(treeOfLifeText.includes('<LivingPathField'), 'M4.16 must preserve M4.11 path currents through the shared living field')
assert(livingPathShaderText.includes('currentHead') && livingPathShaderText.includes('direction'), 'M4.16 focused/operative paths require directional multi-current light flow')
assert(appText.includes('tree-focus-active') && appText.includes('paths resonate'), 'M4.11 DOM manuscript layer must react to graph invocation state')
assert(stylesText.includes('M4.11 — LIVING TREE INSTRUMENT'), 'M4.11 family UI refinement marker missing')
assert(!treeInstrumentText.includes('Math.random('), 'M4.11 Tree instrument field must remain deterministic')
console.log('M4.11 Living Tree Instrument: astrolabe field + graph-aware resonance + numerical crowns PASS')
console.log('M4.11 Path currents + manuscript focus choreography PASS')

// M4.12 — motion-safe recursive navigation + complete documentary path lens.
const navigationText = await fs.readFile(path.join(root, 'src/hooks/useFractalNavigation.js'), 'utf8')
const pathPanelM412Text = await fs.readFile(path.join(root, 'src/components/PathInfoPanel.jsx'), 'utf8')
const experienceM412Text = await fs.readFile(path.join(root, 'src/components/Experience.jsx'), 'utf8')
const treeM412Text = await fs.readFile(path.join(root, 'src/components/TreeOfLife.jsx'), 'utf8')

assert(Object.keys(HERMETIC_PATHS_777).length === 22, 'M4.12 documentary path atlas must cover all twenty-two topological paths')
for (const pathRecord of PATHS) {
  const documentary = HERMETIC_PATHS_777[pathRecord.id]
  assert(documentary, `M4.12 missing documentary path ${pathRecord.id}`)
  assert(Number.isInteger(documentary.keyScale) && documentary.keyScale >= 11 && documentary.keyScale <= 32, `M4.12 invalid key scale on ${pathRecord.id}`)
  assert(documentary.letter && documentary.letterName && documentary.cosmicAttribution && documentary.tarot, `M4.12 incomplete documentary path ${pathRecord.id}`)
  assert(documentary.provenance?.some((reference) => reference.sourceId === 'crowley-777-paths-11-32'), `M4.12 path ${pathRecord.id} lacks complete-atlas provenance`)
}
assert(navigationText.includes('MAX_QUEUED_ZOOM') && navigationText.includes('desiredVelocity'), 'M4.12 raw gesture input must be queued and consumed by a per-frame velocity governor')
assert(navigationText.includes('Coalesced Android events') && navigationText.includes('THREE.MathUtils.clamp(event.clientY - lastY, -72, 72)'), 'M4.12 must bound dropped-frame/coalesced pointer deltas')
assert(realmComponentText.includes('motionHeadroom') && realmComponentText.includes('boundaryHeadroom'), 'M4.12 realm rendering must reserve temporary GPU headroom while recursive law is moving')
assert(pathComponentText.includes('gestureLoad') && pathComponentText.includes('boundaryHeadroom'), 'M4.12 path metamorphosis must share the motion-safe quality envelope')
assert(treeM412Text.includes('HERMETIC_PATHS_777') && treeM412Text.includes('documentaryPathLens'), 'M4.12 Tree must expose the complete documentary path lens independently from topology')
assert(pathSegmentText.includes('path-glyph-inscription') && pathSegmentText.includes('inspectable && connected'), 'M4.12 connected Study paths must expose moving letter/cosmic inscriptions without intercepting unrelated Tree input')
assert(pathPanelM412Text.includes('PATH LENS · DOCUMENTARY / TOPOLOGICAL') && pathPanelM412Text.includes('metamorphosis not yet forged'), 'M4.12 must distinguish inspectable canonical paths from actually traversable path operators')
assert(experienceM412Text.includes('documentaryPathLens'), 'M4.12 documentary lens state must reach the macro Tree renderer')
assert(stylesText.includes('M4.12 — MOTION-SAFE DESCENT + PATH LENS'), 'M4.12 visual path-lens marker missing')
console.log('M4.12 motion-safe descent: queued input + bounded recursive transitions + interaction headroom PASS')
console.log('M4.12 complete 22-path Study lens: Hebrew letters + cosmic attributions + inspectable/traversable separation PASS')

// M4.16 — generated-realm efficiency + living 22-path substrate.
const createRealmProgramText = await fs.readFile(path.join(root, 'src/shaders/createRealmProgram.js'), 'utf8')
const canvasTelemetryText = await fs.readFile(path.join(root, 'src/components/CanvasTelemetry.jsx'), 'utf8')
const qaOverlayText = await fs.readFile(path.join(root, 'src/components/QaTelemetryOverlay.jsx'), 'utf8')
const stabilityHarnessText = await fs.readFile(path.join(root, 'scripts/stability-harness.mjs'), 'utf8')

for (const symbol of ['createRealmDomain', 'realmDomainRotation', 'mapPhysicalLocal', 'mapGlyphLocal']) {
  assert(createRealmProgramText.includes(symbol), `M4.16 generated realm optimization is missing ${symbol}`)
}
assert(!createRealmProgramText.includes('vec2 mapFields'), 'M4.16 generated normals must not retain the combined physical/glyph dispatcher')
const normalSource = createRealmProgramText.slice(
  createRealmProgramText.indexOf('vec3 calcNormal'),
  createRealmProgramText.indexOf('float raymarch'),
)
assert(normalSource.includes('mapPhysical') && !normalSource.includes('mapGlyph'), 'M4.16 normal probes must evaluate physical geometry only')
assert(createRealmProgramText.includes('mod(float(i), 2.0)') && createRealmProgramText.includes('0.0130, 0.0250'), 'M4.16 generated glyph field must use compensated alternating-step accumulation')

const ketherProgram = (await import('../src/shaders/realms/kether.js')).default
for (const motif of ['sdTesseractFrameLike', 'crownA', 'crownB', 'crownCell', 'uDepthStage', 'uDepthEpoch']) {
  assert(ketherProgram.fragment.includes(motif), `M4.16 Kether optimization removed accepted motif ${motif}`)
}
assert(ketherProgram.fragment.includes('mix(40.0, 66.0'), 'M4.16 must not hide Kether cost by lowering its accepted quality envelope')

const grammars = PATHS.map((pathRecord) => createPathVisualGrammar(pathRecord, HERMETIC_PATHS_777[pathRecord.id]))
const familyCounts = Object.fromEntries(Object.values(PATH_MOTION_FAMILY).map((family) => [family, 0]))
for (const grammar of grammars) familyCounts[grammar.family] += 1
assert(familyCounts.elemental === 3, `M4.16 requires exactly 3 elemental paths, got ${familyCounts.elemental}`)
assert(familyCounts.planetary === 7, `M4.16 requires exactly 7 planetary paths, got ${familyCounts.planetary}`)
assert(familyCounts.zodiacal === 12, `M4.16 requires exactly 12 zodiacal paths, got ${familyCounts.zodiacal}`)
assert(new Set(grammars.map((grammar) => `${grammar.family}:${grammar.variant}:${grammar.harmonic}:${grammar.rate}:${grammar.phase}`)).size === 22, 'M4.16 every path requires a deterministic signature inside its family law')
assert(!pathSegmentText.includes('useFrame'), 'M4.16 PathSegment must not restore 22 independent frame callbacks')
assert((livingPathFieldText.match(/useFrame\(/g) ?? []).length === 1, 'M4.16 living path field requires one shared timing controller')
assert((livingPathFieldText.match(/<instancedMesh/g) ?? []).length === 2, 'M4.16 path presentation requires the two-draw instanced core/halo field')
for (const law of ['elementalLaw', 'planetaryLaw', 'zodiacalLaw']) {
  assert(livingPathShaderText.includes(law), `M4.16 path shader is missing ${law}`)
}
assert(pathSegmentText.includes('transform sprite') && pathSegmentText.includes('lang="he"'), 'M4.16 Hebrew signatures must remain correct and spatially anchored')
assert(Object.keys(PATH_OPERATORS).length === 2, 'M4.16 must not promote the remaining documentary paths into fake operators')

for (const metric of ['currentFrameMs', 'frameP50Ms', 'frameP95Ms', 'hitchCount', 'frameSampleCount', 'frameScope']) {
  assert(canvasTelemetryText.includes(metric) && qaOverlayText.includes(metric), `M4.16 QA report is missing ${metric}`)
}
assert(canvasTelemetryText.includes('frameTimes.current = []') && experienceText.includes('telemetryScope'), 'M4.16 rolling history must reset at renderer-scope boundaries')
for (const harnessInvariant of [
  'fold-open-landscape',
  'fold-cover-portrait',
  "setDocumentaryMode('hermetic777')",
  "hebrewIdentity?.text === 'ת'",
  'for (const sourceId of [operator.from, operator.to])',
  'REALM_SHADER_FAMILIES[realmId]',
]) {
  assert(stabilityHarnessText.includes(harnessInvariant), `M4.16 browser harness is missing ${harnessInvariant}`)
}
console.log('M4.16 generated realms: physical/glyph separation + invariant domain hoist PASS')
console.log('M4.16 Kether: crown/tesseract/depth grammar preserved without quality-threshold reduction PASS')
console.log('M4.16 living path grammar: elemental 3 / planetary 7 / zodiacal 12 PASS')
console.log('M4.16 living path renderer: 22 signatures / 2 instanced draws / 1 shared clock PASS')
console.log('M4.16 operator readiness: topology/documentary/visual/operative separation PASS')
console.log('M4.16 QA telemetry: current / mean / p50 / p95 / hitches PASS')



// M4.13 — deterministic first light. A slow mobile GPU must never be
// automatically remounted by a wall-clock timer. The canonical Tree paints
// first at a conservative DPR; ornamentation and speculative shader work wake
// only after actual Tree frames have been presented.
const awakeningText = await fs.readFile(path.join(root, 'src/components/TreeAwakening.jsx'), 'utf8')
assert(!appText.includes('treeBootWatchdog'), 'M4.13 must remove the destructive first-light auto-remount watchdog')
assert(appText.includes('treeFirstLightStalled') && appText.includes('retryTreeFirstLight'), 'M4.13 requires deliberate first-light retry instead of hidden remounting')
assert(appText.includes('treeOrnamentsReady') && appText.includes('setTreeOrnamentsReadyNonce'), 'M4.13 must stage macro ornaments after canonical first light')
assert(experienceText.includes('treeOrnamentsEnabled ? DPR_RANGE : 1'), 'M4.13 canonical first light must begin at DPR 1')
assert(experienceText.includes('frameloop="always"'), 'M4.13 must make the Tree frame-delivery contract explicit')
assert(experienceText.includes('treeOrnamentsEnabled ? <ProceduralStars /> : null'), 'M4.13 stars must defer until the Tree is visibly established')
assert(treeOfLifeText.includes('ornamentsEnabled ? <TreeInstrumentField'), 'M4.13 astrolabe field must defer without being removed')
assert(treeProbeText.includes('requestAnimationFrame') && treeProbeText.includes('frames = 2'), 'M4.13 Tree readiness must use a short real-frame probe followed by presentation RAF')
assert(awakeningText.includes('FIRST LIGHT IS DELAYED') && awakeningText.includes('onRetry'), 'M4.13 delayed first light must expose a deliberate living-seal retry')
assert(stylesText.includes('M4.13 — DETERMINISTIC FIRST LIGHT'), 'M4.13 first-light styling marker missing')
console.log('M4.13 deterministic first light: no auto-remount + staged macro ornaments + deliberate reseat PASS')
