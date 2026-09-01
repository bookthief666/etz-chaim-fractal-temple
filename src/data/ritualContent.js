/**
 * Original contemplative language for this instrument.
 *
 * These phrases are NOT quotations from historical sources and are never shown
 * as documentary attributions. They are deliberately concise so the ritual
 * layer supports attention instead of covering the procedural field.
 */
export const REALM_RITUALS = {
  kether: {
    threshold: 'Before number, attend to the point from which number can arise.',
    stages: [
      'Do not seize the crown. Notice the stillness that precedes distinction.',
      'Let radiance become interior without becoming an object.',
      'A crown appears within the crown; scale no longer decides what is first.',
      'At the luminous limit, release even the image of unity.',
    ],
  },
  chokmah: {
    threshold: 'Meet force before it accepts a boundary.',
    stages: [
      'Attend to impulse before direction hardens into intention.',
      'Follow the current without asking it to become a thing.',
      'Force generates force; origin becomes propagation.',
      'At the eruption, distinguish power from possession.',
    ],
  },
  binah: {
    threshold: 'Enter the condition by which anything can take form.',
    stages: [
      'A boundary is not merely a refusal; it makes an inside possible.',
      'Remain with enclosure until weight becomes intelligible.',
      'Chamber opens inside chamber without abolishing the wall.',
      'At the great containment, ask what form costs and what it grants.',
    ],
  },
  chesed: {
    threshold: 'Enter expansion that does not abandon measure.',
    stages: [
      'Let measure become generosity rather than restriction.',
      'Observe order increasing as the field opens.',
      'Abundance repeats without losing proportion.',
      'At plenitude, ask what can increase without becoming excess.',
    ],
  },
  geburah: {
    threshold: 'Enter the cut that makes an act exact.',
    stages: [
      'Name the edge before you cross it.',
      'Fivefold force separates signal from excess.',
      'The sword becomes a corridor: discrimination repeats at every scale.',
      'At recursive severity, cut only what obscures the act.',
    ],
  },
  tiphareth: {
    threshold: 'Approach the center that can hold difference in proportion.',
    stages: [
      'Let the solar point orient the field without consuming it.',
      'Sixfold balance surrounds the center without imprisoning it.',
      'Harmony becomes recursive: each relation contains another relation.',
      'At the solar temple, reconcile without flattening the opposed powers.',
    ],
  },
  netzach: {
    threshold: 'Enter the current that knows attraction before explanation.',
    stages: [
      'Notice what draws attention before you name why.',
      'Let desire move as current rather than command.',
      'The garden repeats by growth, not by copying.',
      'At desire within desire, ask what persists when the object changes.',
    ],
  },
  hod: {
    threshold: 'Enter the crystal in which experience becomes articulate.',
    stages: [
      'Receive the signal before arranging it into a system.',
      'A grammar appears; notice what it clarifies and what it excludes.',
      'The lattice describes itself at another scale.',
      'At language within language, do not confuse the map with the field.',
    ],
  },
  yesod: {
    threshold: 'Enter the image that persists long enough to become a world.',
    stages: [
      'Let reflection remain reflection without dismissing its force.',
      'Nine moons repeat one hidden rhythm.',
      'Phase becomes corridor; image acquires depth through relation.',
      'At image within image, ask what carries the pattern between appearances.',
    ],
  },
  malkuth: {
    threshold: 'Enter the place where relation acquires weight.',
    stages: [
      'Meet manifestation before calling it merely solid.',
      'Four gates organize multiplicity into a field of consequence.',
      'Mineral corridors give resistance a geometry.',
      'At crystal within crystal, find the abstract law still living in matter.',
    ],
  },
}

export const PATH_RITUALS = {
  geburah__tiphareth: {
    forward: [
      'Carry the edge without worshipping the wound.',
      'Let fivefold force discover proportion.',
      'The cut begins to sing as relation.',
      'Enter the solar field with discrimination intact.',
    ],
    reverse: [
      'Leave harmony without abandoning its measure.',
      'Let relation sharpen into decision.',
      'The solar field contracts toward an exact edge.',
      'Enter fivefold force without losing the center.',
    ],
  },
  yesod__malkuth: {
    forward: [
      'Carry the image toward resistance.',
      'Phase slows; reflection begins to hold a boundary.',
      'The lunar field crystallizes into consequence.',
      'Enter manifestation without forgetting its imaginal root.',
    ],
    reverse: [
      'Let the solid disclose its hidden rhythm.',
      'Resistance loosens into relation.',
      'Crystal returns to phase and reflective depth.',
      'Enter the lunar field carrying the memory of matter.',
    ],
  },
}

export function getRealmRitual(sephirahId) {
  return REALM_RITUALS[sephirahId] ?? null
}

export function getPathRitual(pathJourney) {
  if (!pathJourney) return null
  const ritual = PATH_RITUALS[pathJourney.id]
  if (!ritual) return null
  return pathJourney.reversed ? ritual.reverse : ritual.forward
}
