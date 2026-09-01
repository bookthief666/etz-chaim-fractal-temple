/**
 * Documentary Hermetic path atlas for the selected 22-edge Tree glyph.
 *
 * This reception layer is deliberately independent from treeTopology.js and
 * PATH_OPERATORS. Hebrew letters / Yetziratic attributions are documentary
 * claims; whether a path has an implemented fractal metamorphosis is a separate
 * application capability.
 *
 * The Tarot labels use the 777 / Golden Dawn-era baseline. Later Crowleyan
 * renamings and the post-Liber-AL Heh/Tzaddi switch are not silently folded into
 * this table; those variants can be represented as a separate reception layer.
 */
const SOURCE = [{ sourceId: 'crowley-777-paths-11-32', fields: ['keyScale', 'letter', 'letterName', 'cosmicAttribution', 'tarot', 'joins'] }]

const records = [
  ['kether__chokmah', 11, 'א', 'Aleph', 'Air', 'AIR', 'The Fool', '1–2'],
  ['kether__binah', 12, 'ב', 'Beth', 'Mercury', '☿', 'The Magician', '1–3'],
  ['kether__tiphareth', 13, 'ג', 'Gimel', 'Moon', '☾', 'The High Priestess', '1–6'],
  ['chokmah__binah', 14, 'ד', 'Daleth', 'Venus', '♀', 'The Empress', '2–3'],
  ['chokmah__tiphareth', 15, 'ה', 'Heh', 'Aries', '♈', 'The Emperor', '2–6'],
  ['chokmah__chesed', 16, 'ו', 'Vav', 'Taurus', '♉', 'The Hierophant', '2–4'],
  ['binah__tiphareth', 17, 'ז', 'Zayin', 'Gemini', '♊', 'The Lovers', '3–6'],
  ['binah__geburah', 18, 'ח', 'Cheth', 'Cancer', '♋', 'The Chariot', '3–5'],
  ['chesed__geburah', 19, 'ט', 'Teth', 'Leo', '♌', 'Strength', '4–5'],
  ['chesed__tiphareth', 20, 'י', 'Yod', 'Virgo', '♍', 'The Hermit', '4–6'],
  ['chesed__netzach', 21, 'כ', 'Kaph', 'Jupiter', '♃', 'Wheel of Fortune', '4–7'],
  ['geburah__tiphareth', 22, 'ל', 'Lamed', 'Libra', '♎', 'Justice', '5–6'],
  ['geburah__hod', 23, 'מ', 'Mem', 'Water', 'WATER', 'The Hanged Man', '5–8'],
  ['tiphareth__netzach', 24, 'נ', 'Nun', 'Scorpio', '♏', 'Death', '6–7'],
  ['tiphareth__yesod', 25, 'ס', 'Samekh', 'Sagittarius', '♐', 'Temperance', '6–9'],
  ['tiphareth__hod', 26, 'ע', 'Ayin', 'Capricorn', '♑', 'The Devil', '6–8'],
  ['netzach__hod', 27, 'פ', 'Peh', 'Mars', '♂', 'The Blasted Tower', '7–8'],
  ['netzach__yesod', 28, 'צ', 'Tzaddi', 'Aquarius', '♒', 'The Star', '7–9'],
  ['netzach__malkuth', 29, 'ק', 'Qoph', 'Pisces', '♓', 'The Moon', '7–10'],
  ['hod__yesod', 30, 'ר', 'Resh', 'Sun', '☉', 'The Sun', '8–9'],
  ['hod__malkuth', 31, 'ש', 'Shin', 'Fire', 'FIRE', 'Judgement', '8–10'],
  ['yesod__malkuth', 32, 'ת', 'Tav', 'Saturn', '♄', 'The Universe', '9–10'],
]

export const HERMETIC_PATHS_777 = Object.fromEntries(records.map(([
  id, keyScale, letter, letterName, cosmicAttribution, cosmicGlyph, tarot, joins,
]) => [id, {
  keyScale,
  letter,
  letterName,
  cosmicAttribution,
  cosmicGlyph,
  tarot,
  joins,
  provenance: SOURCE,
  editorialNote: keyScale === 15 || keyScale === 28
    ? 'This is the 777 / Golden Dawn-era baseline. Crowley later altered the Emperor/Star zodiacal arrangement; that later reception layer is kept distinct.'
    : 'Documentary 777-era path layer; custom shader/path operators remain independent visual mathematics.',
}]))
