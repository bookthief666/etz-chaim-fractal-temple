import LivingTreeSeal from './LivingTreeSeal.jsx'
import { RUNTIME_CAPABILITIES } from '../data/runtimeCapabilities.js'

// Immediate DOM/SVG continuity while the WebGL Tree proves first light. M4.13
// never auto-remounts from a wall-clock timeout; if first light is genuinely
// delayed, the user receives a deliberate reseat sigil instead.
export default function TreeAwakening({ visible = false, stalled = false, onRetry }) {
  if (!visible) return null

  return (
    <div className={`tree-awakening ${stalled ? 'is-stalled' : ''}`} aria-live="polite" aria-label="The Tree is taking form">
      {stalled ? (
        <button className="tree-awakening-retry" type="button" onClick={onRetry} aria-label="Reseat the Tree renderer">
          <span className="tree-awakening-seal" aria-hidden="true"><LivingTreeSeal /></span>
          <span className="tree-awakening-copy">
            <span>FORMA · RESEAT</span>
            <strong>FIRST LIGHT IS DELAYED</strong>
            <i>{RUNTIME_CAPABILITIES.privacyHardenedBrowser ? 'This privacy WebView is delaying WebGL first light. Touch to retry the full geometry, or use a full browser for the richest GPU path.' : 'Touch the living seal to reseat the geometry.'}</i>
          </span>
        </button>
      ) : (
        <>
          <div className="tree-awakening-seal" aria-hidden="true"><LivingTreeSeal /></div>
          <div className="tree-awakening-copy">
            <span>FORMA · PRIMA</span>
            <strong>THE TREE IS TAKING FORM</strong>
            <i>Establishing the living geometry…</i>
          </div>
        </>
      )}
    </div>
  )
}
