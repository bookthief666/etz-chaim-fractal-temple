/**
 * Documentary source registry for the study layer.
 *
 * These records describe witnesses used for historical/reception claims only.
 * They must never be imported by topology or shader code as authority for the
 * mathematical design grammar.
 */
export const SOURCE_CATALOG = {
  'crowley-777-paths-11-32': {
    id: 'crowley-777-paths-11-32',
    shortLabel: '777 · paths 11–32',
    author: 'Aleister Crowley',
    title: 'Liber 777 Revised',
    locator: 'Table I, key scales 11–32; Hebrew-letter, Yetziratic-attribution, path-joining, and general Tarot columns',
    scope: 'Documentary Hebrew letters, element/planet/zodiac attributions, canonical joins, and 777-era Tarot titles for the twenty-two paths.',
    witness: 'Revised correspondence tables / Book 4 Appendix V table witness',
  },
  'crowley-777-table-i': {
    id: 'crowley-777-table-i',
    shortLabel: '777 · Table I',
    author: 'Aleister Crowley',
    title: 'Liber 777 Revised',
    locator: 'Table I, cols. I–VII, key scales 1–10',
    scope: 'Sephirothic key scale, God-Names in Assiah, and heavens/cosmic attributions.',
    witness: 'Revised correspondence tables',
  },
  'crowley-777-table-iv': {
    id: 'crowley-777-table-iv',
    shortLabel: '777 · Table IV',
    author: 'Aleister Crowley',
    title: 'Liber 777 Revised',
    locator: 'Table IV, cols. XCIX–CI, rows 1–10',
    scope: 'Archangels of Assiah and Angels/Orders of Assiah.',
    witness: 'Revised correspondence tables',
  },
  'crowley-lviii-79': {
    id: 'crowley-lviii-79',
    shortLabel: 'LVIII · p.79',
    author: 'Aleister Crowley',
    title: 'Liber LVIII — Qabalah',
    locator: 'The Temple of Solomon the King, pagination marker {79}',
    scope: 'Prose sequence printing Aishim at Yesod and Kerubim at Malkuth; retained as a textual variant.',
    witness: 'Class B publication / Temple of Solomon the King',
  },
  'crowley-777-path-22': {
    id: 'crowley-777-path-22',
    shortLabel: '777 · key 22',
    author: 'Aleister Crowley',
    title: 'Liber 777 Revised',
    locator: 'Table I, key scale 22; cols. II, VII, XII, XIV',
    scope: 'Lamed; Libra; path joining 5–6; general Tarot attribution Justice.',
    witness: 'Revised correspondence tables',
  },
  'crowley-777-path-32': {
    id: 'crowley-777-path-32',
    shortLabel: '777 · key 32',
    author: 'Aleister Crowley',
    title: 'Liber 777 Revised',
    locator: 'Table I, key scale 32; cols. II, VII, XII, XIV',
    scope: 'Tau/Tav; Saturn; path joining 9–10; general Tarot attribution The Universe.',
    witness: 'Revised correspondence tables',
  },
}

export function getSources(provenance = []) {
  return provenance
    .map((reference) => ({ ...SOURCE_CATALOG[reference.sourceId], ...reference }))
    .filter((source) => source.id)
}
