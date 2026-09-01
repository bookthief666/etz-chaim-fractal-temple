import { RUNTIME_PHASE } from './phases.js'

export const RENDERER_STATUS = Object.freeze({
  HEALTHY: 'healthy',
  ENTERING: 'entering',
  RUNNING: 'running',
  CONTEXT_LOST: 'context lost',
  RESTORING: 'restoring',
  RESTORED: 'restored',
  FAILED: 'failed',
})

export const RENDERER_EVENT = Object.freeze({
  PHASE_CHANGED: 'phase changed',
  CONTEXT_LOST: 'webglcontextlost',
  RESTORE_STARTED: 'restore started',
  CONTEXT_RESTORED: 'webglcontextrestored',
  RESTORE_PRESENTED: 'restored frame presented',
  RESTORE_FAILED: 'restore failed',
  MANUAL_RESEAT: 'manual renderer reseat',
  PROGRAM_FAILED: 'shader program failed',
})

export const INITIAL_RENDERER_LIFECYCLE = Object.freeze({
  status: RENDERER_STATUS.HEALTHY,
  contextLossCount: 0,
  contextRestorationCount: 0,
  rendererRemountCount: 0,
  lastEvent: 'runtime initialized',
})

function statusForPhase(phase) {
  if (phase === RUNTIME_PHASE.INGRESS || phase === RUNTIME_PHASE.RETURN) return RENDERER_STATUS.ENTERING
  if (phase === RUNTIME_PHASE.REALM || phase === RUNTIME_PHASE.PATH) return RENDERER_STATUS.RUNNING
  return RENDERER_STATUS.HEALTHY
}

export function rendererLifecycleReducer(state, action) {
  switch (action.type) {
    case RENDERER_EVENT.PHASE_CHANGED:
      if (
        state.status === RENDERER_STATUS.CONTEXT_LOST ||
        state.status === RENDERER_STATUS.RESTORING ||
        state.status === RENDERER_STATUS.FAILED
      ) return state
      return {
        ...state,
        status: statusForPhase(action.phase),
        lastEvent: `${RENDERER_EVENT.PHASE_CHANGED}: ${action.phase}`,
      }
    case RENDERER_EVENT.CONTEXT_LOST:
      return {
        ...state,
        status: RENDERER_STATUS.CONTEXT_LOST,
        contextLossCount: state.contextLossCount + 1,
        lastEvent: RENDERER_EVENT.CONTEXT_LOST,
      }
    case RENDERER_EVENT.RESTORE_STARTED:
      return { ...state, status: RENDERER_STATUS.RESTORING, lastEvent: RENDERER_EVENT.RESTORE_STARTED }
    case RENDERER_EVENT.CONTEXT_RESTORED:
      return {
        ...state,
        status: RENDERER_STATUS.RESTORED,
        contextRestorationCount: state.contextRestorationCount + 1,
        lastEvent: RENDERER_EVENT.CONTEXT_RESTORED,
      }
    case RENDERER_EVENT.RESTORE_PRESENTED:
      return {
        ...state,
        status: statusForPhase(action.phase),
        lastEvent: RENDERER_EVENT.RESTORE_PRESENTED,
      }
    case RENDERER_EVENT.MANUAL_RESEAT:
      return {
        ...state,
        status: statusForPhase(action.phase),
        rendererRemountCount: state.rendererRemountCount + 1,
        lastEvent: action.reason ? `${RENDERER_EVENT.MANUAL_RESEAT}: ${action.reason}` : RENDERER_EVENT.MANUAL_RESEAT,
      }
    case RENDERER_EVENT.RESTORE_FAILED:
    case RENDERER_EVENT.PROGRAM_FAILED:
      return { ...state, status: RENDERER_STATUS.FAILED, lastEvent: action.message ?? action.type }
    default:
      return state
  }
}
