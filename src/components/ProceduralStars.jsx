import { useMemo } from 'react'
import * as THREE from 'three'

function lcg(seed) {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0xffffffff
  }
}

export default function ProceduralStars({ count = 900, radius = 34 }) {
  const geometry = useMemo(() => {
    const random = lcg(0x7770c0de)
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i += 1) {
      const z = random() * 2 - 1
      const theta = random() * Math.PI * 2
      const r = radius * (0.72 + random() * 0.28)
      const xy = Math.sqrt(1 - z * z)
      positions[i * 3] = r * xy * Math.cos(theta)
      positions[i * 3 + 1] = r * xy * Math.sin(theta)
      positions[i * 3 + 2] = r * z
    }

    const next = new THREE.BufferGeometry()
    next.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return next
  }, [count, radius])

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#b7c4e5" size={0.035} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
    </points>
  )
}
