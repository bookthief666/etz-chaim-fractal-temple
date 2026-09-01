import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PHASE_ONE_VISUALS } from '../data/visualGrammar.js'
import { REALM_PROFILES } from '../data/realmProfiles.js'
import { compatibilityRealmProgram } from '../shaders/compatibilityRealm.js'
import { getLoadedRealmProgram, loadRealmProgram } from '../shaders/realmRegistry.js'
import { useFractalNavigation } from '../hooks/useFractalNavigation.js'
import ReturnSigil from './ReturnSigil.jsx'

const DEPTH_RATE = 0.62
const DEPTH_STAGE_COUNT = 4
const COMPATIBILITY_HOLD_MS = 2400

export default function FractalRealm({
  sephirah,
  onReturn,
  returnEnabled = false,
  onDepthStage,
  onRuntimeTelemetry,
  onProgramError,
  programFailure = null,
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
  const [compatibilityVisible, setCompatibilityVisible] = useState(true)

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
      uRealmNumber: { value: sephirah.number },
    }),
    [visual, realm, baseQuality, sephirah.number],
  )

  // The ignition governor must start when the actual raymarch program becomes
  // available, not merely when the React realm shell mounted. Otherwise a slow
  // dynamic import can cause the heavy program's first drawable frame to start
  // at full quality instead of the accepted low-cost ignition profile.
  useEffect(() => {
    if (!shaderProgram) return
    stableAge.current = 0
    uniforms.uQuality.value = Math.min(baseQuality, 0.48)
  }, [shaderProgram, baseQuality, uniforms])

  // Keep an analytical compatibility renderer underneath the requested realm
  // during its compiler/ignition window. When the requested shader is healthy
  // it is fully opaque and visually owns the screen; after the short seating
  // interval the compatibility layer unmounts. If the GPU rejects the program,
  // the fallback remains instead of exposing a black WebGL clear color.
  useEffect(() => {
    setCompatibilityVisible(true)
    if (programFailure || !shaderProgram) return undefined
    const timer = window.setTimeout(() => setCompatibilityVisible(false), COMPATIBILITY_HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [sephirah.id, shaderProgram, programFailure])

  useFrame(({ clock }, delta) => {
    // Camera-locking keeps screen rays spatially stable regardless of which
    // Sephirah was used as the macro entry point.
    if (shell.current) {
      camera.getWorldPosition(cameraWorld)
      shell.current.position.copy(cameraWorld)
    }

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

    // Both the compatibility renderer and the requested realm share these
    // uniform objects, so continuity remains animated even before the heavy
    // material exists or after the driver rejects it.
    uniforms.uTime.value = clock.elapsedTime
    uniforms.uLogZoom.value = navigation.zoom.current
    uniforms.uInteraction.value = navigation.energy.current
    uniforms.uDepthStage.value = depthStage
    uniforms.uDepthPhase.value = depthPhase
    uniforms.uDepthEpoch.value = depthEpoch

    // Motion-safe rendering: while a finger/wheel gesture is actively changing
    // recursive law, temporarily reserve GPU headroom. No motif or stage is
    // removed; full quality returns as the gesture settles. A small boundary
    // reserve also protects the exact frames where shader branches switch.
    if (shaderProgram && !programFailure) stableAge.current += dt
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
    const qualityUniform = uniforms.uQuality

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
        shaderProgram: programFailure
          ? `compatibility-${sephirah.id}`
          : (shaderProgram?.family ?? `compatibility-loading-${sephirah.id}`),
        qualityScale: qualityUniform.value,
        depthStage,
      })
    }
  })

  const showCompatibility = compatibilityVisible || Boolean(programFailure) || !shaderProgram

  return (
    <>
      <group ref={shell}>
        {showCompatibility ? (
          <>
            <mesh scale={29.4} frustumCulled={false} renderOrder={-2}>
              <sphereGeometry args={[1, 20, 12]} />
              <meshBasicMaterial
                color={visual.aura}
                side={THREE.BackSide}
                depthTest={false}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            <mesh scale={30} frustumCulled={false} renderOrder={-1}>
              <boxGeometry args={[2, 2, 2]} />
              <shaderMaterial
                uniforms={uniforms}
                vertexShader={compatibilityRealmProgram.vertex}
                fragmentShader={compatibilityRealmProgram.fragment}
                side={THREE.BackSide}
                depthTest={false}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </>
        ) : null}

        {shaderProgram && !programFailure ? (
          <mesh scale={30} frustumCulled={false} renderOrder={1}>
            <boxGeometry args={[2, 2, 2]} />
            <shaderMaterial
              key={shaderProgram.family}
              name={shaderProgram.family}
              ref={material}
              uniforms={uniforms}
              vertexShader={shaderProgram.vertex}
              fragmentShader={shaderProgram.fragment}
              side={THREE.BackSide}
              depthTest={false}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ) : null}
      </group>
      <ReturnSigil onReturn={onReturn} enabled={returnEnabled} />
    </>
  )
}
