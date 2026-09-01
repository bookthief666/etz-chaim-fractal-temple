import { useState } from 'react'

function number(value, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : '—'
}

export default function QaTelemetryOverlay({ report }) {
  const [copyState, setCopyState] = useState('COPY QA REPORT')

  const rows = [
    ['Runtime', report.runtime],
    ['Browser', report.browserFamily],
    ['WebGL vendor', report.webglVendor],
    ['WebGL renderer', report.webglRenderer],
    ['Phase', report.phase],
    ['Sephirah / path', report.currentTarget || '—'],
    ['Shader', report.shaderProgram],
    ['Depth stage', report.depthStage],
    ['DPR', number(report.dpr, 2)],
    ['Quality', number(report.qualityScale, 2)],
    ['Frame', `${number(report.rollingFrameMs)} ms`],
    ['FPS', number(report.rollingFps)],
    ['Context loss', report.contextLossCount],
    ['Restorations', report.contextRestorationCount],
    ['Renderer remounts', report.rendererRemountCount],
    ['Realm entries', report.realmEntryCount],
    ['Lifecycle', report.rendererStatus],
    ['Last event', report.lastLifecycleEvent],
  ]

  const copyReport = async () => {
    const text = [
      'ETZ CHAIM · M4.15 QA REPORT',
      ...rows.map(([label, value]) => `${label}: ${value}`),
      `User agent: ${report.userAgent}`,
      `Captured: ${new Date().toISOString()}`,
    ].join('\n')
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const fallback = document.createElement('textarea')
        fallback.value = text
        fallback.setAttribute('readonly', '')
        fallback.style.position = 'fixed'
        fallback.style.opacity = '0'
        document.body.appendChild(fallback)
        fallback.select()
        const copied = document.execCommand('copy')
        fallback.remove()
        if (!copied) throw new Error('Clipboard command rejected')
      }
      setCopyState('COPIED')
    } catch {
      setCopyState('COPY FAILED')
    }
    window.setTimeout(() => setCopyState('COPY QA REPORT'), 1600)
  }

  return (
    <aside className="qa-telemetry" aria-label="Renderer QA telemetry">
      <header><span>QA · RENDERER ORACLE</span><strong>{report.runtime}</strong></header>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{String(value)}</dd></div>
        ))}
      </dl>
      <button type="button" onClick={copyReport}>{copyState}</button>
    </aside>
  )
}
