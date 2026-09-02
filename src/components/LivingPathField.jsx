import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HERMETIC_PATHS_777 } from '../data/attributions/hermeticPaths777.js'
import { PATH_OPERATORS } from '../data/pathOperators.js'
import { createPathVisualGrammar, PATH_MOTION_FAMILY } from '../data/pathVisualGrammar.js'
import { PATHS, SEPHIRAH_BY_ID } from '../data/treeTopology.js'
import { PHASE_ONE_VISUALS } from '../data/visualGrammar.js'
import { livingPathFragmentShader, livingPathVertexShader } from '../shaders/livingPaths.js'

const UP = new THREE.Vector3(0, 1, 0)
const FAMILY_COLORS = Object.freeze({
  [PATH_MOTION_FAMILY.ELEMENTAL]: '#c8d6d3',
  [PATH_MOTION_FAMILY.PLANETARY]: '#c7af79',
  [PATH_MOTION_FAMILY.ZODIACAL]: '#9f94ad',
})

function createGeometry() {
  const geometry = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true)
  geometry.setAttribute('aMotion', new THREE.InstancedBufferAttribute(new Float32Array(PATHS.length * 4), 4))
  geometry.setAttribute('aSignature', new THREE.InstancedBufferAttribute(new Float32Array(PATHS.length * 4), 4))
  geometry.setAttribute('aState', new THREE.InstancedBufferAttribute(new Float32Array(PATHS.length * 4), 4))
  geometry.setAttribute('aPathColor', new THREE.InstancedBufferAttribute(new Float32Array(PATHS.length * 3), 3))
  return geometry
}

function createMaterial(timeUniform, motionUniform, layer) {
  return new THREE.ShaderMaterial({
    name: layer > 0.5 ? 'living-path-halo' : 'living-path-core',
    uniforms: {
      uTime: timeUniform,
      uLayer: { value: layer },
      uMotionEnabled: motionUniform,
    },
    vertexShader: livingPathVertexShader,
    fragmentShader: livingPathFragmentShader,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
}

/**
 * One shared GPU clock and two instanced draws animate all 22 canonical edges.
 * PathSegment retains touch/documentary responsibility; this field owns only
 * interpretive presentation, so future PATH_OPERATORS do not rewrite it.
 */
export default function LivingPathField({
  focusedId = null,
  selectedPathId = null,
  dimmed = false,
  inspectableEnabled = false,
  ornamentsEnabled = true,
}) {
  const core = useRef()
  const halo = useRef()
  const timeUniform = useMemo(() => ({ value: 0 }), [])
  const motionUniform = useMemo(() => ({ value: ornamentsEnabled ? 1 : 0 }), [])
  const geometry = useMemo(createGeometry, [])
  const coreMaterial = useMemo(() => createMaterial(timeUniform, motionUniform, 0), [motionUniform, timeUniform])
  const haloMaterial = useMemo(() => createMaterial(timeUniform, motionUniform, 1), [motionUniform, timeUniform])

  const instances = useMemo(() => PATHS.map((path) => {
    const start = new THREE.Vector3(...SEPHIRAH_BY_ID[path.a].position)
    const end = new THREE.Vector3(...SEPHIRAH_BY_ID[path.b].position)
    const direction = end.clone().sub(start)
    return {
      path,
      midpoint: start.clone().add(end).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, direction.clone().normalize()),
      length: direction.length(),
      grammar: createPathVisualGrammar(path, HERMETIC_PATHS_777[path.id]),
    }
  }), [])

  useLayoutEffect(() => {
    if (!core.current || !halo.current) return
    const matrix = new THREE.Matrix4()
    const scale = new THREE.Vector3()
    for (let index = 0; index < instances.length; index += 1) {
      const instance = instances[index]
      scale.set(0.009, instance.length, 0.009)
      matrix.compose(instance.midpoint, instance.quaternion, scale)
      core.current.setMatrixAt(index, matrix)
      scale.set(0.036, instance.length, 0.036)
      matrix.compose(instance.midpoint, instance.quaternion, scale)
      halo.current.setMatrixAt(index, matrix)
    }
    core.current.instanceMatrix.needsUpdate = true
    halo.current.instanceMatrix.needsUpdate = true
  }, [instances])

  useLayoutEffect(() => {
    const motion = geometry.getAttribute('aMotion')
    const signature = geometry.getAttribute('aSignature')
    const state = geometry.getAttribute('aState')
    const color = geometry.getAttribute('aPathColor')
    const focusedAccent = focusedId ? new THREE.Color(PHASE_ONE_VISUALS[focusedId].accent) : null
    const familyColor = new THREE.Color()
    const pathColor = new THREE.Color()

    for (let index = 0; index < instances.length; index += 1) {
      const { path, grammar } = instances[index]
      const connected = Boolean(focusedId && (path.a === focusedId || path.b === focusedId))
      const selected = selectedPathId === path.id
      const operative = Boolean(PATH_OPERATORS[path.id])
      const direction = focusedId === path.b ? -1 : 1
      const strength = dimmed ? 0.075 : selected ? 1 : connected ? 0.72 : focusedId ? 0.15 : 0.30

      motion.setXYZW(index, grammar.familyCode, grammar.variant, grammar.harmonic, grammar.phase)
      signature.setXYZW(
        index,
        grammar.rate,
        grammar.curvature,
        inspectableEnabled && connected ? 1 : 0,
        grammar.keyScale / 32,
      )
      state.setXYZW(index, strength, selected ? 1 : 0, operative ? 1 : 0, direction)

      familyColor.set(FAMILY_COLORS[grammar.family])
      pathColor.copy(familyColor)
      if (connected && focusedAccent) pathColor.lerp(focusedAccent, 0.62)
      if (selected) pathColor.lerp(new THREE.Color('#ffe3a0'), 0.72)
      color.setXYZ(index, pathColor.r, pathColor.g, pathColor.b)
    }

    motion.needsUpdate = true
    signature.needsUpdate = true
    state.needsUpdate = true
    color.needsUpdate = true
  }, [dimmed, focusedId, geometry, inspectableEnabled, instances, selectedPathId])

  useEffect(() => {
    motionUniform.value = ornamentsEnabled ? 1 : 0
  }, [motionUniform, ornamentsEnabled])

  useEffect(() => () => {
    geometry.dispose()
    coreMaterial.dispose()
    haloMaterial.dispose()
  }, [coreMaterial, geometry, haloMaterial])

  useFrame(({ clock }) => {
    timeUniform.value = clock.elapsedTime
  })

  return (
    <group renderOrder={-1}>
      <instancedMesh ref={halo} args={[geometry, haloMaterial, PATHS.length]} frustumCulled={false} />
      <instancedMesh ref={core} args={[geometry, coreMaterial, PATHS.length]} frustumCulled={false} />
    </group>
  )
}
