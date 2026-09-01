import { getSources } from '../data/sources.js'

export default function SourceLedger({ provenance, label = 'Documentary sources' }) {
  const sources = getSources(provenance)
  if (!sources.length) return null

  return (
    <details className="source-ledger">
      <summary>{label} · {sources.length}</summary>
      <div className="source-ledger-list">
        {sources.map((source, index) => (
          <article className="source-record" key={`${source.sourceId}-${source.locator ?? index}`}>
            <div className="source-record-head">
              <strong>{source.shortLabel}</strong>
              {source.fields?.length ? <span>{source.fields.join(' · ')}</span> : null}
            </div>
            <p>{source.author} · <em>{source.title}</em></p>
            <p className="source-locator">{source.locator}</p>
            <p>{source.scope}</p>
          </article>
        ))}
      </div>
    </details>
  )
}
