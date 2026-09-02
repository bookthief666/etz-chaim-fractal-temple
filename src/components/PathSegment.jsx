import { useMemo, useState } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { createPathVisualGrammar } from '../data/pathVisualGrammar.js'

const UP = new THREE.Vector3(0, 1, 0)

/**
 * Interaction/documentary facet of one canonical edge. LivingPathField owns
 * the shared GPU presentation so 22 edges do not create 22 frame callbacks.
 */
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
  const [hovered, setHovered] = useState(false)
  const connected = Boolean(focusedId && (path.a === focusedId || path.b === focusedId))
  const selected = selectedPathId === path.id
  const interactive = !dimmed && inspectable && connected

  const transform = useMemo(() => {
    const a = new THREE.Vector3(...start)
    const b = new THREE.Vector3(...end)
    const direction = b.clone().sub(a)
    return {
      length: direction.length(),
      midpoint: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, direction.normalize()),
    }
  }, [start, end])

  const grammar = useMemo(
    () => (documentary ? createPathVisualGrammar(path, documentary) : null),
    [documentary, path],
  )

  const choosePath = (event) => {
    event.stopPropagation()
    if (interactive) onFocusPath?.(path.id)
  }

  if (!(inspectable && connected) && !(ornamentsEnabled && connected && showDocumentary && documentary)) {
    return null
  }

  return (
    <group position={transform.midpoint} quaternion={transform.quaternion}>
      {ornamentsEnabled && connected && showDocumentary && documentary ? (
        <group position={[0.15, 0, 0.12]}>
          <Html transform sprite center distanceFactor={7.8} zIndexRange={[8, 0]} style={{ pointerEvents: 'none' }}>
            <div className={`path-glyph-inscription family-${grammar.family} ${selected ? 'is-selected' : ''} ${traversable ? 'is-operative' : ''}`}>
              <span className="path-glyph-letter" lang="he" dir="rtl">{documentary.letter}</span>
              <span className="path-glyph-cosmic">{documentary.cosmicGlyph}</span>
              <small>{documentary.keyScale}</small>
            </div>
          </Html>
        </group>
      ) : null}

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
          <cylinderGeometry args={[
            hovered && interactive ? 0.18 : 0.14,
            hovered && interactive ? 0.18 : 0.14,
            transform.length,
            6,
            1,
            true,
          ]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  )
}
