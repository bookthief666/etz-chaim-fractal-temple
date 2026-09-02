import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { createXRStore } from '@react-three/xr'
import Experience from './components/Experience.jsx'
import AttributionModeSelector from './components/AttributionModeSelector.jsx'
import PathInfoPanel from './components/PathInfoPanel.jsx'
import SephirahInfoPanel from './components/SephirahInfoPanel.jsx'
import ContemplationPanel from './components/ContemplationPanel.jsx'
import ExperienceModeSelector from './components/ExperienceModeSelector.jsx'
import RitualCue from './components/RitualCue.jsx'
import StudyDrawer from './components/StudyDrawer.jsx'
import TempleAtmosphere from './components/TempleAtmosphere.jsx'
import TempleThreshold from './components/TempleThreshold.jsx'
import LivingTreeSeal from './components/LivingTreeSeal.jsx'
import TransitionGate from './components/TransitionGate.jsx'
import TreeAwakening from './components/TreeAwakening.jsx'
import QaTelemetryOverlay from './components/QaTelemetryOverlay.jsx'
import { PATHS, PATH_BY_ID, SEPHIRAH_BY_ID } from './data/treeTopology.js'
import { getDirectedPathOperator } from './data/pathOperators.js'
import { REALM_PROFILES } from './data/realmProfiles.js'
import { HERMETIC_PATHS_777 } from './data/attributions/hermeticPaths777.js'
import { getUiTheme } from './data/uiTheme.js'
import { BUILD_INFO } from './data/buildInfo.js'
import { RUNTIME_CAPABILITIES } from './data/runtimeCapabilities.js'
import { loadRealmProgram, REALM_SHADER_FAMILIES } from './shaders/realmRegistry.js'
import { isRitualRuntimePhase, phaseClassName, RUNTIME_PHASE } from './runtime/phases.js'
import {
  INITIAL_RENDERER_LIFECYCLE,
  RENDERER_EVENT,
  RENDERER_STATUS,
  rendererLifecycleReducer,
} from './runtime/rendererLifecycle.js'

const xrStore = createXRStore({
  hand: true,
  controller: true,
})

const EXPERIENCE_MODES = new Set(['vision', 'study', 'contemplation'])
const RETURN_ARM_DELAY_MS = 1150
const CONTEXT_RESTORE_TIMEOUT_MS = 12000

function readExperienceMode() {
  if (typeof window === 'undefined') return 'study'
  try {
    const saved = window.localStorage?.getItem('etz-experience-mode')
    return EXPERIENCE_MODES.has(saved) ? saved : 'study'
  } catch {
    return 'study'
  }
}

function storeExperienceMode(mode) {
  try {
    window.localStorage?.setItem('etz-experience-mode', mode)
  } catch {
    // Storage can be unavailable in hardened/private browser contexts.
  }
}

