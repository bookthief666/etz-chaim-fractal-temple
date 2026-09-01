import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

function compactLog(value) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text.length > 520 ? `${text.slice(0, 517)}...` : text
}

export default function RendererGuard({
  onContextLost,
  onRestoreStarted,
  onContextRestored,
  onShaderError,
}) {
  const { gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    const debug = gl.debug
    const previousShaderError = debug?.onShaderError ?? null
    const previousCheckShaderErrors = debug?.checkShaderErrors
    let lastShaderSignature = ''

    const handleLost = (event) => {
      // Explicitly request restoration where the browser supports it. Samsung
      // Chromium may otherwise leave the canvas permanently blank after a GPU
      // watchdog reset.
      event.preventDefault()
      onContextLost?.()
      onRestoreStarted?.()
    }

    const handleRestored = () => {
      onContextRestored?.()
    }

    // M4.15 could report that a JS realm module loaded while the underlying GPU
    // program had actually failed to compile/link. Three normally prints that
    // only to DevTools, which is effectively invisible during Fold QA. Promote
    // the real driver/compiler signal into the renderer lifecycle instead.
    if (debug && onShaderError) {
      debug.checkShaderErrors = true
      debug.onShaderError = (context, program, vertexShader, fragmentShader) => {
        const programLog = compactLog(context.getProgramInfoLog(program))
        const vertexLog = compactLog(context.getShaderInfoLog(vertexShader))
        const fragmentLog = compactLog(context.getShaderInfoLog(fragmentShader))
        const signature = `${programLog}|${vertexLog}|${fragmentLog}`

        if (signature !== lastShaderSignature) {
          lastShaderSignature = signature
          const usefulLog = programLog || fragmentLog || vertexLog || 'driver returned no shader log'
          const error = new Error(`GPU shader compile/link failure: ${usefulLog}`)
          error.name = 'ShaderProgramError'
          error.driverDiagnostics = { programLog, vertexLog, fragmentLog }
          onShaderError(error)
          // Preserve full diagnostics for a connected desktop console without
          // forcing the Fold QA overlay to render thousands of GLSL characters.
          console.error('[Etz Chaim] GPU shader compile/link failure', error.driverDiagnostics)
        }

        if (typeof previousShaderError === 'function') {
          previousShaderError(context, program, vertexShader, fragmentShader)
        }
      }
    }

    canvas.addEventListener('webglcontextlost', handleLost, false)
    canvas.addEventListener('webglcontextrestored', handleRestored, false)

    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost, false)
      canvas.removeEventListener('webglcontextrestored', handleRestored, false)
      if (debug && onShaderError) {
        debug.onShaderError = previousShaderError
        if (typeof previousCheckShaderErrors === 'boolean') {
          debug.checkShaderErrors = previousCheckShaderErrors
        }
      }
    }
  }, [gl, onContextLost, onRestoreStarted, onContextRestored, onShaderError])

  return null
}
