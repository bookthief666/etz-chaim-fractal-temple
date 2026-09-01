import { SEPHIRAH_BY_ID } from '../data/treeTopology.js'
import { phaseClassName, RUNTIME_PHASE } from '../runtime/phases.js'

export default function TransitionGate({ phase, selected, pathJourney }) {
  if (phase !== RUNTIME_PHASE.INGRESS && phase !== RUNTIME_PHASE.RETURN) return null

  const returning = phase === RUNTIME_PHASE.RETURN
  const pathSource = pathJourney ? SEPHIRAH_BY_ID[pathJourney.sourceId] : null
  const pathDestination = pathJourney ? SEPHIRAH_BY_ID[pathJourney.destinationId] : null
  const pathTransit = !returning && pathJourney && pathSource && pathDestination

  const kicker = returning
    ? 'ASCENSUS · RETURN'
    : pathTransit
      ? 'TRANSITUS · OPERATIVE PATH'
      : 'INGRESSUS · SEPHIRAH'

  const title = returning
    ? 'Return to the Living Tree'
    : pathTransit
      ? `${pathSource.name} → ${pathDestination.name}`
      : selected?.name ?? 'Opening the Sphere'

  const subtitle = returning
    ? 'The local geometry releases its hold.'
    : pathTransit
      ? pathJourney.label
      : selected
        ? `${selected.hebrew} · ${selected.gloss}`
        : 'The mathematical field is being seated.'

  const ritualWords = returning
    ? ['release', 'remember', 'recompose']
    : pathTransit
      ? ['depart', 'transmute', 'arrive']
      : ['attend', 'cross', 'become']

  return (
    <div className={`transition-gate transition-${phaseClassName(phase)}`} aria-live="polite" aria-label={title}>
      <div className="transition-gate-aura" aria-hidden="true" />
      <div className="transition-ray-field" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} style={{ '--ray': index }} />
        ))}
      </div>
      <div className="transition-gate-mark" aria-hidden="true">
        <span className="transition-ring ring-a" />
        <span className="transition-ring ring-b" />
        <span className="transition-ring ring-c" />
        <span className="transition-gate-star">{pathTransit ? '◇' : returning ? '✦' : '✶'}</span>
        {!returning && selected?.hebrew ? <span className="transition-hebrew">{selected.hebrew}</span> : null}
      </div>
      <div className="transition-rite-words" aria-hidden="true">
        {ritualWords.map((word, index) => <span key={word} style={{ '--word': index }}>{word}</span>)}
      </div>
      <div className="transition-gate-copy">
        <p>{kicker}</p>
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
    </div>
  )
}
