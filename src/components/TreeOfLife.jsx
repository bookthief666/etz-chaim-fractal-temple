import { useMemo } from 'react'
import { SEPHIROTH, PATHS, SEPHIRAH_BY_ID } from '../data/treeTopology.js'
import { PATH_OPERATORS } from '../data/pathOperators.js'
import { HERMETIC_PATHS_777 } from '../data/attributions/hermeticPaths777.js'
import PathSegment from './PathSegment.jsx'
import Sephirah from './Sephirah.jsx'
import TreeInstrumentField from './TreeInstrumentField.jsx'

export default function TreeOfLife({
  focusedId,
  selectedId,
  selectedPathId,
  pathInteractionEnabled = true,
  documentaryPathLens = false,
  ornamentsEnabled = true,
  interactionLocked,
  onFocus,
  onFocusPath,
}) {
  const resonantIds = useMemo(() => {
    if (!focusedId) return new Set()
    const ids = new Set()
    for (const path of PATHS) {
      if (path.a === focusedId) ids.add(path.b)
      if (path.b === focusedId) ids.add(path.a)
    }
    return ids
  }, [focusedId])

  return (
    <group>
      {ornamentsEnabled ? <TreeInstrumentField focusedId={focusedId} interactionLocked={interactionLocked} /> : null}
      {PATHS.map((path) => (
        <PathSegment
          key={path.id}
          path={path}
          start={SEPHIRAH_BY_ID[path.a].position}
          end={SEPHIRAH_BY_ID[path.b].position}
          focusedId={focusedId}
          selectedPathId={selectedPathId}
          dimmed={interactionLocked}
          inspectable={pathInteractionEnabled}
          traversable={Boolean(PATH_OPERATORS[path.id])}
          documentary={HERMETIC_PATHS_777[path.id]}
          showDocumentary={documentaryPathLens}
          ornamentsEnabled={ornamentsEnabled}
          onFocusPath={onFocusPath}
        />
      ))}

      {SEPHIROTH.map((node) => (
        <Sephirah
          key={node.id}
          node={node}
          focused={focusedId === node.id}
          selected={selectedId === node.id}
          disabled={interactionLocked}
          resonant={resonantIds.has(node.id)}
          dimmed={Boolean(focusedId && focusedId !== node.id && !resonantIds.has(node.id))}
          ornamentsEnabled={ornamentsEnabled}
          onFocus={onFocus}
        />
      ))}
    </group>
  )
}
