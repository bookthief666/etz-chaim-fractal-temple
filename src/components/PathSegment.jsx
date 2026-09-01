import { useMemo, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PHASE_ONE_VISUALS } from '../data/visualGrammar.js'

const UP = new THREE.Vector3(0, 1, 0)

export default function PathSegment({
  path,
  start,
  end,
  focusedId,
  selectedPathId,
  dimmed = false,
  inspectable = false,
  traversable = false,
  documentary = null,
  showDocumentary = false,
  ornamentsEnabled = true,
  onFocusPath,
}) {
  const outerMaterial = useRef()
  const innerMaterial = useRef()
  const mote = useRef()
  const moteB = useRef()
  const moteC = useRef()
  const inscription = useRef()
  const [hovered, setHovered] = useState(false)

  const connected = Boolean(focusedId && (path.a === focusedId || path.b === focusedId))
  const selected = selectedPathId === path.id
  const interactive = !dimmed && inspectable && connected
  const focusVisual = focusedId ? PHASE_ONE_VISUALS[focusedId] : null
  const activeAccent = focusVisual?.accent ?? '#d9b86d'

  const transform = useMemo(() => {
    const a = new THREE.Vector3(...start)
    const b = new THREE.Vector3(...end)
    const direction = b.clone().sub(a)
    const length = direction.length()
    const midpoint = a.clone().add(b).multiplyScalar(0.5)
    const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, direction.normalize())
    return { length, midpoint, quaternion }
  }, [start, end])

  const phaseOffset = useMemo(() => {
    let value = 0
    for (let index = 0; index < path.id.length; index += 1) value += path.id.charCodeAt(index) * (index + 1)
    return (value % 997) / 997
  }, [path.id])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const breathe = 0.5 + 0.5 * Math.sin(t * 0.55 + phaseOffset * Math.PI * 2)
    const emphasized = selected || interactive
    const baseOpacity = dimmed ? 0.08 : selected ? 0.64 : interactive ? 0.48 : connected ? 0.36 : 0.20
    const coreOpacity = dimmed ? 0.13 : selected ? 1.0 : interactive ? 0.92 : connected ? 0.76 : 0.50

    if (outerMaterial.current) outerMaterial.current.opacity = baseOpacity + breathe * (emphasized ? 0.10 : 0.035)
    if (innerMaterial.current) innerMaterial.current.opacity = coreOpacity + breathe * (emphasized ? 0.045 : 0.07)

    const speed = emphasized ? 0.15 : connected ? 0.11 : 0.073
    const placeMote = (mesh, offset, scaleFactor) => {
      if (!mesh) return
      let progress = (t * speed + phaseOffset + offset) % 1
      if (focusedId === path.b) progress = 1 - progress
      mesh.position.y = (progress - 0.5) * transform.length
      mesh.scale.setScalar(scaleFactor * (0.85 + breathe * 0.28))
      mesh.visible = !dimmed
    }
    placeMote(mote.current, 0, emphasized ? 1.3 : connected ? 0.92 : 0.68)
    placeMote(moteB.current, 0.42, interactive ? 0.92 : 0.66)
    placeMote(moteC.current, 0.71, 0.72)

    if (inscription.current) {
      inscription.current.position.y = Math.sin(t * 0.42 + phaseOffset * Math.PI * 2) * 0.045
    }
  })

  const choosePath = (event) => {
    event.stopPropagation()
    if (interactive) onFocusPath?.(path.id)
  }

  return (
    <group position={transform.midpoint} quaternion={transform.quaternion}>
      <mesh>
        <cylinderGeometry args={[selected ? 0.034 : interactive ? 0.030 : 0.026, selected ? 0.034 : interactive ? 0.030 : 0.026, transform.length, 8, 1, true]} />
        <meshBasicMaterial
          ref={outerMaterial}
          color={selected ? '#ffdf73' : interactive ? activeAccent : connected ? '#b6a77f' : '#625d68'}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[selected ? 0.011 : interactive ? 0.009 : 0.006, selected ? 0.011 : interactive ? 0.009 : 0.006, transform.length, 6, 1, true]} />
        <meshBasicMaterial
          ref={innerMaterial}
          color={selected ? '#fff4cf' : interactive ? '#f3ead2' : connected ? '#d8ccb0' : '#a9a3ae'}
          transparent
          opacity={0.56}
          toneMapped={false}
        />
      </mesh>
      {ornamentsEnabled ? (
        <mesh ref={mote}>
          <sphereGeometry args={[emphasizedRadius(selected, interactive, connected), 8, 6]} />
          <meshBasicMaterial color={selected ? '#fff4cf' : interactive ? activeAccent : connected ? '#e7d8b5' : '#a69ead'} toneMapped={false} />
        </mesh>
      ) : null}
      {ornamentsEnabled && connected ? (
        <mesh ref={moteB}>
          <sphereGeometry args={[interactive ? 0.027 : 0.020, 7, 5]} />
          <meshBasicMaterial color={activeAccent} transparent opacity={interactive ? 0.82 : 0.48} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ) : null}
      {ornamentsEnabled && selected ? (
        <mesh ref={moteC}>
          <sphereGeometry args={[0.022, 7, 5]} />
          <meshBasicMaterial color="#fff0c8" transparent opacity={0.76} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ) : null}

      {ornamentsEnabled && connected && showDocumentary && documentary ? (
        <group ref={inscription} position={[0.13, 0, 0.12]}>
          <Html center distanceFactor={9.5} zIndexRange={[8, 0]} style={{ pointerEvents: 'none' }}>
            <div className={`path-glyph-inscription ${selected ? 'is-selected' : ''} ${traversable ? 'is-operative' : ''}`}>
              <span className="path-glyph-letter">{documentary.letter}</span>
              <span className="path-glyph-cosmic">{documentary.cosmicGlyph}</span>
              <small>{documentary.keyScale}</small>
            </div>
          </Html>
        </group>
      ) : null}

      {/* Wide invisible cylinder makes all connected Study paths inspectable on a Fold.
          Traversability remains a separate capability owned by PATH_OPERATORS. */}
      {inspectable && connected ? (
        <mesh
          onClick={choosePath}
          onPointerEnter={(event) => {
            event.stopPropagation()
            setHovered(true)
            if (interactive) document.body.style.cursor = 'pointer'
          }}
          onPointerLeave={() => {
            setHovered(false)
            document.body.style.cursor = 'crosshair'
          }}
        >
          <cylinderGeometry args={[hovered && interactive ? 0.18 : 0.14, hovered && interactive ? 0.18 : 0.14, transform.length, 6, 1, true]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  )
}

function emphasizedRadius(selected, interactive, connected) {
  if (selected) return 0.040
  if (interactive) return 0.036
  if (connected) return 0.028
  return 0.022
}
