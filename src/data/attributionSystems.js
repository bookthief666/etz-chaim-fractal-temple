import { HERMETIC_777, HERMETIC_777_SYSTEM } from './attributions/hermetic777.js'

export const ATTRIBUTION_SYSTEMS = {
  essential: {
    id: 'essential',
    label: 'Essential',
    shortLabel: 'Core',
    description: 'Topology, Hebrew name, number, and literal gloss only.',
  },
  hermetic777: HERMETIC_777_SYSTEM,
}

export const ATTRIBUTION_MODE_ORDER = ['essential', 'hermetic777']

export function getAttribution(mode, sephirahId) {
  if (mode === 'hermetic777') return HERMETIC_777[sephirahId] ?? null
  return null
}
