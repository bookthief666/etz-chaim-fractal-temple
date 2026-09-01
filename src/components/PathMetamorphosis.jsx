import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PHASE_ONE_VISUALS } from '../data/visualGrammar.js'
import { SEPHIRAH_BY_ID } from '../data/treeTopology.js'
import { pathMetamorphosisVertexShader, pathMetamorphosisFragmentShader } from '../shaders/pathMetamorphosis.js'
import { useFractalNavigation } from '../hooks/useFractalNavigation.js'
import ReturnSigil from './ReturnSigil.jsx'

const AUTO_PROGRESS_RATE = 0.012
const MANUAL_PROGRESS_SCALE = 0.18

export default function PathMetamorphosis({
  journey,
  onReturn,
  returnEnabled = false,
  onProgress,
  onComplete,
  onRuntimeTelemetry,
}) {
  const { camera } = useThree()
  const shell = useRef()
  const material = useRef()
  const navigation = useFractalNavigation()
  const autoProgress = useRef(0)
  const lastBucket = useRef(-1)
  const completionHold = useRef(0)
  const completed = useRef(false)
  const stableAge = useRef(0)
  const lastTelemetryAt = useRef(-1)
  const cameraWorld = useMemo(() => new THREE.Vector3(), [])

  const source = SEPHIRAH_BY_ID[journey.sourceId]
  const destination = SEPHIRAH_BY_ID[journey.destinationId]
  const fromVisual = PHASE_ONE_VISUALS[source.id]
  const toVisual = PHASE_ONE_VISUALS[destination.id]
  const baseQuality = useMemo(
    () =>
      typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
        ? 0.62
        : 0.92,
    [],
  )

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPathKind: { value: journey.shaderKind },
      uReverse: { value: journey.reversed ? 1 : 0 },
      uInteraction: { value: 0 },
      uQuality: { value: Math.min(baseQuality, 0.48) },
      uFromCore: { value: new THREE.Color(fromVisual.core) },
      uFromAura: { value: new THREE.Color(fromVisual.aura) },
      uFromAccent: { value: new THREE.Color(fromVisual.accent) },
      uToCore: { value: new THREE.Color(toVisual.core) },
      uToAura: { value: new THREE.Color(toVisual.aura) },
      uToAccent: { value: new THREE.Color(toVisual.accent) },
    }),
    [fromVisual, journey.reversed, journey.shaderKind, toVisual, baseQuality],
  )

  useFrame(({ clock }, delta) => {
    if (shell.current) {
      camera.getWorldPosition(cameraWorld)
      shell.current.position.copy(cameraWorld)
    }

    if (!material.current || completed.current) return
    const dt = Math.min(delta, 0.08)

    autoProgress.current += dt * AUTO_PROGRESS_RATE
    navigation.energy.current *= Math.exp(-dt * 2.7)

    const progress = THREE.MathUtils.clamp(
      autoProgress.current + navigation.zoom.current * MANUAL_PROGRESS_SCALE,
      0,
      1,
    )

    const u = material.current.uniforms
    u.uTime.value = clock.elapsedTime
    u.uProgress.value = progress
    u.uInteraction.value = navigation.energy.current

    stableAge.current += dt
    const ignition = THREE.MathUtils.smoothstep(stableAge.current, 0.0, 2.2)
    const ignitionTarget = THREE.MathUtils.lerp(Math.min(baseQuality, 0.50), baseQuality, ignition)
    const gestureLoad = THREE.MathUtils.clamp(
      Math.max(navigation.energy.current, Math.abs(navigation.velocity.current) / 2.15),
      0,
      1,
    )
    const stagePhase = (progress * 4) % 1
    const boundaryDistance = Math.min(stagePhase, 1 - stagePhase)
    const boundaryHeadroom = boundaryDistance < 0.07 ? 0.90 : 1.0
    const targetQuality = Math.max(0.42, ignitionTarget * THREE.MathUtils.lerp(1, 0.72, gestureLoad) * boundaryHeadroom)
    const qualityUniform = u.uQuality

    if (delta > 0.034) qualityUniform.value = Math.max(0.42, qualityUniform.value - dt * 0.78)
    else qualityUniform.value = THREE.MathUtils.lerp(
      qualityUniform.value,
      targetQuality,
      Math.min(1, dt * (gestureLoad > 0.08 ? 3.2 : 0.30)),
    )

    const stage = Math.min(3, Math.floor(progress * 4))
    const bucket = Math.min(20, Math.floor(progress * 20))
    if (bucket !== lastBucket.current) {
      lastBucket.current = bucket
      onProgress?.(progress, stage)
    }

    if (progress >= 0.995) {
      completionHold.current += dt
      if (completionHold.current >= 0.72) {
        completed.current = true
        onComplete?.(journey.destinationId)
      }
    } else {
      completionHold.current = 0
    }

    if (onRuntimeTelemetry && clock.elapsedTime - lastTelemetryAt.current >= 0.25) {
      lastTelemetryAt.current = clock.elapsedTime
      onRuntimeTelemetry({
        shaderProgram: 'path-metamorphosis-shared',
        qualityScale: qualityUniform.value,
        depthStage: stage,
      })
    }
  })

  return (
    <>
      <mesh ref={shell} scale={30} frustumCulled={false}>
        <boxGeometry args={[2, 2, 2]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={pathMetamorphosisVertexShader}
          fragmentShader={pathMetamorphosisFragmentShader}
          side={THREE.BackSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <ReturnSigil onReturn={onReturn} enabled={returnEnabled} />
    </>
  )
}
