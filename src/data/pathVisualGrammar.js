/**
 * M4.16 interpretive path-motion grammar.
 *
 * This layer reads documentary cosmic attributions only to choose a visual
 * family. The resulting propagation/orbit/phase-gate behavior is original
 * presentation mathematics, not a claim that a historical source prescribed
 * these animations. Topology and operative capability remain elsewhere.
 */

export const PATH_MOTION_FAMILY = Object.freeze({
  ELEMENTAL: 'elemental',
  PLANETARY: 'planetary',
  ZODIACAL: 'zodiacal',
})

export const PATH_MOTION_FAMILY_CODE = Object.freeze({
  [PATH_MOTION_FAMILY.ELEMENTAL]: 0,
  [PATH_MOTION_FAMILY.PLANETARY]: 1,
  [PATH_MOTION_FAMILY.ZODIACAL]: 2,
})

const ELEMENTAL_SIGNATURES = Object.freeze({
  Air: { variant: 0, harmonic: 3.0, rate: 0.20, curvature: 0.34 },
  Water: { variant: 1, harmonic: 2.0, rate: 0.12, curvature: 0.72 },
  Fire: { variant: 2, harmonic: 5.0, rate: 0.27, curvature: 0.18 },
})

const PLANETARY_SIGNATURES = Object.freeze({
  Mercury: { variant: 0, harmonic: 8.0, rate: 0.29, curvature: 0.62 },
  Moon: { variant: 1, harmonic: 2.0, rate: 0.11, curvature: 0.84 },
  Venus: { variant: 2, harmonic: 5.0, rate: 0.15, curvature: 0.50 },
  Jupiter: { variant: 3, harmonic: 4.0, rate: 0.09, curvature: 0.30 },
  Mars: { variant: 4, harmonic: 5.0, rate: 0.24, curvature: 0.22 },
  Sun: { variant: 5, harmonic: 6.0, rate: 0.13, curvature: 0.16 },
  Saturn: { variant: 6, harmonic: 3.0, rate: 0.065, curvature: 0.14 },
})

const ZODIAC_SIGNS = Object.freeze([
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
])

function stableUnit(text) {
  let value = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return (value >>> 0) / 4294967295
}

export function getPathMotionFamily(cosmicAttribution) {
  if (ELEMENTAL_SIGNATURES[cosmicAttribution]) return PATH_MOTION_FAMILY.ELEMENTAL
  if (PLANETARY_SIGNATURES[cosmicAttribution]) return PATH_MOTION_FAMILY.PLANETARY
  if (ZODIAC_SIGNS.includes(cosmicAttribution)) return PATH_MOTION_FAMILY.ZODIACAL
  throw new Error(`Unsupported documentary path attribution: ${cosmicAttribution}`)
}

export function createPathVisualGrammar(path, documentary) {
  if (!path || !documentary) throw new Error('Path visual grammar requires topology and documentary records')

  const family = getPathMotionFamily(documentary.cosmicAttribution)
  const phase = stableUnit(`${path.id}:${documentary.keyScale}`)
  let signature

  if (family === PATH_MOTION_FAMILY.ELEMENTAL) {
    signature = ELEMENTAL_SIGNATURES[documentary.cosmicAttribution]
  } else if (family === PATH_MOTION_FAMILY.PLANETARY) {
    signature = PLANETARY_SIGNATURES[documentary.cosmicAttribution]
  } else {
    const signIndex = ZODIAC_SIGNS.indexOf(documentary.cosmicAttribution)
    signature = {
      variant: signIndex,
      // Sign identity changes segmentation while modality and polarity change
      // the actual gate equation—not merely its color or phase offset.
      harmonic: 3.0 + (signIndex % 6),
      rate: 0.075 + (signIndex % 4) * 0.022,
      curvature: (signIndex % 3) / 2,
    }
  }

  return Object.freeze({
    pathId: path.id,
    family,
    familyCode: PATH_MOTION_FAMILY_CODE[family],
    attribution: documentary.cosmicAttribution,
    variant: signature.variant,
    harmonic: signature.harmonic,
    rate: signature.rate,
    curvature: signature.curvature,
    phase,
    keyScale: documentary.keyScale,
    interpretive: true,
  })
}

