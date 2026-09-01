import { useEffect, useMemo, useState } from 'react'
import { ATTRIBUTION_SYSTEMS, getAttribution } from '../data/attributionSystems.js'
import { PATH_OPERATORS } from '../data/pathOperators.js'
import { HERMETIC_PATHS_777 } from '../data/attributions/hermeticPaths777.js'
import { REALM_PROFILES } from '../data/realmProfiles.js'
import { PATHS, SEPHIRAH_BY_ID } from '../data/treeTopology.js'
import SourceLedger from './SourceLedger.jsx'

function Rune({ active, children, onClick }) {
  return (
    <button
      className={`invocation-rune ${active ? 'is-active' : ''}`}
      type="button"
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="invocation-rune-mark" aria-hidden="true">◇</span>
      <span>{children}</span>
    </button>
  )
}

function Line({ label, children }) {
  if (!children) return null
  return (
    <div className="invocation-line">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export default function SephirahInfoPanel({ node, attributionMode, onEnter, onClose, onChoosePath }) {
  const [register, setRegister] = useState('essence')

  useEffect(() => {
    setRegister('essence')
  }, [node?.id])

  if (!node) return null

  const realm = REALM_PROFILES[node.id]
  const attribution = getAttribution(attributionMode, node.id)
  const system = ATTRIBUTION_SYSTEMS[attributionMode]
  const connectedPaths = useMemo(
    () => PATHS.filter((path) => path.a === node.id || path.b === node.id),
    [node.id],
  )

  const hasDocumentary = Boolean(attribution)

  return (
    <aside className="sephirah-invocation" aria-label={`${node.name} invocation`}>
      <div className="invocation-axis" aria-hidden="true">
        <span className="axis-star">✶</span>
        <span className="axis-line" />
        <span className="axis-diamond">◇</span>
      </div>

      <button className="invocation-close" type="button" onClick={onClose} aria-label="Release Sephirah focus">
        <span aria-hidden="true">×</span>
        <small>release</small>
      </button>

      <header className="invocation-header">
        <p className="invocation-kicker">SEPHIRAH {String(node.number).padStart(2, '0')} · {node.hebrew}</p>
        <h2>{node.name}</h2>
        <p className="invocation-gloss">{node.gloss}</p>
        <p className="invocation-title">{realm.title}</p>
      </header>

      <nav className="invocation-registers" aria-label={`${node.name} study registers`}>
        <Rune active={register === 'essence'} onClick={() => setRegister('essence')}>Essence</Rune>
        <Rune active={register === 'geometry'} onClick={() => setRegister('geometry')}>Geometry</Rune>
        <Rune active={register === 'paths'} onClick={() => setRegister('paths')}>Paths</Rune>
        <Rune active={register === 'documentary'} onClick={() => setRegister('documentary')}>
          {hasDocumentary ? '777' : 'Sources'}
        </Rune>
      </nav>

      <div className="invocation-reading" key={`${node.id}-${register}`}>
        {register === 'essence' ? (
          <div className="invocation-leaf">
            <p className="invocation-lead">{realm.principle}</p>
            <blockquote>“{realm.prompt}”</blockquote>
            <dl>
              <Line label="Depth rite">{realm.depthRite?.join(' · ')}</Line>
              <Line label="Recursive law">{realm.recursiveLaw}</Line>
            </dl>
          </div>
        ) : null}

        {register === 'geometry' ? (
          <div className="invocation-leaf">
            <p className="invocation-lead">A mathematical interpretation, kept distinct from documentary attribution.</p>
            <dl>
              <Line label="Dominant">{realm.dominantMotif}</Line>
              <Line label="Supporting">{realm.supportingMotifs}</Line>
              <Line label="Motion">{realm.motion}</Line>
              <Line label="Mathematics">{realm.mathematics}</Line>
            </dl>
          </div>
        ) : null}

        {register === 'paths' ? (
          <div className="invocation-leaf">
            <p className="invocation-lead">Every connected edge may now be inspected. Only paths whose metamorphosis has actually been forged are marked operative.</p>
            <div className="invocation-paths">
              {connectedPaths.map((path) => {
                const destinationId = path.a === node.id ? path.b : path.a
                const destination = SEPHIRAH_BY_ID[destinationId]
                const operator = PATH_OPERATORS[path.id]
                const documentary = HERMETIC_PATHS_777[path.id]
                return (
                  <button
                    key={path.id}
                    className={`invocation-path ${operator ? 'is-operative' : 'is-inspectable'}`}
                    type="button"
                    onClick={() => onChoosePath?.(path.id)}
                  >
                    <span className="path-thread" aria-hidden="true" />
                    <strong>{node.name}</strong>
                    <span aria-hidden="true">⟶</span>
                    <strong>{destination.name}</strong>
                    <small>
                      {attributionMode === 'hermetic777' && documentary
                        ? `${documentary.letter} · ${documentary.cosmicAttribution}${operator ? ' · operative' : ''}`
                        : operator?.label ?? 'canonical path · inspect'}
                    </small>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {register === 'documentary' ? (
          <div className="invocation-leaf">
            {attribution ? (
              <>
                <p className="invocation-lead">{system.label} · documentary reception layer</p>
                <dl>
                  <Line label="Divine Name">{attribution.divineName}</Line>
                  <Line label="Archangel">{attribution.archangel}</Line>
                  <Line label="Order">{attribution.angelicOrder}</Line>
                  <Line label="Sphere">{attribution.cosmicAttribution}</Line>
                  <Line label="Key">{attribution.ritualKey}</Line>
                </dl>
                {attribution.disputedNote ? <p className="invocation-variant">Variant: {attribution.disputedNote}</p> : null}
                <SourceLedger provenance={attribution.provenance} />
                <p className="invocation-source-note">{system.sourceNote}</p>
              </>
            ) : (
              <>
                <p className="invocation-lead">Essential mode deliberately withholds later Hermetic correspondences.</p>
                <p className="invocation-source-note">Switch the documentary register to 777 above the Tree when you want to inspect that reception layer. Topology and shader grammar remain independent.</p>
              </>
            )}
          </div>
        ) : null}
      </div>

      <button className="threshold-sigil" type="button" onClick={() => onEnter(node.id)} aria-label={`${realm.entryVerb}: ${node.name}`}>
        <span className="threshold-orbit orbit-outer" aria-hidden="true" />
        <span className="threshold-orbit orbit-mid" aria-hidden="true" />
        <span className="threshold-orbit orbit-inner" aria-hidden="true" />
        <span className="threshold-core" aria-hidden="true">✶</span>
        <span className="threshold-copy">
          <small>INGRESSUS</small>
          <strong>{realm.entryVerb}</strong>
        </span>
      </button>
    </aside>
  )
}
