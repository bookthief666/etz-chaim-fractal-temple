import { useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { XR } from '@react-three/xr'
import CameraDirector from './CameraDirector.jsx'
import FractalRealm from './FractalRealm.jsx'
import PathMetamorphosis from './PathMetamorphosis.jsx'
import ProceduralStars from './ProceduralStars.jsx'
import RendererGuard from './RendererGuard.jsx'
import TreeOfLife from './TreeOfLife.jsx'
import TreeFrameProbe from './TreeFrameProbe.jsx'
import CanvasTelemetry from './CanvasTelemetry.jsx'
import { RUNTIME_CAPABILITIES } from '../data/runtimeCapabilities.js'
import { ownsPhase, RUNTIME_PHASE } from '../runtime/phases.js'

const IS_COARSE_POINTER = RUNTIME_CAPABILITIES.coarsePointer
const DPR_RANGE = [1, RUNTIME_CAPABILITIES.maxTreeDpr]

export default function Experience({
  xrStore,
  phase,
  focusedId,
  selected,
  selectedPathId,
  pathJourney,
  pathInteractionEnabled = true,
  documentaryPathLens = false,
  treeOrnamentsEnabled = false,
  entryTargetPosition,
  journeyNonce,
  onFocus,
  onFocusPath,
  onClearFocus,
  onArrive,
  onReturned,
  onReturn,
  returnEnabled = false,
  onDepthStage,
  onPathProgress,
  onPathComplete,
  onGraphicsFault,
  onGraphicsRestoreStarted,
  onGraphicsRestored,
  onProgramError,
  qaEnabled = false,
  onTelemetry,
  treeFrameProbeActive = false,
  onTreeReady,
}) {
  const showTree = ownsPhase('canonicalTree', phase)
  const [programFailure, setProgramFailure] = useState(null)

  useEffect(() => {
    // A compiler failure belongs to one exact journey/program attempt. Never
    // poison a later realm simply because the previous requested shader failed.
    setProgramFailure(null)
  }, [journeyNonce, selected?.id, pathJourney?.id])

  const reportProgramError = useCallback((error) => {
    const normalized = error instanceof Error
      ? error
      : new Error(String(error?.message ?? error ?? 'GPU shader program failed.'))
    setProgramFailure(normalized)
    onProgramError?.(normalized)
  }, [onProgramError])

  return (
    <Canvas
      camera={{ position: [0, 0, 12.4], fov: 43, near: 0.03, far: 120 }}
      dpr={treeOrnamentsEnabled ? DPR_RANGE : 1}
      frameloop="always"
      gl={{
        antialias: !IS_COARSE_POINTER,
        powerPreference: RUNTIME_CAPABILITIES.powerPreference,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
      }}
      performance={{ min: 0.55 }}
      onPointerMissed={onClearFocus}
    >
      <XR store={xrStore}>
        <RendererGuard
          onContextLost={onGraphicsFault}
          onRestoreStarted={onGraphicsRestoreStarted}
          onContextRestored={onGraphicsRestored}
          onShaderError={reportProgramError}
        />
        {qaEnabled ? <CanvasTelemetry enabled onSample={onTelemetry} /> : null}

        {ownsPhase('treeFirstLightProbe', phase) ? <TreeFrameProbe
          active={treeFrameProbeActive}
          onReady={onTreeReady}
          frames={2}
        /> : null}

        <color attach="background" args={['#03030a']} />

        {ownsPhase('cameraDirector', phase) ? <CameraDirector
          phase={phase}
          targetId={selected?.id ?? null}
          targetPosition={entryTargetPosition}
          journeyNonce={journeyNonce}
          onArrive={onArrive}
          onReturned={onReturned}
        /> : null}

        {showTree ? (
          <>
            {treeOrnamentsEnabled ? <ProceduralStars /> : null}
            <TreeOfLife
              focusedId={focusedId}
              selectedId={selected?.id ?? null}
              selectedPathId={selectedPathId}
              pathInteractionEnabled={pathInteractionEnabled}
              documentaryPathLens={documentaryPathLens}
              ornamentsEnabled={treeOrnamentsEnabled}
              interactionLocked={phase !== RUNTIME_PHASE.TREE}
              onFocus={onFocus}
              onFocusPath={onFocusPath}
            />
            {treeOrnamentsEnabled ? <OrbitControls
              enabled={phase === RUNTIME_PHASE.TREE}
              enablePan={false}
              minDistance={8.4}
              maxDistance={17}
              minPolarAngle={Math.PI * 0.35}
              maxPolarAngle={Math.PI * 0.65}
              target={[0, 0, 0]}
            /> : null}
          </>
        ) : ownsPhase('realmRenderer', phase) && selected ? (
          <FractalRealm
            sephirah={selected}
            onReturn={onReturn}
            returnEnabled={returnEnabled}
            onDepthStage={onDepthStage}
            onRuntimeTelemetry={qaEnabled ? onTelemetry : undefined}
            onProgramError={reportProgramError}
            programFailure={programFailure}
          />
        ) : ownsPhase('pathRenderer', phase) && pathJourney ? (
          <PathMetamorphosis
            journey={pathJourney}
            onReturn={onReturn}
            returnEnabled={returnEnabled}
            onProgress={onPathProgress}
            onComplete={onPathComplete}
            onRuntimeTelemetry={qaEnabled ? onTelemetry : undefined}
          />
        ) : null}
      </XR>
    </Canvas>
  )
}
