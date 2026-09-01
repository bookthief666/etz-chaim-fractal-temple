export const RUNTIME_PHASE = Object.freeze({
  THRESHOLD: 'THRESHOLD',
  TREE: 'TREE',
  INGRESS: 'INGRESS',
  REALM: 'REALM',
  PATH: 'PATH',
  RETURN: 'RETURN',
})

export const RUNTIME_PHASES = Object.freeze(Object.values(RUNTIME_PHASE))

export const PHASE_OWNERSHIP = Object.freeze({
  canvas: RUNTIME_PHASES,
  rendererLifecycle: RUNTIME_PHASES,
  qaFrameProbe: RUNTIME_PHASES,
  canonicalTree: [RUNTIME_PHASE.THRESHOLD, RUNTIME_PHASE.TREE, RUNTIME_PHASE.INGRESS, RUNTIME_PHASE.RETURN],
  treeFirstLightProbe: [RUNTIME_PHASE.TREE],
  treeInstrument: [RUNTIME_PHASE.TREE, RUNTIME_PHASE.INGRESS, RUNTIME_PHASE.RETURN],
  cameraDirector: [RUNTIME_PHASE.INGRESS, RUNTIME_PHASE.RETURN],
  realmRenderer: [RUNTIME_PHASE.REALM],
  realmNavigation: [RUNTIME_PHASE.REALM],
  pathRenderer: [RUNTIME_PHASE.PATH],
  pathNavigation: [RUNTIME_PHASE.PATH],
  animatedAtmosphere: [RUNTIME_PHASE.THRESHOLD, RUNTIME_PHASE.TREE, RUNTIME_PHASE.INGRESS, RUNTIME_PHASE.RETURN],
  isolatedAtmosphere: [RUNTIME_PHASE.REALM, RUNTIME_PHASE.PATH],
  transitionGate: [RUNTIME_PHASE.INGRESS, RUNTIME_PHASE.RETURN],
})

export function ownsPhase(owner, phase) {
  return Boolean(PHASE_OWNERSHIP[owner]?.includes(phase))
}

export function phaseClassName(phase) {
  return String(phase).toLowerCase()
}

export function isRitualRuntimePhase(phase) {
  return phase === RUNTIME_PHASE.REALM || phase === RUNTIME_PHASE.PATH
}
