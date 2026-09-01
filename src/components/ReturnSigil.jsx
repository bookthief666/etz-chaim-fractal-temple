import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const worldPosition = new THREE.Vector3()
const worldQuaternion = new THREE.Quaternion()
const forward = new THREE.Vector3(0, 0, -1)
const right = new THREE.Vector3(1, 0, 0)
const scratchForward = new THREE.Vector3()
const scratchRight = new THREE.Vector3()

const MAX_TAP_DRIFT = 18
const MIN_TAP_MS = 45
const MAX_TAP_MS = 900

export default function ReturnSigil({ onReturn, enabled = false }) {
  const { camera } = useThree()
  const group = useRef()
  const inner = useRef()
  const placed = useRef(false)
  const pointerIntent = useRef(null)

  useFrame(({ clock }, delta) => {
    if (!group.current) return

    if (!placed.current) {
      camera.getWorldPosition(worldPosition)
      camera.getWorldQuaternion(worldQuaternion)
      scratchForward.copy(forward).applyQuaternion(worldQuaternion).normalize()
      scratchRight.copy(right).applyQuaternion(worldQuaternion).normalize()

      // Keep the talisman peripheral rather than directly under the natural
      // vertical-drag lane. It remains comfortably visible and reachable on a
      // Fold and in XR, but cannot masquerade as the realm's central geometry.
      group.current.position
        .copy(worldPosition)
        .addScaledVector(scratchForward, 1.62)
        .addScaledVector(scratchRight, 0.46)
      group.current.position.y -= 0.48
      group.current.quaternion.copy(worldQuaternion)
      placed.current = true
    }

    const t = clock.elapsedTime
    group.current.rotation.z = Math.sin(t * 0.48) * 0.055
    const armedScale = enabled ? 1.0 : 0.86
    group.current.scale.setScalar(
      THREE.MathUtils.lerp(group.current.scale.x, armedScale, Math.min(1, delta * 7)),
    )

    if (inner.current) {
      inner.current.rotation.z -= delta * (enabled ? 0.16 : 0.07)
      inner.current.scale.setScalar(0.95 + Math.sin(t * 1.45) * (enabled ? 0.035 : 0.018))
    }
  })

  const beginIntent = (event) => {
    event.stopPropagation()
    if (!enabled) {
      pointerIntent.current = null
      return
    }

    pointerIntent.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      at: performance.now(),
    }
  }

  const finishIntent = (event) => {
    event.stopPropagation()
    const intent = pointerIntent.current
    pointerIntent.current = null
    if (!enabled || !intent || intent.id !== event.pointerId) return

    const dx = event.clientX - intent.x
    const dy = event.clientY - intent.y
    const drift = Math.hypot(dx, dy)
    const elapsed = performance.now() - intent.at

    // A return must be a fresh, deliberate tap on the armed talisman. Vertical
    // realm navigation, stale/synthesized Android clicks, and long pointer holds
    // are all rejected without changing the visual object or its generous hitbox.
    if (drift <= MAX_TAP_DRIFT && elapsed >= MIN_TAP_MS && elapsed <= MAX_TAP_MS) {
      onReturn?.()
    }
  }

  const cancelIntent = (event) => {
    event.stopPropagation()
    pointerIntent.current = null
  }

  return (
    <group ref={group}>
      <mesh>
        <torusGeometry args={[0.073, 0.0055, 8, 56]} />
        <meshBasicMaterial
          color={enabled ? '#d9b86d' : '#8d816d'}
          transparent
          opacity={enabled ? 0.62 : 0.28}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <group ref={inner} rotation={[0, 0, Math.PI / 4]}>
        <mesh>
          <torusGeometry args={[0.047, 0.0035, 8, 48]} />
          <meshBasicMaterial
            color={enabled ? '#ff405d' : '#6f5960'}
            transparent
            opacity={enabled ? 0.42 : 0.18}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh scale={[1, 1, 0.6]}>
          <octahedronGeometry args={[0.018, 0]} />
          <meshBasicMaterial
            color="#f1e7c9"
            transparent
            opacity={enabled ? 0.82 : 0.34}
            toneMapped={false}
          />
        </mesh>
      </group>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[0.092, 0.094, 4]} />
        <meshBasicMaterial
          color="#f1e7c9"
          transparent
          opacity={enabled ? 0.18 : 0.07}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* The large invisible target is retained for Fold/XR usability. It is
          intentionally inert during ingress and requires a fresh pointer cycle. */}
      <mesh
        onPointerDown={beginIntent}
        onPointerUp={finishIntent}
        onPointerCancel={cancelIntent}
        onPointerOut={cancelIntent}
      >
        <sphereGeometry args={[0.145, 10, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
