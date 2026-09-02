import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

const SAMPLE_WINDOW = 180
const HITCH_THRESHOLD_MS = 50

function percentile(sorted, ratio) {
  if (sorted.length === 0) return 0
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1))
  return sorted[index]
}

export default function CanvasTelemetry({ enabled = false, scopeKey = 'unknown', onSample }) {
  const { gl } = useThree()
  const frameTimes = useRef([])
  const lastReport = useRef(-1)
  const rendererInfo = useMemo(() => {
    if (!enabled) return { webglVendor: 'hidden', webglRenderer: 'hidden' }
    try {
      const context = gl.getContext()
      const debug = context.getExtension('WEBGL_debug_renderer_info')
      return {
        webglVendor: debug ? context.getParameter(debug.UNMASKED_VENDOR_WEBGL) : context.getParameter(context.VENDOR),
        webglRenderer: debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : context.getParameter(context.RENDERER),
      }
    } catch {
      return { webglVendor: 'unavailable', webglRenderer: 'unavailable' }
    }
  }, [enabled, gl])

  useEffect(() => {
    frameTimes.current = []
    lastReport.current = -1
    if (!enabled || !onSample) return
    onSample({
      ...rendererInfo,
      frameScope: scopeKey,
      dpr: gl.getPixelRatio(),
      currentFrameMs: 0,
      rollingFrameMs: 0,
      frameP50Ms: 0,
      frameP95Ms: 0,
      rollingFps: 0,
      hitchCount: 0,
      hitchThresholdMs: HITCH_THRESHOLD_MS,
      frameSampleCount: 0,
    })
  }, [enabled, gl, onSample, rendererInfo, scopeKey])

  useFrame(({ clock }, delta) => {
    if (!enabled || !onSample) return
    const ms = Math.min(delta * 1000, 1000)
    frameTimes.current.push(ms)
    if (frameTimes.current.length > SAMPLE_WINDOW) frameTimes.current.shift()
    if (clock.elapsedTime - lastReport.current < 0.25) return
    lastReport.current = clock.elapsedTime
    const samples = frameTimes.current
    const rollingFrameMs = samples.reduce((sum, value) => sum + value, 0) / Math.max(1, samples.length)
    const sorted = [...samples].sort((a, b) => a - b)
    onSample({
      ...rendererInfo,
      frameScope: scopeKey,
      dpr: gl.getPixelRatio(),
      currentFrameMs: ms,
      rollingFrameMs,
      frameP50Ms: percentile(sorted, 0.50),
      frameP95Ms: percentile(sorted, 0.95),
      rollingFps: rollingFrameMs > 0 ? 1000 / rollingFrameMs : 0,
      hitchCount: samples.reduce((count, value) => count + (value > HITCH_THRESHOLD_MS ? 1 : 0), 0),
      hitchThresholdMs: HITCH_THRESHOLD_MS,
      frameSampleCount: samples.length,
    })
  })

  return null
}
