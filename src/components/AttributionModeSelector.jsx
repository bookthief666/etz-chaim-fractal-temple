import { ATTRIBUTION_MODE_ORDER, ATTRIBUTION_SYSTEMS } from '../data/attributionSystems.js'

export default function AttributionModeSelector({ value, onChange, disabled = false }) {
  return (
    <div className="mode-selector" role="group" aria-label="Attribution display">
      {ATTRIBUTION_MODE_ORDER.map((id) => {
        const system = ATTRIBUTION_SYSTEMS[id]
        return (
          <button
            key={id}
            type="button"
            className={`mode-button ${value === id ? 'is-active' : ''}`}
            aria-pressed={value === id}
            disabled={disabled}
            onClick={() => onChange(id)}
          >
            {system.shortLabel}
          </button>
        )
      })}
    </div>
  )
}
