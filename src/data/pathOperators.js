/**
 * M3B path-transformation prototypes.
 *
 * These records are interaction / shader design grammar, not historical
 * attributions to the 22 paths. Topology remains in treeTopology.js and
 * provenance-bearing Hebrew/Tarot/astrological systems remain independent.
 */
export const PATH_OPERATORS = {
  geburah__tiphareth: {
    id: 'geburah__tiphareth',
    label: 'Severity into Harmony',
    reversible: true,
    from: 'geburah',
    to: 'tiphareth',
    operatorKind: 'five-to-six-harmonic',
    shaderKind: 1,
    visualLaw: 'Cutting pentagram edges phase-lock into a sixfold solar field.',
    mathLaw: 'Interpolate fivefold angular repetition toward sixfold symmetry while reducing hard cutting and increasing harmonic rings.',
    paletteLaw: 'Scarlet / ember force resolves toward gold / white solar radiance.',
    forwardRite: ['Fivefold departure', 'Edges phase-lock', 'Sixfold threshold', 'Solar arrival'],
    reverseRite: ['Solar departure', 'Harmony sharpens', 'Fivefold threshold', 'Martial arrival'],
    forwardPrompt: 'What changes when force becomes proportion without ceasing to be force?',
    reversePrompt: 'What must harmony discriminate in order to become an exact act?',
  },
  yesod__malkuth: {
    id: 'yesod__malkuth',
    label: 'Image into Manifestation',
    reversible: true,
    from: 'yesod',
    to: 'malkuth',
    operatorKind: 'phase-to-crystal',
    shaderKind: 2,
    visualLaw: 'Lunar interference condenses into mineral lattice and fourfold material gates.',
    mathLaw: 'Reduce phase displacement while increasing cell repetition, angular crystallization, and stratified density.',
    paletteLaw: 'Violet / cyan reflection precipitates toward citrine / olive / russet / black materiality.',
    forwardRite: ['Lunar departure', 'Condensation', 'Crystalline threshold', 'Manifest arrival'],
    reverseRite: ['Material departure', 'Dissolution', 'Lunar threshold', 'Imaginal arrival'],
    forwardPrompt: 'At what point does an image acquire resistance, weight, and consequence?',
    reversePrompt: 'What remains of matter when its apparent solidity is allowed to become image again?',
  },
}

export const PATH_OPERATOR_IDS = Object.keys(PATH_OPERATORS)

export function getDirectedPathOperator(pathId, sourceId) {
  const operator = PATH_OPERATORS[pathId]
  if (!operator) return null
  if (sourceId !== operator.from && sourceId !== operator.to) return null

  const reversed = sourceId === operator.to
  return {
    ...operator,
    reversed,
    sourceId,
    destinationId: reversed ? operator.from : operator.to,
    rite: reversed ? operator.reverseRite : operator.forwardRite,
    prompt: reversed ? operator.reversePrompt : operator.forwardPrompt,
  }
}
