import { isRitualRuntimePhase, phaseClassName } from '../runtime/phases.js'

const GLYPHS = ['☉', '☾', '♄', '♃', '♂', '♀', '☿', '✶', '◇', '✦']

export default function TempleAtmosphere({ phase }) {
  const isolated = isRitualRuntimePhase(phase)
  return (
    <div className={`temple-atmosphere atmosphere-${phaseClassName(phase)} ${isolated ? 'atmosphere-isolated' : 'atmosphere-animated'}`} aria-hidden="true">
      <div className="temple-aurora" />
      <div className="temple-shimmer" />
      <div className="temple-vignette" />
      <div className="temple-noise" />
      <div className="temple-engraving ring-one" />
      <div className="temple-engraving ring-two" />
      <div className="temple-marginalia">
        {GLYPHS.map((glyph, index) => (
          <span
            key={`${glyph}-${index}`}
            className={`marginal-glyph glyph-${index + 1}`}
            style={{ '--glyph-delay': `${-index * 2.7}s` }}
          >
            {glyph}
          </span>
        ))}
      </div>
    </div>
  )
}
