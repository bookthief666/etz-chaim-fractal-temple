import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PHASE_ONE_VISUALS } from '../data/visualGrammar.js'

export default function Sephirah({ node, focused, selected, resonant = false, pathEndpoint = false, dimmed = false, ornamentsEnabled = true, disabled, onFocus }) {
  const group = useRef()
  const halo = useRef()
  const coreMaterial = useRef()
  const orbitA = useRef()
  const orbitB = useRef()
  const satellite = useRef()
  const invocationA = useRef()
  const invocationB = useRef()
  const invocationC = useRef()
  const numberCrown = useRef()
  const numberRing = useRef()
  const [hovered, setHovered] = useState(false)
  const visual = PHASE_ONE_VISUALS[node.id]

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    const t = clock.elapsedTime
    const pulse = 1 + Math.sin(t * 1.25 + node.number) * 0.018
    const emphasis = selected ? 1.2 : focused ? 1.16 : pathEndpoint ? 1.095 : hovered ? 1.07 : resonant ? 1.035 : dimmed ? 0.90 : 1
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, pulse * emphasis, Math.min(1, delta * 8)))
    group.current.rotation.z += delta * 0.023 * (node.number % 2 === 0 ? 1 : -1)

    if (coreMaterial.current) {
      coreMaterial.current.opacity = THREE.MathUtils.lerp(
        coreMaterial.current.opacity,
        dimmed ? 0.18 : pathEndpoint ? 0.96 : resonant ? 0.82 : 1,
        Math.min(1, delta * 8),
      )
    }

    if (halo.current) {
      const haloPulse = 1 + Math.sin(t * 1.8 + node.number) * (focused ? 0.09 : pathEndpoint ? 0.068 : resonant ? 0.052 : 0.035)
      halo.current.scale.setScalar(haloPulse)
    }

    if (orbitA.current) {
      orbitA.current.rotation.z += delta * (focused ? 0.32 : 0.10) * (node.number % 2 === 0 ? 1 : -1)
      orbitA.current.rotation.x = Math.sin(t * 0.31 + node.number) * 0.16
    }

    if (orbitB.current) {
      orbitB.current.rotation.y += delta * (focused ? -0.27 : -0.075)
      orbitB.current.rotation.z = Math.cos(t * 0.23 + node.number) * 0.18
    }

    if (satellite.current) {
      satellite.current.scale.setScalar(0.78 + Math.sin(t * 2.1 + node.number) * 0.18)
    }

    if (numberCrown.current && focused) {
      numberCrown.current.rotation.z += delta * (0.13 + node.number * 0.003)
      numberCrown.current.rotation.x = Math.sin(t * 0.24 + node.number) * 0.14
    }
    if (numberRing.current && focused) {
      const crownPulse = 0.5 + 0.5 * Math.sin(t * 1.1 + node.number * 0.7)
      numberRing.current.scale.setScalar(0.98 + crownPulse * 0.045)
      numberRing.current.material.opacity = 0.10 + crownPulse * 0.09
    }

    if (focused) {
      const breathe = 0.5 + 0.5 * Math.sin(t * 1.55 + node.number)
      if (invocationA.current) {
        invocationA.current.rotation.z += delta * 0.21
        invocationA.current.scale.setScalar(1.0 + breathe * 0.09)
      }
      if (invocationB.current) {
        invocationB.current.rotation.z -= delta * 0.15
        invocationB.current.scale.setScalar(1.08 - breathe * 0.05)
      }
      if (invocationC.current) {
        invocationC.current.rotation.x += delta * 0.07
        invocationC.current.rotation.y -= delta * 0.10
      }
    }
  })

  const focus = (event) => {
    event.stopPropagation()
    if (!disabled) onFocus(node.id)
  }

  return (
    <group ref={group} position={node.position}>
      <mesh
        onClick={focus}
        onPointerEnter={(event) => {
          event.stopPropagation()
          setHovered(true)
          document.body.style.cursor = disabled ? 'default' : 'pointer'
        }}
        onPointerLeave={() => {
          setHovered(false)
          document.body.style.cursor = 'crosshair'
        }}
      >
        <sphereGeometry args={[0.34, 32, 24]} />
        <meshBasicMaterial ref={coreMaterial} color={visual.core} transparent opacity={1} toneMapped={false} />
      </mesh>

      <mesh ref={halo}>
        <sphereGeometry args={[focused ? 0.5 : 0.46, 24, 18]} />
        <meshBasicMaterial
          color={visual.aura}
          transparent
          opacity={dimmed ? 0.018 : selected ? 0.3 : focused ? 0.24 : pathEndpoint ? 0.205 : hovered ? 0.18 : resonant ? 0.135 : 0.105}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {ornamentsEnabled ? (
        <>
      <group ref={orbitA} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[focused ? 0.53 : 0.49, focused ? 0.018 : 0.011, 8, 72]} />
          <meshBasicMaterial color={visual.accent} transparent opacity={dimmed ? 0.08 : focused ? 0.90 : hovered ? 0.62 : 0.38} toneMapped={false} />
        </mesh>
        <mesh ref={satellite} position={[focused ? 0.56 : 0.51, 0, 0]}>
          <sphereGeometry args={[focused ? 0.027 : 0.019, 8, 6]} />
          <meshBasicMaterial color="#fff5d7" transparent opacity={dimmed ? 0.06 : focused ? 0.92 : 0.48} toneMapped={false} />
        </mesh>
          </group>

          <group ref={orbitB} rotation={[0, Math.PI / 2, 0.38]}>
        <mesh>
          <torusGeometry args={[focused ? 0.58 : 0.535, focused ? 0.010 : 0.006, 8, 72]} />
          <meshBasicMaterial color={focused ? '#f3e7c7' : visual.accent} transparent opacity={dimmed ? 0.04 : focused ? 0.54 : 0.18} toneMapped={false} />
        </mesh>
          </group>

        </>
      ) : null}

      {ornamentsEnabled && focused ? (
        <group>
          <mesh ref={invocationA} rotation={[0.52, 0.28, 0]}>
            <torusGeometry args={[0.65, 0.0045, 6, 96]} />
            <meshBasicMaterial color={visual.accent} transparent opacity={0.42} toneMapped={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh ref={invocationB} rotation={[1.08, -0.42, Math.PI / 4]}>
            <torusGeometry args={[0.79, 0.003, 6, 96]} />
            <meshBasicMaterial color="#f3e7c7" transparent opacity={0.22} toneMapped={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh ref={invocationC} rotation={[0.22, 0.68, 0]}>
            <ringGeometry args={[0.90, 0.905, 6]} />
            <meshBasicMaterial color={visual.accent} transparent opacity={0.13} toneMapped={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
          </mesh>
          <group ref={numberCrown} rotation={[0.42, 0.18, 0]}>
            {Array.from({ length: node.number }, (_, index) => {
              const angle = (index / node.number) * Math.PI * 2
              const radius = 0.99 + (index % 2) * 0.035
              return (
                <mesh key={`number-bead-${node.id}-${index}`} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
                  <sphereGeometry args={[0.018 + Math.min(node.number, 10) * 0.0006, 7, 5]} />
                  <meshBasicMaterial
                    color={index % 3 === 0 ? '#fff4d5' : visual.accent}
                    transparent
                    opacity={0.62}
                    toneMapped={false}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                </mesh>
              )
            })}
          </group>
          <mesh ref={numberRing} rotation={[0.42, 0.18, 0]}>
            <torusGeometry args={[0.99, 0.0028, 5, Math.max(32, node.number * 10)]} />
            <meshBasicMaterial color={visual.accent} transparent opacity={0.13} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <pointLight color={visual.accent} intensity={0.42} distance={2.3} decay={2} />
        </group>
      ) : null}
    </group>
  )
}
