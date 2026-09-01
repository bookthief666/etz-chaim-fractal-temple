/**
 * Phase-1 spatial topology.
 *
 * Important: this file describes the chosen Hermetic/Kircher-style glyph as a
 * graph and 3D layout. It intentionally does NOT contain Hebrew-letter, Tarot,
 * astrological, or color-scale attributions. Those belong in independent,
 * provenance-bearing attribution modules.
 */

export const TREE_SYSTEM_ID = 'hermetic-kircher-22-path'

export const SEPHIROTH = [
  { id: 'kether', number: 1, name: 'Kether', hebrew: 'כתר', gloss: 'Crown', position: [0, 4.65, 0] },
  { id: 'chokmah', number: 2, name: 'Chokmah', hebrew: 'חכמה', gloss: 'Wisdom', position: [2.15, 3.45, 0] },
  { id: 'binah', number: 3, name: 'Binah', hebrew: 'בינה', gloss: 'Understanding', position: [-2.15, 3.45, 0] },
  { id: 'chesed', number: 4, name: 'Chesed', hebrew: 'חסד', gloss: 'Mercy', position: [2.15, 1.35, 0] },
  { id: 'geburah', number: 5, name: 'Geburah', hebrew: 'גבורה', gloss: 'Strength / Severity', position: [-2.15, 1.35, 0] },
  { id: 'tiphareth', number: 6, name: 'Tiphareth', hebrew: 'תפארת', gloss: 'Beauty', position: [0, 0.2, 0] },
  { id: 'netzach', number: 7, name: 'Netzach', hebrew: 'נצח', gloss: 'Victory / Endurance', position: [2.15, -1.35, 0] },
  { id: 'hod', number: 8, name: 'Hod', hebrew: 'הוד', gloss: 'Splendor / Glory', position: [-2.15, -1.35, 0] },
  { id: 'yesod', number: 9, name: 'Yesod', hebrew: 'יסוד', gloss: 'Foundation', position: [0, -2.7, 0] },
  { id: 'malkuth', number: 10, name: 'Malkuth', hebrew: 'מלכות', gloss: 'Kingdom', position: [0, -4.55, 0] },
]

// The 22 edges of the selected Hermetic/Kircher-style glyph.
// IDs are topological, never correspondence claims.
export const PATHS = [
  ['kether', 'chokmah'],
  ['kether', 'binah'],
  ['kether', 'tiphareth'],
  ['chokmah', 'binah'],
  ['chokmah', 'tiphareth'],
  ['chokmah', 'chesed'],
  ['binah', 'tiphareth'],
  ['binah', 'geburah'],
  ['chesed', 'geburah'],
  ['chesed', 'tiphareth'],
  ['chesed', 'netzach'],
  ['geburah', 'tiphareth'],
  ['geburah', 'hod'],
  ['tiphareth', 'netzach'],
  ['tiphareth', 'yesod'],
  ['tiphareth', 'hod'],
  ['netzach', 'hod'],
  ['netzach', 'yesod'],
  ['netzach', 'malkuth'],
  ['hod', 'yesod'],
  ['hod', 'malkuth'],
  ['yesod', 'malkuth'],
].map(([a, b]) => ({ id: `${a}__${b}`, a, b }))

export const SEPHIRAH_BY_ID = Object.fromEntries(SEPHIROTH.map((node) => [node.id, node]))
export const PATH_BY_ID = Object.fromEntries(PATHS.map((path) => [path.id, path]))
