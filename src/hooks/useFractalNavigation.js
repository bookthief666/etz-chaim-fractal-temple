import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const MAX_QUEUED_ZOOM = 0.72
const MAX_ACTIVE_SPEED = 2.15
const MAX_COAST_SPEED = 1.45
const POINTER_SCALE = 0.0036
const WHEEL_SCALE = 0.00105

/**
 * Fold-safe navigation governor.
 *
 * Raw touch/wheel events never mutate the shader depth directly. They enqueue
 * intent; R3F consumes that intent at a bounded per-frame rate. This prevents a
 * laggy/coalesced Android pointer event from crossing several recursive shader
 * branches in one frame and spiking the GPU watchdog.
 */
export function useFractalNavigation() {
  const { gl } = useThree()
  const zoom = useRef(0)
  const energy = useRef(0)
  const queuedZoom = useRef(0)
  const velocity = useRef(0)
  const active = useRef(false)

  useFrame((_, delta) => {
    const dt = Math.min(Math.max(delta, 0.001), 0.05)
    const speedLimit = active.current ? MAX_ACTIVE_SPEED : MAX_COAST_SPEED
    const desiredVelocity = THREE.MathUtils.clamp(queuedZoom.current * 11.0, -speedLimit, speedLimit)
    const response = 1 - Math.exp(-dt * (active.current ? 18 : 10))
    velocity.current = THREE.MathUtils.lerp(velocity.current, desiredVelocity, response)

    const maxMove = speedLimit * dt
    const move = THREE.MathUtils.clamp(velocity.current * dt, -maxMove, maxMove)
    if (Math.abs(move) > 0.000001) {
      zoom.current = Math.max(-0.18, zoom.current + move)
      queuedZoom.current -= move
    }

    if (Math.abs(queuedZoom.current) < 0.00015) queuedZoom.current = 0
    if (!active.current && queuedZoom.current === 0) {
      velocity.current *= Math.exp(-dt * 8.5)
    }

    const motionEnergy = THREE.MathUtils.clamp(Math.abs(velocity.current) / MAX_ACTIVE_SPEED, 0, 1)
    energy.current = Math.max(energy.current, motionEnergy * 0.72)
  })

  useEffect(() => {
    const element = gl.domElement
    let activePointer = null
    let lastY = 0

    const enqueue = (amount) => {
      queuedZoom.current = THREE.MathUtils.clamp(
        queuedZoom.current + amount,
        -MAX_QUEUED_ZOOM,
        MAX_QUEUED_ZOOM,
      )
    }

    const excite = (amount) => {
      energy.current = Math.min(1, energy.current + amount)
    }

    const onWheel = (event) => {
      event.preventDefault()
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1
      const deltaPx = THREE.MathUtils.clamp(event.deltaY * unit, -360, 360)
      enqueue(deltaPx * WHEEL_SCALE)
      excite(Math.min(0.32, Math.abs(deltaPx) * 0.0009))
    }

    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      activePointer = event.pointerId
      active.current = true
      lastY = event.clientY
      excite(0.10)
      element.setPointerCapture?.(event.pointerId)
    }

    const onPointerMove = (event) => {
      if (event.pointerId !== activePointer) return
      if (event.cancelable) event.preventDefault()
      // Coalesced Android events can report very large deltas after a dropped
      // frame. Bound a single event before it enters the per-frame governor.
      const delta = THREE.MathUtils.clamp(event.clientY - lastY, -72, 72)
      lastY = event.clientY
      enqueue(delta * POINTER_SCALE)
      excite(Math.min(0.20, Math.abs(delta) * 0.0065))
    }

    const endPointer = (event) => {
      if (event.pointerId !== activePointer) return
      activePointer = null
      active.current = false
      element.releasePointerCapture?.(event.pointerId)
    }

    element.addEventListener('wheel', onWheel, { passive: false })
    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointermove', onPointerMove, { passive: false })
    element.addEventListener('pointerup', endPointer)
    element.addEventListener('pointercancel', endPointer)

    return () => {
      active.current = false
      element.removeEventListener('wheel', onWheel)
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerup', endPointer)
      element.removeEventListener('pointercancel', endPointer)
    }
  }, [gl])

  return useMemo(() => ({ zoom, energy, queuedZoom, velocity, active }), [])
}
