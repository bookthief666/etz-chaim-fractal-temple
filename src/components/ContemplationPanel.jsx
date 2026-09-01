import { REALM_PROFILES } from '../data/realmProfiles.js'
import { getRealmRitual } from '../data/ritualContent.js'

export default function ContemplationPanel({ node, onEnter, onClose }) {
  if (!node) return null
  const realm = REALM_PROFILES[node.id]
  const ritual = getRealmRitual(node.id)

  return (
    <aside className="contemplation-invocation" aria-label={`${node.name} contemplation threshold`}>
      <button className="invocation-close" type="button" onClick={onClose} aria-label="Release contemplation">
        <span aria-hidden="true">×</span><small>release</small>
      </button>
      <p className="invocation-kicker">CONTEMPLATIO · {node.hebrew}</p>
      <h2>{node.name}</h2>
      <p className="contemplation-threshold">{ritual?.threshold ?? realm.prompt}</p>
      <blockquote>“{realm.prompt}”</blockquote>
      <button className="threshold-sigil contemplation-threshold-sigil" type="button" onClick={() => onEnter(node.id)}>
        <span className="threshold-orbit orbit-outer" aria-hidden="true" />
        <span className="threshold-orbit orbit-mid" aria-hidden="true" />
        <span className="threshold-core" aria-hidden="true">✶</span>
        <span className="threshold-copy"><small>ATTENDE</small><strong>{realm.entryVerb}</strong></span>
      </button>
    </aside>
  )
}
