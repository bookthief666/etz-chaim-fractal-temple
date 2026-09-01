import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PHASE_ONE_VISUALS } from '../data/visualGrammar.js'

/**
 * A non-interactive astrolabe layer behind the canonical graph.
 *
 * The field is deliberately interpretive UI/visual grammar. It does not add
 * nodes, edges, paths, or historical attributions to the Tree. Its job is to
 * make the topology read as a living instrument while leaving the actual
 * graph untouched and fully selectable above it.
 */
export default function TreeInstrumentField({ focusedId = null, interactionLocked = false }) {
  const ringA = useRef()
  const ringB = useRef()
  const ringC = useRef()
  const crossA = useRef()
  const crossB = useRef()
  const pulseA = useRef()
  const pulseB = useRef()
  const focusVisual = focusedId ? PHASE_ONE_VISUALS[focusedId] : null
  const accent = focusVisual?.accent ?? '#d9b86d'

  const focusPhase = useMemo(() => {
    if (!focusedId) return 0
    let value = 0
    for (let index = 0; index < focusedId.length; index += 1) {
      value += focusedId.charCodeAt(index) * (index + 3)
    }
    return (value % 719) / 719
  }, [focusedId])

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const lockFactor = interactionLocked ? 0.25 : 1

    if (ringA.current) ringA.current.rotation.z += delta * 0.017 * lockFactor
    if (ringB.current) ringB.current.rotation.z -= delta * 0.012 * lockFactor
    if (ringC.current) ringC.current.rotation.z += delta * 0.008 * lockFactor

    if (crossA.current) {
      crossA.current.rotation.z = Math.sin(t * 0.055 + focusPhase * Math.PI * 2) * 0.035
    }
    if (crossB.current) {
      crossB.current.rotation.z = -Math.sin(t * 0.047 + focusPhase * Math.PI * 2) * 0.028
    }

    const focusPulse = focusedId ? 0.5 + 0.5 * Math.sin(t * 1.15 + focusPhase * 6.28318) : 0
    if (pulseA.current) {
      pulseA.current.material.opacity = focusedId ? 0.055 + focusPulse * 0.055 : 0.018
      pulseA.current.scale.setScalar(0.985 + focusPulse * 0.035)
    }
    if (pulseB.current) {
      pulseB.current.material.opacity = focusedId ? 0.035 + (1 - focusPulse) * 0.04 : 0.012
      pulseB.current.scale.setScalar(1.01 - focusPulse * 0.025)
    }
  })

  return (
    <group position={[0, 0.04, -0.42]} renderOrder={-5}>
      {/* Mercy / equilibrium / severity are shown as visual guide filaments,
          never as additional topology. */}
      {[-2.15, 0, 2.15].map((x, index) => (
        <mesh key={`pillar-${x}`} position={[x, 0, 0]}>
          <boxGeometry args={[index === 1 ? 0.012 : 0.008, 10.15, 0.006]} />
          <meshBasicMaterial
            color={index === 1 ? '#d9b86d' : accent}
            transparent
            opacity={focusedId ? (index === 1 ? 0.09 : 0.052) : (index === 1 ? 0.04 : 0.025)}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}

      <group ref={ringA} scale={[0.575, 1, 1]}>
        <mesh>
          <torusGeometry args={[5.02, 0.006, 6, 128]} />
          <meshBasicMaterial color={accent} transparent opacity={focusedId ? 0.10 : 0.045} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <ringGeometry args={[4.46, 4.468, 4]} />
          <meshBasicMaterial color="#d9b86d" transparent opacity={0.036} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <group ref={ringB} scale={[0.71, 1, 1]} rotation={[0, 0, Math.PI / 12]}>
        <mesh>
          <torusGeometry args={[3.96, 0.004, 6, 112]} />
          <meshBasicMaterial color="#f1e7c9" transparent opacity={focusedId ? 0.072 : 0.026} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      <group ref={ringC} scale={[0.87, 1, 1]} rotation={[0, 0, -Math.PI / 9]}>
        <mesh>
          <ringGeometry args={[2.61, 2.617, 10]} />
          <meshBasicMaterial color={accent} transparent opacity={focusedId ? 0.055 : 0.018} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <group ref={crossA}>
        <mesh position={[0, 0.20, 0]}>
          <boxGeometry args={[5.85, 0.006, 0.005]} />
          <meshBasicMaterial color="#d9b86d" transparent opacity={focusedId ? 0.045 : 0.018} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <group ref={crossB}>
        <mesh position={[0, -2.70, 0]}>
          <boxGeometry args={[4.8, 0.005, 0.005]} />
          <meshBasicMaterial color={accent} transparent opacity={focusedId ? 0.035 : 0.012} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>

      {/* Two enormous, almost imperceptible breaths make the whole diagram
          expand and contract without rotating the canonical graph itself. */}
      <mesh ref={pulseA} scale={[0.62, 1, 1]}>
        <torusGeometry args={[4.72, 0.012, 6, 128]} />
        <meshBasicMaterial color={accent} transparent opacity={0.02} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={pulseB} scale={[0.48, 1, 1]} rotation={[0, 0, Math.PI / 7]}>
        <torusGeometry args={[5.18, 0.006, 6, 128]} />
        <meshBasicMaterial color="#f1e7c9" transparent opacity={0.012} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}
