import { PHASE_ONE_VISUALS } from './visualGrammar.js'

export const FAMILY_PALETTE = {
  void: '#05030f',
  voidWarm: '#070403',
  obsidian: '#090814',
  parchment: '#f1e7c9',
  parchmentDim: '#bcb29c',
  lux: '#d8dcf2',
  luxDim: '#9298b8',
  gold: '#d9b86d',
  goldHot: '#ffdf73',
  crimson: '#ff405d',
  wine: '#6f102a',
}

function normalizeHex(hex) {
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toLowerCase() : FAMILY_PALETTE.gold
}

export function hexToRgbTriplet(hex) {
  const value = normalizeHex(hex).slice(1)
  return `${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)}`
}

export function getUiTheme({ focusedId, selectedId, pathJourney }) {
  const primaryId = selectedId ?? focusedId ?? pathJourney?.sourceId ?? 'tiphareth'
  const secondaryId = pathJourney?.destinationId ?? primaryId
  const primary = PHASE_ONE_VISUALS[primaryId] ?? PHASE_ONE_VISUALS.tiphareth
  const secondary = PHASE_ONE_VISUALS[secondaryId] ?? primary

  return {
    '--temple-accent': primary.accent,
    '--temple-accent-core': primary.core,
    '--temple-accent-aura': primary.aura,
    '--temple-accent-rgb': hexToRgbTriplet(primary.accent),
    '--temple-accent-core-rgb': hexToRgbTriplet(primary.core),
    '--temple-accent-2': secondary.accent,
    '--temple-accent-2-rgb': hexToRgbTriplet(secondary.accent),
  }
}
