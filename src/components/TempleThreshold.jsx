import LivingTreeSeal from './LivingTreeSeal.jsx'
import { BUILD_INFO } from '../data/buildInfo.js'

export default function TempleThreshold({ leaving = false, onEnter }) {
  return (
    <section className={`temple-threshold ${leaving ? 'is-leaving' : ''}`} aria-label="Enter the Tree of Life Fractal Temple">
      <div className="threshold-veil" />
      <div className="threshold-content">
        <p className="threshold-ordinal">ARS FRACTALIS · ETZ CHAIM</p>
        <div className="threshold-rule"><span>✦</span></div>
        <h1 className="threshold-title">
          <span className="threshold-blackletter">ETZ CHAIM</span>
          <span className="threshold-subtitle">The Fractal Temple</span>
        </h1>

        <div className="threshold-seal-stage">
          <LivingTreeSeal />
          <p className="threshold-hebrew">עץ חיים</p>
        </div>

        <p className="threshold-invocation">
          Ten vessels. Twenty-two passages. One living geometry.
        </p>
        <p className="threshold-copy">
          Enter the Tree as image, study, or contemplation. Every sphere opens into a mathematical realm; every operative path changes the law of the world as you cross it.
        </p>

        <button type="button" className="threshold-enter" onClick={onEnter} disabled={leaving}>
          <span>Initiate the Living Tree</span>
          <span className="threshold-enter-mark" aria-hidden="true">✶</span>
        </button>

        <div className="threshold-registers" aria-hidden="true">
          <span>VISIO</span><i />
          <span>STUDIUM</span><i />
          <span>CONTEMPLATIO</span>
        </div>
        <p className="threshold-footnote">Procedural geometry · recursive descent · documentary layers kept distinct · <span className="threshold-runtime">{BUILD_INFO.milestone}</span></p>
      </div>
    </section>
  )
}
