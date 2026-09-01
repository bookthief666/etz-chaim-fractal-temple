import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SEPHIRAH_BY_ID } from '../data/treeTopology.js'
import { RUNTIME_PHASE } from '../runtime/phases.js'

const HOME_POSITION = new THREE.Vector3(0, 0, 12.4)
const HOME_LOOK = new THREE.Vector3(0, 0, 0)
const ARC_AXIS = new THREE.Vector3(0, 0, 1)
const ARC_SCRATCH = new THREE.Vector3()

function smootherstep(t) {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  return x * x * x * (x * (x * 6 - 15) + 10)
}

function seedDirection(id) {
  if (!id) return 1
  let sum = 0
  for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i) * (i + 1)
  return sum % 2 === 0 ? 1 : -1
}

export default function CameraDirector({
  phase,
  targetId,
  targetPosition,
  journeyNonce,
  onArrive,
  onReturned,
}) {
  const { camera, gl } = useThree()
  const transition = useRef(null)

  useEffect(() => {
    if (phase === RUNTIME_PHASE.INGRESS) {
      const node = targetId ? SEPHIRAH_BY_ID[targetId] : null
      const rawTarget = targetPosition ?? node?.position
      if (!rawTarget) return

      const target = new THREE.Vector3(rawTarget[0], rawTarget[1], rawTarget[2] ?? 0)
      transition.current = {
        kind: 'enter',
        startedAt: null,
        duration: 1.72,
        from: camera.position.clone(),
        to: new THREE.Vector3(target.x, target.y, 1.72),
        look: target,
        fovFrom: camera.fov,
        direction: seedDirection(targetId),
      }
    } else if (phase === RUNTIME_PHASE.RETURN) {
      transition.current = {
        kind: 'return',
        startedAt: null,
        duration: 1.22,
        from: camera.position.clone(),
        to: HOME_POSITION.clone(),
        look: HOME_LOOK.clone(),
        fovFrom: camera.fov,
        direction: 1,
      }
    } else {
      transition.current = null
      if (!gl.xr.isPresenting && Math.abs(camera.fov - 43) > 0.01) {
        camera.fov = 43
        camera.updateProjectionMatrix()
      }
    }
  }, [phase, targetId, targetPosition, journeyNonce, camera, gl])

  useFrame(({ clock }) => {
    const active = transition.current
    if (!active) return

    if (active.startedAt === null) active.startedAt = clock.elapsedTime
    const t = THREE.MathUtils.clamp((clock.elapsedTime - active.startedAt) / active.duration, 0, 1)
    const eased = smootherstep(t)

    // Never drive the tracked headset camera. On screen, the entrance is a
    // curved ritual approach rather than a flat linear zoom: the camera arcs
    // around the selected sphere, breathes its field of view, then seats the
    // canonical fractal camera. This remains bounded and deterministic.
    if (!gl.xr.isPresenting) {
      camera.position.lerpVectors(active.from, active.to, eased)

      if (active.kind === 'enter') {
        const arc = Math.sin(Math.PI * t) * 0.46 * active.direction
        ARC_SCRATCH.subVectors(active.look, active.from).cross(ARC_AXIS).normalize().multiplyScalar(arc)
        camera.position.add(ARC_SCRATCH)
        camera.position.y += Math.sin(Math.PI * t) * 0.12
        camera.fov = THREE.MathUtils.lerp(active.fovFrom, 48.5, Math.sin(Math.PI * t) * 0.88)
      } else {
        camera.fov = THREE.MathUtils.lerp(active.fovFrom, 43, eased)
      }

      camera.lookAt(active.look)
      camera.updateProjectionMatrix()
    }

    if (t >= 1) {
      const kind = active.kind
      transition.current = null
      if (!gl.xr.isPresenting) {
        camera.fov = 43
        camera.updateProjectionMatrix()
      }
      if (kind === 'enter') onArrive()
      if (kind === 'return') onReturned()
    }
  })

  return null
}
