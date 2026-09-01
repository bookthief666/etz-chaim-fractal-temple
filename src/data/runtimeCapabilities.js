function userAgent() {
  if (typeof navigator === 'undefined') return ''
  return navigator.userAgent ?? ''
}

function coarsePointer() {
  if (typeof window === 'undefined') return false
  return Boolean(window.matchMedia?.('(pointer: coarse)').matches)
}

const ua = userAgent()
const privacyHardenedBrowser = /DuckDuckGo|DDG/i.test(ua)
const coarse = coarsePointer()

function browserFamily(value) {
  if (/DuckDuckGo|DDG/i.test(value)) return 'DuckDuckGo WebView'
  if (/SamsungBrowser/i.test(value)) return 'Samsung Internet'
  if (/Edg\//i.test(value)) return 'Edge Chromium'
  if (/CriOS/i.test(value)) return 'Chrome iOS'
  if (/Chrome|Chromium/i.test(value)) return 'Chrome / Chromium'
  if (/Firefox|FxiOS/i.test(value)) return 'Firefox'
  if (/Safari/i.test(value)) return 'Safari / WebKit'
  return 'Unknown browser'
}

// Capability policy, not visual degradation. Hardened/privacy WebViews can be
// much less predictable about GPU context creation and speculative compilation.
// They therefore receive a quiet startup profile: DPR 1 until the canonical
// Tree is established and default GPU selection. M4.15 performs no speculative
// WebGL compilation on any browser; realm modules load only on explicit entry.
export const RUNTIME_CAPABILITIES = Object.freeze({
  privacyHardenedBrowser,
  browserFamily: browserFamily(ua),
  userAgent: ua,
  coarsePointer: coarse,
  powerPreference: privacyHardenedBrowser ? 'default' : 'high-performance',
  maxTreeDpr: privacyHardenedBrowser ? 1.0 : coarse ? 1.35 : 1.6,
  firstLightLabel: privacyHardenedBrowser ? 'privacy-webview' : 'standard-webgl',
})
