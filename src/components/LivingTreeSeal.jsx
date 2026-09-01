import { useId } from 'react'
import { PATHS, SEPHIROTH, SEPHIRAH_BY_ID } from '../data/treeTopology.js'

function project(position) {
  const [x, y] = position
  return [50 + x * 14.2, 50 - y * 8.55]
}

export default function LivingTreeSeal({ compact = false }) {
  const id = useId().replace(/:/g, '')
  const glowId = `treeSealGlow-${id}`
  const nodeId = `treeSealNode-${id}`

  return (
    <div className={`living-tree-seal ${compact ? 'is-compact' : ''}`} aria-hidden="true">
      <div className="living-tree-orbit orbit-a" />
      <div className="living-tree-orbit orbit-b" />
      <div className="living-tree-orbit orbit-c" />
      <svg viewBox="0 0 100 100" role="presentation">
        <defs>
          <filter id={glowId} x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={nodeId} cx="38%" cy="32%" r="72%">
            <stop offset="0" stopColor="#fff9df" />
            <stop offset="0.34" stopColor="var(--temple-accent)" />
            <stop offset="1" stopColor="rgba(5,3,15,0.25)" />
          </radialGradient>
        </defs>

        <g className="seal-paths">
          {PATHS.map((path, index) => {
            const [x1, y1] = project(SEPHIRAH_BY_ID[path.a].position)
            const [x2, y2] = project(SEPHIRAH_BY_ID[path.b].position)
            return (
              <line
                key={path.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                style={{ '--seal-delay': `${-index * 0.17}s` }}
              />
            )
          })}
        </g>

        <g className="seal-nodes" filter={`url(#${glowId})`}>
          {SEPHIROTH.map((node, index) => {
            const [cx, cy] = project(node.position)
            return (
              <g key={node.id} style={{ '--seal-delay': `${-index * 0.31}s` }}>
                <circle className="seal-node-aura" cx={cx} cy={cy} r={index === 0 ? 3.25 : 2.7} />
                <circle className="seal-node-core" cx={cx} cy={cy} r={index === 0 ? 1.75 : 1.42} fill={`url(#${nodeId})`} />
              </g>
            )
          })}
        </g>
      </svg>
      <div className="living-tree-crosshair" />
    </div>
  )
}
