import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

const SAMPLE_WINDOW = 45

export default function CanvasTelemetry({ enabled = false, onSample }) {
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

  useFrame(({ clock }, delta) => {
    if (!enabled || !onSample) return
    const ms = Math.min(delta * 1000, 1000)
    frameTimes.current.push(ms)
    if (frameTimes.current.length > SAMPLE_WINDOW) frameTimes.current.shift()
    if (clock.elapsedTime - lastReport.current < 0.25) return
    lastReport.current = clock.elapsedTime
    const rollingFrameMs = frameTimes.current.reduce((sum, value) => sum + value, 0) / Math.max(1, frameTimes.current.length)
    onSample({
      ...rendererInfo,
      dpr: gl.getPixelRatio(),
      rollingFrameMs,
      rollingFps: rollingFrameMs > 0 ? 1000 / rollingFrameMs : 0,
    })
  })

  return null
}
