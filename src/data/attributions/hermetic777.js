/**
 * Hermetic reception-layer correspondences for the ten Sephiroth.
 *
 * IMPORTANT EPISTEMIC NOTE
 * ------------------------
 * These are Golden Dawn / Crowleyan-Hermetic correspondences, not a claim
 * that Jewish Kabbalistic sources present the Sephiroth in this exact form.
 * Documentary claims carry locator-bearing provenance. `ritualKey` remains an
 * interpretive synopsis written for this instrument and is not source text.
 */
export const HERMETIC_777_SYSTEM = {
  id: 'hermetic-777-sephiroth',
  label: 'Hermetic · 777',
  shortLabel: '777',
  tradition: 'Hermetic Qabalah / Golden Dawn reception',
  status: 'source-locked-primary-witnesses',
  sourceNote:
    'Displayed correspondences are keyed to Crowley’s Liber 777 Revised tables. Liber LVIII is retained separately where it witnesses a conflicting Yesod/Malkuth angelic-order sequence.',
}

const tableProvenance = (row, withVariant = false) => [
  {
    sourceId: 'crowley-777-table-i',
    locator: `key scale ${row}`,
    fields: ['divineName', 'cosmicAttribution'],
  },
  {
    sourceId: 'crowley-777-table-iv',
    locator: `row ${row}`,
    fields: ['archangel', 'angelicOrder'],
  },
  ...(withVariant
    ? [{ sourceId: 'crowley-lviii-79', fields: ['disputedNote'] }]
    : []),
]

export const HERMETIC_777 = {
  kether: {
    divineName: 'אהיה · Eheieh',
    archangel: 'Metatron',
    angelicOrder: 'Chaioth ha-Qadesh',
    cosmicAttribution: 'Primum Mobile · First Whirlings',
    ritualKey: 'Unity before distinction',
    provenance: tableProvenance(1),
  },
  chokmah: {
    divineName: 'יה · Yah',
    archangel: 'Ratziel',
    angelicOrder: 'Auphanim',
    cosmicAttribution: 'Zodiac · sphere of fixed stars',
    ritualKey: 'Undivided generative force',
    provenance: tableProvenance(2),
  },
  binah: {
    divineName: 'יהוה אלהים · YHVH Elohim',
    archangel: 'Tzaphqiel',
    angelicOrder: 'Aralim',
    cosmicAttribution: 'Saturn',
    ritualKey: 'Form, limit, enclosure',
    provenance: tableProvenance(3),
  },
  chesed: {
    divineName: 'אל · El',
    archangel: 'Tzadqiel',
    angelicOrder: 'Chasmalim',
    cosmicAttribution: 'Jupiter',
    ritualKey: 'Orderly expansion and beneficence',
    provenance: tableProvenance(4),
  },
  geburah: {
    divineName: 'אלהים גבור · Elohim Gibor',
    archangel: 'Kamael',
    angelicOrder: 'Seraphim',
    cosmicAttribution: 'Mars',
    ritualKey: 'Discrimination, force, severity',
    provenance: tableProvenance(5),
  },
  tiphareth: {
    divineName: 'יהוה אלוה ודעת · YHVH Eloah ve-Daath',
    archangel: 'Raphael',
    angelicOrder: 'Malachim',
    cosmicAttribution: 'Sun',
    ritualKey: 'Mediation, harmony, solar center',
    provenance: tableProvenance(6),
  },
  netzach: {
    divineName: 'יהוה צבאות · YHVH Tzabaoth',
    archangel: 'Haniel',
    angelicOrder: 'Elohim',
    cosmicAttribution: 'Venus',
    ritualKey: 'Desire, attraction, endurance',
    provenance: tableProvenance(7),
  },
  hod: {
    divineName: 'אלהים צבאות · Elohim Tzabaoth',
    archangel: 'Michael',
    angelicOrder: 'Beni Elohim',
    cosmicAttribution: 'Mercury',
    ritualKey: 'Articulation, analysis, symbolic form',
    provenance: tableProvenance(8),
  },
  yesod: {
    divineName: 'שדי אל חי · Shaddai El Chai',
    archangel: 'Gabriel',
    angelicOrder: 'Kerubim',
    cosmicAttribution: 'Moon',
    ritualKey: 'Image, mediation, dream, foundation',
    disputedNote:
      'Liber LVIII prints Aishim at Yesod, while Liber 777 Revised Table IV assigns Kerubim.',
    provenance: tableProvenance(9, true),
  },
  malkuth: {
    divineName: 'אדני מלך · Adonai Melekh',
    archangel: 'Sandalphon',
    angelicOrder: 'Ashim',
    cosmicAttribution: 'Elements · Earth / material field',
    ritualKey: 'Embodiment and manifestation',
    disputedNote:
      'Liber LVIII prints Kerubim at Malkuth, while Liber 777 Revised Table IV assigns Ashim.',
    provenance: tableProvenance(10, true),
  },
}
