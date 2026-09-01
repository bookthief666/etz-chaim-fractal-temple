import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export default function RendererGuard({ onContextLost, onRestoreStarted, onContextRestored }) {
  const { gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement

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

    canvas.addEventListener('webglcontextlost', handleLost, false)
    canvas.addEventListener('webglcontextrestored', handleRestored, false)

    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost, false)
      canvas.removeEventListener('webglcontextrestored', handleRestored, false)
    }
  }, [gl, onContextLost, onRestoreStarted, onContextRestored])

  return null
}
