import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PHASE_ONE_VISUALS } from '../data/visualGrammar.js'
import { REALM_PROFILES } from '../data/realmProfiles.js'
import { getLoadedRealmProgram, loadRealmProgram } from '../shaders/realmRegistry.js'
import { useFractalNavigation } from '../hooks/useFractalNavigation.js'
import ReturnSigil from './ReturnSigil.jsx'

const DEPTH_RATE = 0.62
const DEPTH_STAGE_COUNT = 4

export default function FractalRealm({
  sephirah,
  onReturn,
  returnEnabled = false,
  onDepthStage,
  onRuntimeTelemetry,
  onProgramError,
}) {
  const { camera } = useThree()
  const shell = useRef()
  const material = useRef()
  const lastDepthStage = useRef(-1)
  const stableAge = useRef(0)
  const lastTelemetryAt = useRef(-1)
  const cameraWorld = useMemo(() => new THREE.Vector3(), [])
  const navigation = useFractalNavigation()
  const visual = PHASE_ONE_VISUALS[sephirah.id]
  const realm = REALM_PROFILES[sephirah.id]
  const [shaderProgram, setShaderProgram] = useState(() => getLoadedRealmProgram(sephirah.id))

  useEffect(() => {
    let active = true
    const loaded = getLoadedRealmProgram(sephirah.id)
    setShaderProgram(loaded)
    if (loaded) {
      onRuntimeTelemetry?.({ shaderProgram: loaded.family })
      return () => { active = false }
    }

    loadRealmProgram(sephirah.id).then((program) => {
      if (!active) return
      setShaderProgram(program)
      onRuntimeTelemetry?.({ shaderProgram: program.family })
    }).catch((error) => {
      if (active) onProgramError?.(error)
    })

    return () => { active = false }
  }, [sephirah.id, onProgramError, onRuntimeTelemetry])

  const baseQuality = useMemo(
    () =>
      typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
        ? (realm.mobileQuality ?? 0.72)
        : (realm.desktopQuality ?? 1.0),
    [realm],
  )

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLogZoom: { value: 0 },
      uSeed: { value: visual.seed },
      uCoreColor: { value: new THREE.Color(visual.core) },
      uAuraColor: { value: new THREE.Color(visual.aura) },
      uAccentColor: { value: new THREE.Color(visual.accent) },
      uGlowStrength: { value: realm.glowStrength },
      uMotionScale: { value: realm.motionScale },
      uSymbolDensity: { value: realm.symbolDensity },
      uInteraction: { value: 0 },
      uDepthStage: { value: 0 },
      uDepthPhase: { value: 0 },
      uDepthEpoch: { value: 0 },
      uQuality: { value: Math.min(baseQuality, 0.48) },
    }),
    [visual, realm, baseQuality],
  )

  useFrame(({ clock }, delta) => {
    // Camera-locking keeps screen rays spatially stable regardless of which
    // Sephirah was used as the macro entry point.
    if (shell.current) {
      camera.getWorldPosition(cameraWorld)
      shell.current.position.copy(cameraWorld)
    }

    if (!material.current || !shaderProgram) return
    const dt = Math.min(delta, 0.08)

    // Autonomous descent remains contemplatively slow. Direct manipulation is
    // integrated by useFractalNavigation's governor, never from raw event rate.
    navigation.zoom.current += dt * 0.052
    navigation.energy.current *= Math.exp(-dt * 2.8)

    const positiveZoom = Math.max(0, navigation.zoom.current)
    const depthProgress = positiveZoom * DEPTH_RATE
    const wholeDepth = Math.floor(depthProgress)
    const depthStage = wholeDepth % DEPTH_STAGE_COUNT
    const depthPhase = depthProgress - wholeDepth
    const depthEpoch = Math.floor(wholeDepth / DEPTH_STAGE_COUNT)

    const u = material.current.uniforms
    u.uTime.value = clock.elapsedTime
    u.uLogZoom.value = navigation.zoom.current
    u.uInteraction.value = navigation.energy.current
    u.uDepthStage.value = depthStage
    u.uDepthPhase.value = depthPhase
    u.uDepthEpoch.value = depthEpoch

    // Motion-safe rendering: while a finger/wheel gesture is actively changing
    // recursive law, temporarily reserve GPU headroom. No motif or stage is
    // removed; full quality returns as the gesture settles. A small boundary
    // reserve also protects the exact frames where shader branches switch.
    stableAge.current += dt
    const ignition = THREE.MathUtils.smoothstep(stableAge.current, 0.0, 2.2)
    const ignitionTarget = THREE.MathUtils.lerp(Math.min(baseQuality, 0.50), baseQuality, ignition)
    const gestureLoad = THREE.MathUtils.clamp(
      Math.max(navigation.energy.current, Math.abs(navigation.velocity.current) / 2.15),
      0,
      1,
    )
    const motionHeadroom = THREE.MathUtils.lerp(1.0, 0.70, gestureLoad)
    const boundaryDistance = Math.min(depthPhase, 1 - depthPhase)
    const boundaryHeadroom = boundaryDistance < 0.075 ? 0.88 : boundaryDistance < 0.14 ? 0.94 : 1.0
    const targetQuality = Math.max(0.40, ignitionTarget * motionHeadroom * boundaryHeadroom)
    const qualityUniform = u.uQuality

    if (delta > 0.034) {
      qualityUniform.value = Math.max(0.40, qualityUniform.value - dt * 0.82)
    } else {
      const response = gestureLoad > 0.08 ? Math.min(1, dt * 3.4) : Math.min(1, dt * 0.34)
      qualityUniform.value = THREE.MathUtils.lerp(qualityUniform.value, targetQuality, response)
    }

    if (depthStage !== lastDepthStage.current) {
      lastDepthStage.current = depthStage
      onDepthStage?.(depthStage, depthEpoch)
    }

    if (onRuntimeTelemetry && clock.elapsedTime - lastTelemetryAt.current >= 0.25) {
      lastTelemetryAt.current = clock.elapsedTime
      onRuntimeTelemetry({
        shaderProgram: shaderProgram.family,
        qualityScale: qualityUniform.value,
        depthStage,
      })
    }
  })

  return (
    <>
      {shaderProgram ? <mesh ref={shell} scale={30} frustumCulled={false}>
        <boxGeometry args={[2, 2, 2]} />
        <shaderMaterial
          key={shaderProgram.family}
          ref={material}
          uniforms={uniforms}
          vertexShader={shaderProgram.vertex}
          fragmentShader={shaderProgram.fragment}
          side={THREE.BackSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh> : null}
      <ReturnSigil onReturn={onReturn} enabled={returnEnabled} />
    </>
  )
}
