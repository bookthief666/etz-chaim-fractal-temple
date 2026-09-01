const LOADERS = Object.freeze({
  kether: () => import('./realms/kether.js'),
  chokmah: () => import('./realms/chokmah.js'),
  binah: () => import('./realms/binah.js'),
  chesed: () => import('./realms/chesed.js'),
  geburah: () => import('./realms/geburah.js'),
  tiphareth: () => import('./tipharethRealm.js').then((module) => ({
    default: {
      realmId: 'tiphareth',
      family: 'dedicated-solar-tiphareth',
      vertex: module.tipharethVertexShader,
      fragment: module.tipharethFragmentShader,
    },
  })),
  netzach: () => import('./realms/netzach.js'),
  hod: () => import('./realms/hod.js'),
  yesod: () => import('./realms/yesod.js'),
  malkuth: () => import('./malkuthRealm.js').then((module) => ({
    default: {
      realmId: 'malkuth',
      family: 'dedicated-mineral-malkuth',
      vertex: module.malkuthVertexShader,
      fragment: module.malkuthFragmentShader,
    },
  })),
})

export const REALM_SHADER_IDS = Object.freeze(Object.keys(LOADERS))
export const REALM_SHADER_FAMILIES = Object.freeze(Object.fromEntries(
  REALM_SHADER_IDS.map((id) => [
    id,
    id === 'malkuth'
      ? 'dedicated-mineral-malkuth'
      : id === 'tiphareth'
        ? 'dedicated-solar-tiphareth'
        : `dedicated-generated-${id}`,
  ]),
))

const programCache = new Map()
const requestCache = new Map()

export function getLoadedRealmProgram(realmId) {
  return programCache.get(realmId) ?? null
}

export function loadRealmProgram(realmId) {
  if (programCache.has(realmId)) return Promise.resolve(programCache.get(realmId))
  if (!LOADERS[realmId]) return Promise.reject(new Error(`Unknown realm shader: ${realmId}`))
  if (!requestCache.has(realmId)) {
    requestCache.set(realmId, LOADERS[realmId]().then((module) => {
      const program = Object.freeze(module.default)
      programCache.set(realmId, program)
      return program
    }).catch((error) => {
      requestCache.delete(realmId)
      throw error
    }))
  }
  return requestCache.get(realmId)
}