export default function App() {
  const [phase, setPhase] = useState(RUNTIME_PHASE.THRESHOLD)
  const [entryKind, setEntryKind] = useState('realm')
  const [focusedId, setFocusedId] = useState(null)
  const [focusedPathId, setFocusedPathId] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [pathJourney, setPathJourney] = useState(null)
  const [attributionMode, setAttributionMode] = useState('essential')
  const [experienceMode, setExperienceMode] = useState(readExperienceMode)
  const [journeyNonce, setJourneyNonce] = useState(0)
  const [rendererNonce, setRendererNonce] = useState(0)
  const [vrSupported, setVrSupported] = useState(false)
  const [systemMessage, setSystemMessage] = useState('')
  const [realmDepthStage, setRealmDepthStage] = useState(0)
  const [realmDepthEpoch, setRealmDepthEpoch] = useState(0)
  const [pathProgress, setPathProgress] = useState(0)
  const [pathStage, setPathStage] = useState(0)
  const [studyOverlayOpen, setStudyOverlayOpen] = useState(false)
  const [returnArmed, setReturnArmed] = useState(false)
  const [thresholdLeaving, setThresholdLeaving] = useState(false)
  const [treeReadyNonce, setTreeReadyNonce] = useState(-1)
  const [treeOrnamentsReadyNonce, setTreeOrnamentsReadyNonce] = useState(-1)
  const [treeFirstLightStalled, setTreeFirstLightStalled] = useState(false)
  const [rendererLifecycle, dispatchRendererLifecycle] = useReducer(
    rendererLifecycleReducer,
    INITIAL_RENDERER_LIFECYCLE,
  )
  const [realmEntryCount, setRealmEntryCount] = useState(0)
  const [qaTelemetry, setQaTelemetry] = useState({
    webglVendor: 'pending',
    webglRenderer: 'pending',
    dpr: 1,
    qualityScale: 1,
    currentFrameMs: 0,
    rollingFrameMs: 0,
    frameP50Ms: 0,
    frameP95Ms: 0,
    rollingFps: 0,
    hitchCount: 0,
    hitchThresholdMs: 50,
    frameSampleCount: 0,
    frameScope: RUNTIME_PHASE.THRESHOLD,
    shaderProgram: 'tree-instrument',
    realmProgramState: 'tree-active',
    realmId: null,
    depthStage: 0,
  })
  const qaEnabled = useMemo(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).get('qa') === '1'
  }, [])
  const previousPhase = useRef(phase)
  const messageTimer = useRef(null)
  const thresholdTimer = useRef(null)
  const returnArmTimer = useRef(null)
  const treeStallTimer = useRef(null)
  const treeOrnamentTimer = useRef(null)
  const restoreTimer = useRef(null)

  const thresholdVisible = phase === RUNTIME_PHASE.THRESHOLD

  const focused = useMemo(
    () => (focusedId ? SEPHIRAH_BY_ID[focusedId] : null),
    [focusedId],
  )

  const selected = useMemo(
    () => (selectedId ? SEPHIRAH_BY_ID[selectedId] : null),
    [selectedId],
  )

  const selectedRealm = selected ? REALM_PROFILES[selected.id] : null
  const treePresented = treeReadyNonce === rendererNonce
  const treeOrnamentsReady = treeOrnamentsReadyNonce === rendererNonce
  const focusedDegree = useMemo(
    () => focusedId ? PATHS.filter((path) => path.a === focusedId || path.b === focusedId).length : 0,
    [focusedId],
  )

  const directedFocusedPath = useMemo(
    () => (focusedPathId && focusedId ? getDirectedPathOperator(focusedPathId, focusedId) : null),
    [focusedPathId, focusedId],
  )

  const focusedTopologyPath = useMemo(
    () => (focusedPathId ? PATH_BY_ID[focusedPathId] ?? null : null),
    [focusedPathId],
  )

  const focusedPathDocumentary = useMemo(
    () => (focusedPathId ? HERMETIC_PATHS_777[focusedPathId] ?? null : null),
    [focusedPathId],
  )

  const focusedPathDestination = useMemo(() => {
    if (!focusedTopologyPath || !focusedId) return null
    const destinationId = focusedTopologyPath.a === focusedId
      ? focusedTopologyPath.b
      : focusedTopologyPath.b === focusedId
        ? focusedTopologyPath.a
        : null
    return destinationId ? SEPHIRAH_BY_ID[destinationId] : null
  }, [focusedTopologyPath, focusedId])

  const entryTargetPosition = useMemo(() => {
    if (entryKind === 'path' && pathJourney) {
      const path = PATH_BY_ID[pathJourney.id]
      if (!path) return null
      const a = SEPHIRAH_BY_ID[path.a].position
      const b = SEPHIRAH_BY_ID[path.b].position
      return [
        (a[0] + b[0]) * 0.5,
        (a[1] + b[1]) * 0.5,
        (a[2] + b[2]) * 0.5,
      ]
    }
    return selected?.position ?? null
  }, [entryKind, pathJourney, selected])

  useEffect(() => {
    let cancelled = false
    if (!navigator.xr?.isSessionSupported) return undefined

    navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
      if (!cancelled) setVrSupported(supported)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => () => {
    if (messageTimer.current) window.clearTimeout(messageTimer.current)
    if (thresholdTimer.current) window.clearTimeout(thresholdTimer.current)
    if (returnArmTimer.current) window.clearTimeout(returnArmTimer.current)
    if (treeStallTimer.current) window.clearTimeout(treeStallTimer.current)
    if (treeOrnamentTimer.current) window.clearTimeout(treeOrnamentTimer.current)
    if (restoreTimer.current) window.clearTimeout(restoreTimer.current)
  }, [])

  useEffect(() => {
    dispatchRendererLifecycle({ type: RENDERER_EVENT.PHASE_CHANGED, phase })
    if (phase === RUNTIME_PHASE.REALM && previousPhase.current !== RUNTIME_PHASE.REALM) {
      setRealmEntryCount((count) => count + 1)
    }
    previousPhase.current = phase
  }, [phase])

  useEffect(() => {
    storeExperienceMode(experienceMode)
  }, [experienceMode])

  useEffect(() => {
    setStudyOverlayOpen(false)
  }, [phase])

  // Return controls intentionally arm only after a realm/path has been stably
  // seated. Android browsers can dispatch late/synthesized pointer events after
  // a control unmounts; without this grace period an ingress tap can strike the
  // newly mounted return control and immediately send the user back to the Tree.
  // This protects interaction integrity without removing or simplifying either
  // the HUD return action or the diegetic world-space talisman.
  useEffect(() => {
    if (returnArmTimer.current) {
      window.clearTimeout(returnArmTimer.current)
      returnArmTimer.current = null
    }

    if (!isRitualRuntimePhase(phase)) {
      setReturnArmed(false)
      return undefined
    }

    setReturnArmed(false)
    returnArmTimer.current = window.setTimeout(() => {
      setReturnArmed(true)
      returnArmTimer.current = null
    }, RETURN_ARM_DELAY_MS)

    return () => {
      if (returnArmTimer.current) {
        window.clearTimeout(returnArmTimer.current)
        returnArmTimer.current = null
      }
    }
  }, [phase, journeyNonce])

  // M4.13 first-light invariant: slow first light must never trigger a
  // destructive renderer remount. The WebGL context-loss path remains the only
  // automatic reseat authority. Here we merely keep the DOM/SVG continuity
  // layer visible until a real Tree frame arrives, then stage the ornamental
  // instrument geometry one beat later. If first light is unusually delayed,
  // expose a deliberate retry sigil instead of restarting work behind the
  // user's back.
  useEffect(() => {
    if (treeStallTimer.current) {
      window.clearTimeout(treeStallTimer.current)
      treeStallTimer.current = null
    }

    if (thresholdVisible || phase !== RUNTIME_PHASE.TREE || treePresented) {
      if (treePresented) setTreeFirstLightStalled(false)
      return undefined
    }

    setTreeFirstLightStalled(false)
    treeStallTimer.current = window.setTimeout(() => {
      treeStallTimer.current = null
      setTreeFirstLightStalled(true)
    }, 9000)

    return () => {
      if (treeStallTimer.current) {
        window.clearTimeout(treeStallTimer.current)
        treeStallTimer.current = null
      }
    }
  }, [thresholdVisible, phase, treePresented, rendererNonce])

  useEffect(() => {
    if (treeOrnamentTimer.current) {
      window.clearTimeout(treeOrnamentTimer.current)
      treeOrnamentTimer.current = null
    }

    if (!treePresented || thresholdVisible || phase !== RUNTIME_PHASE.TREE) return undefined

    // First paint belongs to the canonical Tree alone. Astrolabe rings, stars,
    // numerical crowns and documentary HTML wake only after that first light is
    // physically established.
    treeOrnamentTimer.current = window.setTimeout(() => {
      setTreeOrnamentsReadyNonce(rendererNonce)
      treeOrnamentTimer.current = null
    }, 180)

    return () => {
      if (treeOrnamentTimer.current) {
        window.clearTimeout(treeOrnamentTimer.current)
        treeOrnamentTimer.current = null
      }
    }
  }, [treePresented, thresholdVisible, phase, rendererNonce])

  const requestRendererReseat = useCallback((reason) => {
    dispatchRendererLifecycle({ type: RENDERER_EVENT.MANUAL_RESEAT, phase, reason })
    if (phase === RUNTIME_PHASE.TREE) {
      setTreeReadyNonce(-1)
      setTreeOrnamentsReadyNonce(-1)
    }
    setRendererNonce((value) => value + 1)
  }, [phase])

  const retryTreeFirstLight = useCallback(() => {
    if (thresholdVisible || phase !== RUNTIME_PHASE.TREE) return
    setTreeFirstLightStalled(false)
    requestRendererReseat('deliberate first-light retry')
  }, [thresholdVisible, phase, requestRendererReseat])

  const showSystemMessage = useCallback((message, duration = 3000) => {
    setSystemMessage(message)
    if (messageTimer.current) window.clearTimeout(messageTimer.current)
    if (duration > 0) {
      messageTimer.current = window.setTimeout(() => setSystemMessage(''), duration)
    }
  }, [])

  const focusSephirah = (id) => {
    if (thresholdVisible || phase !== RUNTIME_PHASE.TREE || !SEPHIRAH_BY_ID[id]) return

    if (experienceMode === 'vision') {
      setFocusedId(id)
      setFocusedPathId(null)
      setPathJourney(null)
      setSelectedId(id)
      setEntryKind('realm')
      setRealmDepthStage(0)
      setRealmDepthEpoch(0)
      setPathProgress(0)
      setPathStage(0)
      setJourneyNonce((value) => value + 1)
      loadRealmProgram(id).catch(() => {})
      setPhase(RUNTIME_PHASE.INGRESS)
      return
    }

    setFocusedId(id)
    setFocusedPathId(null)
  }

  const focusPath = (pathId) => {
    if (thresholdVisible || phase !== RUNTIME_PHASE.TREE || experienceMode !== 'study' || !focusedId) return
    const topologyPath = PATH_BY_ID[pathId]
    if (!topologyPath || (topologyPath.a !== focusedId && topologyPath.b !== focusedId)) return
    setFocusedPathId(pathId)
  }

  const beginJourney = (id = focusedId) => {
    if (thresholdVisible || phase !== RUNTIME_PHASE.TREE || !id || !SEPHIRAH_BY_ID[id]) return
    setFocusedId(id)
    setFocusedPathId(null)
    setPathJourney(null)
    setSelectedId(id)
    setEntryKind('realm')
    setRealmDepthStage(0)
    setRealmDepthEpoch(0)
    setPathProgress(0)
    setPathStage(0)
    setJourneyNonce((value) => value + 1)
    loadRealmProgram(id).catch(() => {})
    setPhase(RUNTIME_PHASE.INGRESS)
  }

  const beginPathJourney = (pathId = focusedPathId) => {
    if (thresholdVisible || phase !== RUNTIME_PHASE.TREE || !pathId || !focusedId) return
    const directed = getDirectedPathOperator(pathId, focusedId)
    if (!directed) return
    setSelectedId(null)
    setPathJourney(directed)
    setFocusedPathId(pathId)
    setEntryKind('path')
    setPathProgress(0)
    setPathStage(0)
    setRealmDepthStage(0)
    setRealmDepthEpoch(0)
    setJourneyNonce((value) => value + 1)
    setPhase(RUNTIME_PHASE.INGRESS)
  }

  const clearFocus = () => {
    if (phase !== RUNTIME_PHASE.TREE) return
    if (focusedPathId) setFocusedPathId(null)
    else setFocusedId(null)
  }

  const handleArrive = () => {
    setPhase(entryKind === 'path' ? RUNTIME_PHASE.PATH : RUNTIME_PHASE.REALM)
  }

  const returnToTree = () => {
    if (!isRitualRuntimePhase(phase) || !returnArmed) return
    setJourneyNonce((value) => value + 1)
    setPhase(RUNTIME_PHASE.RETURN)
  }

  const finishReturn = () => {
    const returnedId = selectedId ?? pathJourney?.sourceId ?? focusedId
    setSelectedId(null)
    setPathJourney(null)
    setFocusedPathId(null)
    setRealmDepthStage(0)
    setRealmDepthEpoch(0)
    setPathProgress(0)
    setPathStage(0)
    setFocusedId(returnedId)
    setEntryKind('realm')
    setPhase(RUNTIME_PHASE.TREE)
  }

  const finishPathJourney = (destinationId) => {
    if (!SEPHIRAH_BY_ID[destinationId]) return
    setFocusedId(destinationId)
    setFocusedPathId(null)
    setSelectedId(destinationId)
    setPathJourney(null)
    setEntryKind('realm')
    setRealmDepthStage(0)
    setRealmDepthEpoch(0)
    setPathProgress(1)
    setPathStage(3)
    loadRealmProgram(destinationId).catch(() => {})
    setPhase(RUNTIME_PHASE.REALM)
  }

  const changeExperienceMode = (mode) => {
    if (!EXPERIENCE_MODES.has(mode)) return
    setExperienceMode(mode)
    setStudyOverlayOpen(false)
    setFocusedPathId(null)
    if (mode === 'vision' && phase === RUNTIME_PHASE.TREE) setFocusedId(null)
  }

  const enterVR = async () => {
    showSystemMessage('', 0)
    try {
      await xrStore.enterVR()
    } catch (error) {
      showSystemMessage(error?.message || 'The browser could not start an immersive VR session.', 5000)
    }
  }

  const handleGraphicsFault = useCallback(() => {
    // Actual WebGL loss is the only automatic recovery trigger. Preserve the
    // current phase and ritual state while the browser restores this context.
    dispatchRendererLifecycle({ type: RENDERER_EVENT.CONTEXT_LOST })
    setReturnArmed(false)
    showSystemMessage('Graphics context lost — preserving the current rite while the browser restores it.', 0)
  }, [showSystemMessage])

  const handleGraphicsRestoreStarted = useCallback(() => {
    dispatchRendererLifecycle({ type: RENDERER_EVENT.RESTORE_STARTED })
    if (restoreTimer.current) window.clearTimeout(restoreTimer.current)
    restoreTimer.current = window.setTimeout(() => {
      restoreTimer.current = null
      dispatchRendererLifecycle({
        type: RENDERER_EVENT.RESTORE_FAILED,
        message: 'WebGL restoration timed out; ritual state remains preserved.',
      })
      showSystemMessage('Graphics restoration timed out. Use RESEAT RENDERER to retry without leaving this rite.', 0)
    }, CONTEXT_RESTORE_TIMEOUT_MS)
  }, [showSystemMessage])

  const handleGraphicsRestored = useCallback(() => {
    if (restoreTimer.current) {
      window.clearTimeout(restoreTimer.current)
      restoreTimer.current = null
    }
    dispatchRendererLifecycle({ type: RENDERER_EVENT.CONTEXT_RESTORED })
    showSystemMessage('Graphics context restored; presenting the preserved rite.', 1800)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        dispatchRendererLifecycle({ type: RENDERER_EVENT.RESTORE_PRESENTED, phase })
      })
    })
  }, [phase, showSystemMessage])

  const handleProgramError = useCallback((error) => {
    const message = error?.message || 'Realm shader program failed to load.'
    dispatchRendererLifecycle({ type: RENDERER_EVENT.PROGRAM_FAILED, message })
    showSystemMessage(`${message} Ritual state remains preserved.`, 0)
  }, [showSystemMessage])

  const handleTelemetry = useCallback((sample) => {
    if (!qaEnabled) return
    setQaTelemetry((current) => ({ ...current, ...sample }))
  }, [qaEnabled])

  const enterTemple = () => {
    if (!thresholdVisible || thresholdLeaving) return
    setThresholdLeaving(true)
    thresholdTimer.current = window.setTimeout(() => {
      setPhase(RUNTIME_PHASE.TREE)
      setThresholdLeaving(false)
      thresholdTimer.current = null
    }, 820)
  }

  const uiTheme = useMemo(
    () => getUiTheme({ focusedId, selectedId, pathJourney }),
    [focusedId, selectedId, pathJourney],
  )

  const depthLabel = selectedRealm?.depthRite?.[realmDepthStage] ?? 'Threshold'
  const depthEpochLabel = realmDepthEpoch > 0 ? ` · cycle ${realmDepthEpoch + 1}` : ''

  const pathSource = pathJourney ? SEPHIRAH_BY_ID[pathJourney.sourceId] : null
  const pathDestination = pathJourney ? SEPHIRAH_BY_ID[pathJourney.destinationId] : null
  const pathRiteLabel = pathJourney?.rite?.[pathStage] ?? 'Threshold'
  const pathPercent = Math.round(pathProgress * 100)

  const title = phase === RUNTIME_PHASE.REALM && selected
    ? selected.name
    : phase === RUNTIME_PHASE.PATH && pathJourney
      ? `${pathSource.name} → ${pathDestination.name}`
      : 'Tree of Life'

  const studySubtitle = phase === RUNTIME_PHASE.REALM && selected
    ? `${selected.hebrew} · ${selected.gloss} · ${selectedRealm?.title ?? 'Fractal realm'} · ${depthLabel}${depthEpochLabel} · drag vertically to cross depth thresholds`
    : phase === RUNTIME_PHASE.PATH && pathJourney
      ? `${pathJourney.label} · ${pathRiteLabel} · ${pathPercent}% · drag down to advance or up to rewind the metamorphosis`
      : focusedTopologyPath && focused && focusedPathDestination
        ? `${focused.name} → ${focusedPathDestination.name} · ${directedFocusedPath?.visualLaw ?? `${focusedPathDocumentary?.letter ?? ''} ${focusedPathDocumentary?.cosmicAttribution ?? 'canonical path'}`.trim()}`
        : focused
          ? `${focused.hebrew} · ${focused.gloss} · selected for study · documentary and operative layers remain distinct`
          : 'Ten Sephiroth · twenty-two paths · select a sphere to study before entering'

  const contemplationSubtitle = phase === RUNTIME_PHASE.REALM && selected
    ? `${selected.hebrew} · ${selected.gloss} · ${depthLabel}${depthEpochLabel}`
    : phase === RUNTIME_PHASE.PATH && pathJourney
      ? `${pathJourney.label} · ${pathRiteLabel}`
      : focused
        ? `${focused.hebrew} · ${focused.gloss} · contemplation threshold`
        : 'Select a sphere · attend before entering'

  const visionSubtitle = phase === RUNTIME_PHASE.TREE
    ? 'Pure Vision · tap a sphere to enter directly'
    : ''

  const subtitle = experienceMode === 'study'
    ? studySubtitle
    : experienceMode === 'contemplation'
      ? contemplationSubtitle
      : visionSubtitle

  const showTitleLockup = experienceMode !== 'vision' || phase === RUNTIME_PHASE.TREE

  const currentTarget = phase === RUNTIME_PHASE.REALM
    ? selected?.name ?? '—'
    : phase === RUNTIME_PHASE.PATH
      ? pathJourney ? `${pathSource?.name ?? pathJourney.sourceId} → ${pathDestination?.name ?? pathJourney.destinationId}` : '—'
      : focused?.name ?? 'Tree of Life'

  const defaultShaderProgram = phase === RUNTIME_PHASE.REALM && selectedId
    ? REALM_SHADER_FAMILIES[selectedId] ?? 'realm:loading'
    : phase === RUNTIME_PHASE.PATH
      ? 'path:metamorphosis'
      : 'tree:living-instrument'

  const qaReport = {
    runtime: BUILD_INFO.runtime,
    browserFamily: RUNTIME_CAPABILITIES.browserFamily,
    userAgent: RUNTIME_CAPABILITIES.userAgent,
    phase,
    currentTarget,
    shaderProgram: phase === RUNTIME_PHASE.REALM
      ? qaTelemetry.realmId === selectedId && /^(dedicated-|compatibility-)/.test(qaTelemetry.shaderProgram ?? '')
        ? qaTelemetry.shaderProgram
        : defaultShaderProgram
      : phase === RUNTIME_PHASE.PATH
        ? qaTelemetry.shaderProgram?.startsWith('path-') ? qaTelemetry.shaderProgram : defaultShaderProgram
        : defaultShaderProgram,
    depthStage: qaTelemetry.depthStage ?? (phase === RUNTIME_PHASE.PATH ? pathStage : realmDepthStage),
    dpr: qaTelemetry.dpr,
    qualityScale: qaTelemetry.qualityScale,
    currentFrameMs: qaTelemetry.currentFrameMs,
    rollingFrameMs: qaTelemetry.rollingFrameMs,
    frameP50Ms: qaTelemetry.frameP50Ms,
    frameP95Ms: qaTelemetry.frameP95Ms,
    rollingFps: qaTelemetry.rollingFps,
    hitchCount: qaTelemetry.hitchCount,
    hitchThresholdMs: qaTelemetry.hitchThresholdMs,
    frameSampleCount: qaTelemetry.frameSampleCount,
    frameScope: qaTelemetry.frameScope,
    realmProgramState: phase === RUNTIME_PHASE.REALM
      ? qaTelemetry.realmId === selectedId
        ? qaTelemetry.realmProgramState
        : 'canonical-loading'
      : phase === RUNTIME_PHASE.PATH
        ? 'operative-path-active'
        : 'tree-active',
    webglVendor: qaTelemetry.webglVendor,
    webglRenderer: qaTelemetry.webglRenderer,
    contextLossCount: rendererLifecycle.contextLossCount,
    contextRestorationCount: rendererLifecycle.contextRestorationCount,
    rendererRemountCount: rendererLifecycle.rendererRemountCount,
    realmEntryCount,
    rendererStatus: rendererLifecycle.status,
    lastLifecycleEvent: rendererLifecycle.lastEvent,
  }

  useEffect(() => {
    if (!qaEnabled) return undefined
    window.__ETZ_QA__ = {
      snapshot: () => qaReport,
      enterTemple,
      setStudyMode: () => {
        if (phase !== RUNTIME_PHASE.TREE) return false
        changeExperienceMode('study')
        return true
      },
      setDocumentaryMode: (mode) => {
        if (phase !== RUNTIME_PHASE.TREE || !['essential', 'hermetic777'].includes(mode)) return false
        setAttributionMode(mode)
        return true
      },
      focusSephirah: (id) => {
        if (phase !== RUNTIME_PHASE.TREE || !SEPHIRAH_BY_ID[id]) return false
        setFocusedId(id)
        setFocusedPathId(null)
        return true
      },
      focusPath: (pathId) => {
        const path = PATH_BY_ID[pathId]
        if (
          phase !== RUNTIME_PHASE.TREE ||
          experienceMode !== 'study' ||
          !path ||
          !focusedId ||
          (path.a !== focusedId && path.b !== focusedId)
        ) return false
        setFocusedPathId(pathId)
        return true
      },
      beginRealm: (id) => {
        if (phase !== RUNTIME_PHASE.TREE || !SEPHIRAH_BY_ID[id]) return false
        beginJourney(id)
        return true
      },
      beginPath: (pathId, sourceId) => {
        if (phase !== RUNTIME_PHASE.TREE || !SEPHIRAH_BY_ID[sourceId]) return false
        const directed = getDirectedPathOperator(pathId, sourceId)
        if (!directed) return false
        setFocusedId(sourceId)
        setSelectedId(null)
        setPathJourney(directed)
        setFocusedPathId(pathId)
        setEntryKind('path')
        setPathProgress(0)
        setPathStage(0)
        setJourneyNonce((value) => value + 1)
        setPhase(RUNTIME_PHASE.INGRESS)
        return true
      },
      returnToTree,
      reseatRenderer: () => requestRendererReseat('QA manual renderer reseat'),
    }
    return () => {
      delete window.__ETZ_QA__
    }
  })


  return (
    <main
      className={`app-shell phase-${phaseClassName(phase)} mode-${experienceMode} ${focusedId && phase === RUNTIME_PHASE.TREE ? 'tree-focus-active' : ''} ${focusedPathId && phase === RUNTIME_PHASE.TREE ? 'path-focus-active' : ''} ${thresholdVisible ? 'threshold-open' : 'threshold-cleared'} ${thresholdLeaving ? 'threshold-leaving' : ''}`}
      style={uiTheme}
    >
      <Experience
        key={rendererNonce}
        xrStore={xrStore}
        phase={phase}
        focusedId={focusedId}
        selected={selected}
        selectedPathId={focusedPathId}
        pathJourney={pathJourney}
        pathInteractionEnabled={treeOrnamentsReady && experienceMode === 'study' && !thresholdVisible}
        documentaryPathLens={treeOrnamentsReady && experienceMode === 'study' && attributionMode === 'hermetic777' && !thresholdVisible}
        treeOrnamentsEnabled={treeOrnamentsReady}
        entryTargetPosition={entryTargetPosition}
        journeyNonce={journeyNonce}
        onFocus={focusSephirah}
        onFocusPath={focusPath}
        onClearFocus={clearFocus}
        onArrive={handleArrive}
        onReturned={finishReturn}
        onReturn={returnToTree}
        returnEnabled={returnArmed}
        onDepthStage={(stage, epoch) => {
          setRealmDepthStage(stage)
          setRealmDepthEpoch(epoch)
        }}
        onPathProgress={(progress, stage) => {
          setPathProgress(progress)
          setPathStage(stage)
        }}
        onPathComplete={finishPathJourney}
        onGraphicsFault={handleGraphicsFault}
        onGraphicsRestoreStarted={handleGraphicsRestoreStarted}
        onGraphicsRestored={handleGraphicsRestored}
        onProgramError={handleProgramError}
        qaEnabled={qaEnabled}
        onTelemetry={handleTelemetry}
        treeFrameProbeActive={!thresholdVisible && phase === RUNTIME_PHASE.TREE}
        onTreeReady={() => setTreeReadyNonce(rendererNonce)}
      />

      <TempleAtmosphere phase={phase} />

      <TreeAwakening
        visible={!thresholdVisible && phase === RUNTIME_PHASE.TREE && !treePresented}
        stalled={treeFirstLightStalled}
        onRetry={retryTreeFirstLight}
      />

      {thresholdVisible ? (
        <TempleThreshold leaving={thresholdLeaving} onEnter={enterTemple} />
      ) : null}

      <TransitionGate phase={phase} selected={selected} pathJourney={pathJourney} />

      <section className="hud hud-top" aria-live="polite">
        {showTitleLockup ? (
          <div className="title-lockup">
            <div className="hud-seal"><LivingTreeSeal compact /></div>
            <div className="title-copy">
              <p className="eyebrow"><span aria-hidden="true">✶</span> ETZ CHAIM · FRACTAL TEMPLE / {BUILD_INFO.milestone}</p>
              <h1>{title}</h1>
              {subtitle ? <p className="subtitle">{subtitle}</p> : null}
              <div className="title-engraving" aria-hidden="true"><span>◇</span></div>
            </div>
          </div>
        ) : <div />}

        <div className="mode-stack">
          <ExperienceModeSelector
            value={experienceMode}
            onChange={changeExperienceMode}
            disabled={phase === RUNTIME_PHASE.INGRESS || phase === RUNTIME_PHASE.RETURN}
          />
          {phase === RUNTIME_PHASE.TREE && experienceMode === 'study' ? (
            <AttributionModeSelector
              value={attributionMode}
              onChange={setAttributionMode}
              disabled={phase !== RUNTIME_PHASE.TREE}
            />
          ) : null}
        </div>
      </section>

      <RitualCue
        mode={experienceMode}
        phase={phase}
        selectedId={selectedId}
        depthStage={realmDepthStage}
        depthEpoch={realmDepthEpoch}
        pathJourney={pathJourney}
        pathStage={pathStage}
      />

      {experienceMode === 'study' && studyOverlayOpen && isRitualRuntimePhase(phase) ? (
        <StudyDrawer
          selected={selected}
          depthStage={realmDepthStage}
          depthEpoch={realmDepthEpoch}
          pathJourney={pathJourney}
          pathStage={pathStage}
          attributionMode={attributionMode}
          onClose={() => setStudyOverlayOpen(false)}
        />
      ) : null}

      {phase === RUNTIME_PHASE.TREE && experienceMode === 'study' && focusedTopologyPath && focused ? (
        <PathInfoPanel
          path={focusedTopologyPath}
          sourceId={focused.id}
          directedOperator={directedFocusedPath}
          documentaryPath={focusedPathDocumentary}
          attributionMode={attributionMode}
          onTraverse={beginPathJourney}
          onClose={() => setFocusedPathId(null)}
        />
      ) : phase === RUNTIME_PHASE.TREE && experienceMode === 'study' && focused ? (
        <SephirahInfoPanel
          node={focused}
          attributionMode={attributionMode}
          onEnter={beginJourney}
          onClose={clearFocus}
          onChoosePath={focusPath}
        />
      ) : phase === RUNTIME_PHASE.TREE && experienceMode === 'contemplation' && focused ? (
        <ContemplationPanel
          node={focused}
          onEnter={beginJourney}
          onClose={clearFocus}
        />
      ) : null}

      <section className="hud hud-bottom">
        {experienceMode !== 'vision' ? (
          <div className="status-chip">
          <span className={`status-dot status-${phaseClassName(phase)}`} />
          {phase === RUNTIME_PHASE.TREE && (
            focusedTopologyPath && focusedPathDestination
              ? `${focused?.name ?? ''} → ${focusedPathDestination.name}${focusedPathDocumentary ? ` · ${focusedPathDocumentary.letter} ${focusedPathDocumentary.cosmicAttribution}` : ''}`
              : focused
                ? `Invoking ${focused.name} · ${focusedDegree} paths resonate`
                : 'Choose a Sephirah'
          )}
          {phase === RUNTIME_PHASE.INGRESS && (
            entryKind === 'path'
              ? `Opening path from ${pathJourney?.sourceId ? SEPHIRAH_BY_ID[pathJourney.sourceId].name : ''}`
              : `Crossing into ${selected?.name ?? ''}`
          )}
          {phase === RUNTIME_PHASE.REALM && `Inside ${selected?.name ?? ''} · ${depthLabel}`}
          {phase === RUNTIME_PHASE.PATH && `Path · ${pathRiteLabel} · ${pathPercent}%`}
          {phase === RUNTIME_PHASE.RETURN && `Ascending to the Tree`}
          </div>
        ) : <div />}

        <div className="actions">
          {isRitualRuntimePhase(phase) ? (
            <>
              {experienceMode === 'study' ? (
                <button
                  className={`control-button ${studyOverlayOpen ? 'is-active' : ''}`}
                  onClick={() => setStudyOverlayOpen((value) => !value)}
                  aria-pressed={studyOverlayOpen}
                >
                  Dossier
                </button>
              ) : null}
              <button
                className={`control-button primary ${returnArmed ? 'is-armed' : 'is-arming'}`}
                onClick={returnToTree}
                disabled={!returnArmed}
                aria-label={returnArmed ? 'Ascend to Tree' : 'Return control arming after ingress'}
              >
                {returnArmed ? 'Ascend to Tree' : 'Seal settling…'}
              </button>
            </>
          ) : (
            <button
              className="control-button"
              onClick={enterVR}
              disabled={!vrSupported || phase !== RUNTIME_PHASE.TREE}
              title={vrSupported ? 'Enter immersive VR' : 'Immersive VR is unavailable in this browser'}
            >
              {vrSupported ? 'Enter VR' : 'VR unavailable'}
            </button>
          )}
        </div>

        {systemMessage ? <p className="xr-message">{systemMessage}</p> : null}
      </section>

      {rendererLifecycle.status === RENDERER_STATUS.FAILED ? (
        <button
          className="renderer-reseat-control"
          type="button"
          onClick={() => requestRendererReseat('failed recovery requested by user')}
        >
          RESEAT RENDERER
        </button>
      ) : null}

      {qaEnabled ? <QaTelemetryOverlay report={qaReport} /> : null}
    </main>
  )
}
