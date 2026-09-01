import { SEPHIRAH_BY_ID } from '../data/treeTopology.js'
import SourceLedger from './SourceLedger.jsx'

function Line({ label, children }) {
  if (!children) return null
  return (
    <div className="invocation-line">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export default function PathInfoPanel({
  path,
  sourceId,
  directedOperator,
  documentaryPath,
  attributionMode,
  onTraverse,
  onClose,
}) {
  if (!path || !sourceId) return null

  const source = SEPHIRAH_BY_ID[sourceId]
  const destinationId = path.a === sourceId ? path.b : path.a
  const destination = SEPHIRAH_BY_ID[destinationId]
  if (!source || !destination) return null

  const showDocumentary = attributionMode === 'hermetic777' && documentaryPath
  const operative = Boolean(directedOperator)

  return (
    <aside className={`path-invocation ${operative ? 'is-operative' : 'is-documentary'}`} aria-label={`${source.name} to ${destination.name} path study`}>
      <button className="invocation-close" type="button" onClick={onClose} aria-label="Release path focus">
        <span aria-hidden="true">×</span><small>release</small>
      </button>

      <div className="path-invocation-thread" aria-hidden="true">
        <span className="path-end path-source" />
        <span className="path-flow" />
        <span className="path-end path-destination" />
      </div>

      <header className="invocation-header path-invocation-header">
        <p className="invocation-kicker">{operative ? 'OPERATIVE PATH · INTERPRETIVE' : 'PATH LENS · DOCUMENTARY / TOPOLOGICAL'}</p>
        <h2>{source.name} <span>→</span> {destination.name}</h2>
        <p className="invocation-title">
          {operative
            ? directedOperator.label
            : showDocumentary
              ? `${documentaryPath.letter} · ${documentaryPath.letterName} · ${documentaryPath.cosmicAttribution}`
              : 'Canonical edge · metamorphosis not yet forged'}
        </p>
      </header>

      <div className="invocation-reading path-reading">
        <div className="invocation-leaf">
          {operative ? (
            <>
              <p className="invocation-lead">{directedOperator.prompt}</p>
              <dl>
                <Line label="Visual law">{directedOperator.visualLaw}</Line>
                <Line label="Mathematics">{directedOperator.mathLaw}</Line>
                <Line label="Palette">{directedOperator.paletteLaw}</Line>
                <Line label="Rite">{directedOperator.rite.join(' · ')}</Line>
              </dl>
            </>
          ) : (
            <p className="invocation-lead">This path is fully present in the canonical Tree and may be inspected now. Its dedicated fractal metamorphosis remains intentionally unimplemented rather than being faked.</p>
          )}

          {showDocumentary ? (
            <div className="path-documentary-thread">
              <p className="invocation-kicker">777 · DOCUMENTARY PATH</p>
              <div className="path-documentary-sigil" aria-hidden="true">
                <strong>{documentaryPath.letter}</strong>
                <span>{documentaryPath.cosmicGlyph}</span>
                <small>{documentaryPath.keyScale}</small>
              </div>
              <dl>
                <Line label="Key">{documentaryPath.keyScale}</Line>
                <Line label="Letter">{documentaryPath.letter} · {documentaryPath.letterName}</Line>
                <Line label="Attribution">{documentaryPath.cosmicAttribution}</Line>
                <Line label="Tarot">{documentaryPath.tarot}</Line>
                <Line label="Joins">{documentaryPath.joins}</Line>
              </dl>
              {documentaryPath.editorialNote ? <p className="invocation-variant">{documentaryPath.editorialNote}</p> : null}
              <SourceLedger provenance={documentaryPath.provenance} label="Path sources" />
            </div>
          ) : (
            <p className="invocation-source-note">Core mode withholds Hebrew-letter, astrological and Tarot overlays while preserving the path as topology.</p>
          )}
        </div>
      </div>

      {operative ? (
        <button className="threshold-sigil path-threshold-sigil" type="button" onClick={() => onTraverse(directedOperator.id)}>
          <span className="threshold-orbit orbit-outer" aria-hidden="true" />
          <span className="threshold-orbit orbit-mid" aria-hidden="true" />
          <span className="threshold-core" aria-hidden="true">◇</span>
          <span className="threshold-copy">
            <small>TRANSITUS</small>
            <strong>Traverse toward {destination.name}</strong>
          </span>
        </button>
      ) : (
        <div className="path-lens-seal" aria-label="Documentary path inspected; traversal is not implemented">
          <span aria-hidden="true">{showDocumentary ? documentaryPath.letter : '◇'}</span>
          <small>INSPECTIO</small>
          <strong>Path known · metamorphosis yet to be forged</strong>
        </div>
      )}
    </aside>
  )
}
