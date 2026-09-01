import { getPathRitual, getRealmRitual } from '../data/ritualContent.js'
import { RUNTIME_PHASE } from '../runtime/phases.js'

export default function RitualCue({ mode, phase, selectedId, depthStage, depthEpoch, pathJourney, pathStage }) {
  if (mode !== 'contemplation') return null

  let phrase = null
  let kicker = null
  let cueKey = null

  if (phase === RUNTIME_PHASE.INGRESS && selectedId) {
    const ritual = getRealmRitual(selectedId)
    phrase = ritual?.threshold
    kicker = 'THRESHOLD'
    cueKey = `realm-entry-${selectedId}`
  } else if (phase === RUNTIME_PHASE.REALM && selectedId) {
    const ritual = getRealmRitual(selectedId)
    phrase = ritual?.stages?.[depthStage]
    kicker = depthEpoch > 0 ? `RECURSION · CYCLE ${depthEpoch + 1}` : 'CONTEMPLATION'
    cueKey = `realm-${selectedId}-${depthStage}-${depthEpoch}`
  } else if (phase === RUNTIME_PHASE.PATH && pathJourney) {
    const ritual = getPathRitual(pathJourney)
    phrase = ritual?.[pathStage]
    kicker = 'PATH RITE'
    cueKey = `path-${pathJourney.id}-${pathJourney.reversed ? 'r' : 'f'}-${pathStage}`
  }

  if (!phrase) return null

  return (
    <div className="ritual-cue" key={cueKey} aria-live="polite">
      <p>{kicker}</p>
      <blockquote>{phrase}</blockquote>
    </div>
  )
}
