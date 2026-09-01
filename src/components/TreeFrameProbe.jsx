import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// M4.13: readiness is based on a tiny run of real R3F frames, then announced
// on the following browser animation frame so the previous WebGL draw has had
// a chance to reach presentation. No wall-clock timer is allowed to remount the
// renderer merely because a mobile GPU is slow.
export default function TreeFrameProbe({ active = false, onReady, frames = 2 }) {
  const delivered = useRef(0)
  const announced = useRef(false)
  const raf = useRef(null)

  useEffect(() => () => {
    if (raf.current !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(raf.current)
    }
  }, [])

  useFrame(() => {
    if (!active) {
      delivered.current = 0
      announced.current = false
      if (raf.current !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(raf.current)
        raf.current = null
      }
      return
    }

    if (announced.current) return
    delivered.current += 1
    if (delivered.current < frames) return

    announced.current = true
    if (typeof requestAnimationFrame === 'function') {
      raf.current = requestAnimationFrame(() => {
        raf.current = null
        onReady?.()
      })
    } else {
      onReady?.()
    }
  })

  return null
}
