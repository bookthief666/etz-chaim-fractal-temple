import { getAttribution } from '../data/attributionSystems.js'
import { HERMETIC_PATHS_777 } from '../data/attributions/hermeticPaths777.js'
import { REALM_PROFILES } from '../data/realmProfiles.js'
import { getPathRitual, getRealmRitual } from '../data/ritualContent.js'
import { SEPHIRAH_BY_ID } from '../data/treeTopology.js'
import SourceLedger from './SourceLedger.jsx'

function Fact({ label, children }) {
  if (!children) return null
  return (
    <div className="folio-fact">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export default function StudyDrawer({
  selected,
  depthStage = 0,
  depthEpoch = 0,
  pathJourney,
  pathStage = 0,
  attributionMode,
  onClose,
}) {
  if (pathJourney) {
    const source = SEPHIRAH_BY_ID[pathJourney.sourceId]
    const destination = SEPHIRAH_BY_ID[pathJourney.destinationId]
    const documentary = attributionMode === 'hermetic777' ? HERMETIC_PATHS_777[pathJourney.id] : null
    const ritual = getPathRitual(pathJourney)

    return (
      <aside className="study-drawer path-study-drawer" aria-label="Active path dossier">
        <header className="study-drawer-header">
          <div>
            <p>ACTIVE PATH · STUDY</p>
            <h2>{source.name} → {destination.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dossier">×</button>
        </header>
        <p className="study-current-key">{pathJourney.rite?.[pathStage]}</p>
        <p className="study-ritual-line">{ritual?.[pathStage]}</p>
        <dl className="folio-facts">
          <Fact label="Visual law">{pathJourney.visualLaw}</Fact>
          <Fact label="Mathematics">{pathJourney.mathLaw}</Fact>
        </dl>
        {documentary ? (
          <div className="study-documentary">
            <p className="folio-section-label">777 DOCUMENTARY OVERLAY</p>
            <dl className="folio-facts">
              <Fact label="Letter">{documentary.letter} · {documentary.letterName}</Fact>
              <Fact label="Sphere">{documentary.cosmicAttribution}</Fact>
              <Fact label="Tarot">{documentary.tarot}</Fact>
            </dl>
            <SourceLedger provenance={documentary.provenance} label="Path sources" />
          </div>
        ) : (
          <p className="folio-source-note">Core mode keeps the operative mathematics visible while withholding the later Hermetic path overlay.</p>
        )}
      </aside>
    )
  }

  if (!selected) return null
  const realm = REALM_PROFILES[selected.id]
  const ritual = getRealmRitual(selected.id)
  const attribution = getAttribution(attributionMode, selected.id)

  return (
    <aside className="study-drawer" aria-label={`${selected.name} active realm dossier`}>
      <header className="study-drawer-header">
        <div>
          <p>ACTIVE REALM · STUDY</p>
          <h2>{selected.name}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close dossier">×</button>
      </header>
      <p className="study-current-key">
        {realm.depthRite?.[depthStage]}{depthEpoch > 0 ? ` · cycle ${depthEpoch + 1}` : ''}
      </p>
      <p className="study-ritual-line">{ritual?.stages?.[depthStage]}</p>
      <dl className="folio-facts">
        <Fact label="Realm law">{realm.principle}</Fact>
        <Fact label="Geometry">{realm.dominantMotif}</Fact>
        <Fact label="Recursion">{realm.recursiveLaw}</Fact>
      </dl>
      {attribution ? (
        <div className="study-documentary">
          <p className="folio-section-label">777 DOCUMENTARY OVERLAY</p>
          <dl className="folio-facts">
            <Fact label="Divine Name">{attribution.divineName}</Fact>
            <Fact label="Archangel">{attribution.archangel}</Fact>
            <Fact label="Order">{attribution.angelicOrder}</Fact>
            <Fact label="Sphere">{attribution.cosmicAttribution}</Fact>
          </dl>
          {attribution.disputedNote ? <p className="folio-dispute">Variant: {attribution.disputedNote}</p> : null}
          <SourceLedger provenance={attribution.provenance} />
        </div>
      ) : (
        <p className="folio-source-note">Core mode shows the realm’s mathematical interpretation without loading the later Hermetic reception layer.</p>
      )}
    </aside>
  )
}
