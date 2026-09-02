import { sacredGeometryGLSL } from './modules/sacredGeometry.js'
import { paletteGLSL } from './modules/palette.js'
import { realmKernelsGLSL } from './modules/realmKernels.js'

export const realmVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const REALM_ORDER = Object.freeze([
  'kether',
  'chokmah',
  'binah',
  'chesed',
  'geburah',
  'tiphareth',
  'netzach',
  'hod',
  'yesod',
  'malkuth',
])

const REALM_CONFIG = Object.freeze({
  kether: {
    drift: '0.28', stepBudget: 'mix(40.0, 66.0, clamp(uQuality, 0.0, 1.0))',
    background: 'vec3 base = mix(vec3(0.004, 0.006, 0.012), uAuraColor * 0.12, 0.22 + vertical * 0.18);',
    shade: `
      float source = exp(-2.1 * length(hitPoint));
      color = mix(vec3(0.54, 0.62, 0.78), uCoreColor, 0.76 + source * 0.18);
      color += uAccentColor * (rim * 1.45 + source * 1.15) * uGlowStrength;
      color *= 0.88 + 0.12 * pulse;
    `,
    fog: '0.032', missExposure: '0.56', hitExposure: '0.54',
  },
  chokmah: {
    drift: '1.02', stepBudget: 'mix(54.0, 84.0, clamp(uQuality, 0.0, 1.0))',
    background: 'vec3 base = mix(vec3(0.0008, 0.001, 0.004), uAuraColor * 0.14, 0.18 + vertical * 0.18);',
    shade: `
      float surge = pow(0.5 + 0.5 * sin(hitPoint.z * 16.0 - uTime * 1.4 * uMotionScale), 4.0);
      color += uAccentColor * surge * 0.62 * uGlowStrength;
    `,
    fog: '0.032', missExposure: '1.05', hitExposure: '1.02',
  },
  binah: {
    drift: '0.82', stepBudget: 'mix(54.0, 84.0, clamp(uQuality, 0.0, 1.0))',
    background: 'vec3 base = mix(vec3(0.0004, 0.0001, 0.0004), uAuraColor * 0.07, 0.14 + vertical * 0.12);',
    shade: `
      float strata = floor(diffuse * 6.0) / 6.0;
      color = mix(uAuraColor * 0.12, uCoreColor * 0.86, strata);
      color += uAccentColor * linePattern * 0.16 * uGlowStrength;
    `,
    fog: '0.023', missExposure: '1.05', hitExposure: '0.86',
  },
  chesed: {
    drift: '0.82', stepBudget: 'mix(54.0, 84.0, clamp(uQuality, 0.0, 1.0))',
    background: 'vec3 base = mix(vec3(0.0008, 0.001, 0.004), uAuraColor * 0.14, 0.18 + vertical * 0.18);',
    shade: `
      color = spectralMix(uAuraColor, uCoreColor, uAccentColor, linePattern * PI + pulse);
      color *= 0.52 + diffuse * 0.72;
      color += uAccentColor * rim * 0.44;
    `,
    fog: '0.032', missExposure: '1.05', hitExposure: '1.02',
  },
  geburah: {
    drift: '0.82', stepBudget: 'mix(54.0, 84.0, clamp(uQuality, 0.0, 1.0))',
    background: 'vec3 base = mix(vec3(0.0008, 0.001, 0.004), uAuraColor * 0.14, 0.18 + vertical * 0.18);',
    shade: `
      float cutFlash = pow(0.5 + 0.5 * sin((hitPoint.x - hitPoint.y) * 19.0 - uTime * 1.8), 10.0);
      color += uAccentColor * cutFlash * 0.95 * uGlowStrength;
      color *= 0.73 + 0.42 * step(0.15, diffuse);
    `,
    fog: '0.032', missExposure: '1.05', hitExposure: '1.02',
  },
  netzach: {
    drift: '0.82', stepBudget: 'mix(54.0, 84.0, clamp(uQuality, 0.0, 1.0))',
    background: 'vec3 base = mix(vec3(0.0008, 0.001, 0.004), uAuraColor * 0.14, 0.18 + vertical * 0.18);',
    shade: `
      float sap = 0.5 + 0.5 * sin(hitPoint.y * 7.0 + hitPoint.z * 5.0 - uTime * 0.42);
      color = mix(uAuraColor * 0.35, uCoreColor, 0.44 + 0.48 * sap);
      color += uAccentColor * (rim * 0.55 + linePattern * 0.24) * uGlowStrength;
    `,
    fog: '0.032', missExposure: '1.05', hitExposure: '1.02',
  },
  hod: {
    drift: '0.36', stepBudget: 'mix(46.0, 74.0, clamp(uQuality, 0.0, 1.0))',
    background: 'vec3 base = mix(vec3(0.0008, 0.001, 0.004), uAuraColor * 0.14, 0.18 + vertical * 0.18);',
    shade: `
      float bit = step(0.56, fract((hitPoint.x + hitPoint.y * 2.0 + hitPoint.z * 3.0) * 5.0 + uTime * 0.24));
      color = mix(uAuraColor * 0.28, uCoreColor, diffuse * 0.72 + bit * 0.22);
      color += uAccentColor * linePattern * 0.78 * uGlowStrength;
    `,
    fog: '0.032', missExposure: '0.72', hitExposure: '0.68',
  },
  yesod: {
    drift: '0.82', stepBudget: 'mix(54.0, 84.0, clamp(uQuality, 0.0, 1.0))',
    background: 'vec3 base = mix(vec3(0.001, 0.0005, 0.009), uAuraColor * 0.16, 0.23 + vertical * 0.21);',
    shade: `
      float phase = 0.5 + 0.5 * sin(hitPoint.x * 10.0 + hitPoint.y * 7.0 - hitPoint.z * 8.0 + uTime * 0.72);
      color = mix(uAuraColor * 0.32, uCoreColor, 0.42 + 0.44 * phase);
      color += uAccentColor * (rim * 0.5 + linePattern * 0.42) * uGlowStrength;
    `,
    fog: '0.032', missExposure: '1.05', hitExposure: '0.90',
  },
})

function braceBody(source, token) {
  const tokenIndex = source.indexOf(token)
  if (tokenIndex < 0) throw new Error(`Realm shader source token missing: ${token}`)
  const open = source.indexOf('{', tokenIndex)
  let depth = 1
  for (let index = open + 1; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1
    if (source[index] === '}') depth -= 1
    if (depth === 0) return source.slice(open + 1, index)
  }
  throw new Error(`Realm shader source block is unbalanced: ${token}`)
}

function fullFunction(source, token) {
  const tokenIndex = source.indexOf(token)
  if (tokenIndex < 0) throw new Error(`Realm shader function missing: ${token}`)
  const open = source.indexOf('{', tokenIndex)
  let depth = 1
  for (let index = open + 1; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1
    if (source[index] === '}') depth -= 1
    if (depth === 0) return source.slice(tokenIndex, index + 1)
  }
  throw new Error(`Realm shader function is unbalanced: ${token}`)
}

const SACRED_FUNCTION_ORDER = Object.freeze([
  'hash11',
  'rot',
  'sdSphere',
  'sdBox',
  'sdRoundBox',
  'sdTorus',
  'sdBoxFrame',
  'sdOctahedron',
  'smoothUnion',
  'smoothSubtraction',
  'sdSegment2D',
  'polarPoint',
  'polarRepeat',
  'polarRingCell',
  'sdPentagramPrism',
  'triangleLines',
  'sdHexagramPrism',
  'sdRadialWaveRing',
  'sdHelixTube',
  'sdWaveRibbon',
  'sdTesseractFrameLike',
  'repeatCell',
  'neonBands',
])

const SACRED_FUNCTIONS = Object.fromEntries(
  SACRED_FUNCTION_ORDER.map((name) => [name, fullFunction(sacredGeometryGLSL, `${name}(`)]),
)

function selectedSacredGeometrySource(kernelSource) {
  const required = new Set(['hash11'])
  let dependencyText = kernelSource
  let changed = true

  while (changed) {
    changed = false
    for (const name of SACRED_FUNCTION_ORDER) {
      if (required.has(name) || !dependencyText.includes(`${name}(`)) continue
      required.add(name)
      dependencyText += `\n${SACRED_FUNCTIONS[name]}`
      changed = true
    }
  }

  return /* glsl */ `
    const float PI = 3.141592653589793;
    const float TAU = 6.283185307179586;
    ${SACRED_FUNCTION_ORDER.filter((name) => required.has(name)).map((name) => SACRED_FUNCTIONS[name]).join('\n')}
  `
}

function selectedPaletteSource(shadeSource) {
  const names = ['spectralMix', 'neonSurface', 'filmicCompress']
  const required = new Set(['neonSurface', 'filmicCompress'])
  if (shadeSource.includes('spectralMix(')) required.add('spectralMix')
  return names.filter((name) => required.has(name)).map((name) => fullFunction(paletteGLSL, `${name}(`)).join('\n')
}

const SHARED_KERNEL_PREAMBLE = [
  fullFunction(realmKernelsGLSL, 'float crossVoid'),
  fullFunction(realmKernelsGLSL, 'float depthStageOn'),
  fullFunction(realmKernelsGLSL, 'float depthGatePulse'),
].join('\n')

function selectedKernelSource(realmId) {
  const realmIndex = REALM_ORDER.indexOf(realmId) + 1
  if (realmIndex < 1 || realmIndex > 9) throw new Error(`Generated realm kernel unavailable: ${realmId}`)

  const glyphSection = realmKernelsGLSL.slice(
    realmKernelsGLSL.indexOf('float realmGlyphDE'),
    realmKernelsGLSL.indexOf('float realmLinePattern'),
  )
  const lineSection = realmKernelsGLSL.slice(realmKernelsGLSL.indexOf('float realmLinePattern'))
  const branch = `if (uRealmKind < ${realmIndex}.5)`

  const physicalKernel = realmId === 'kether' ? 'ketherGeneratedDE' : `${realmId}DE`
  const ketherGlyphSource = realmId === 'kether'
    ? fullFunction(realmKernelsGLSL, 'float ketherGeneratedGlyphDE')
    : ''
  const ketherBasisSource = realmId === 'kether'
    ? [
        fullFunction(realmKernelsGLSL, 'vec2 combinePhaseBasis'),
        fullFunction(realmKernelsGLSL, 'vec2 rotateWithBasis'),
        fullFunction(realmKernelsGLSL, 'float sdTesseractFrameLikeBasis'),
      ].join('\n')
    : ''
  const glyphBody = realmId === 'kether'
    ? 'return ketherGeneratedGlyphDE(p);'
    : braceBody(glyphSection, branch)

  return /* glsl */ `
    ${SHARED_KERNEL_PREAMBLE}
    ${ketherBasisSource}
    ${fullFunction(realmKernelsGLSL, `float ${physicalKernel}`)}
    ${ketherGlyphSource}

    float realmDE(vec3 p, float octave) {
      return ${physicalKernel}(p, octave);
    }

    float realmGlyphDE(vec3 p, float octave) {
      float t = uTime * uMotionScale;
      ${glyphBody}
    }

    float realmLinePattern(vec3 p) {
      float a = atan(p.y, p.x);
      float t = uTime * uMotionScale;
      float rite = 0.15 * uDepthStage + 0.08 * uDepthPhase;
      ${braceBody(lineSection, branch)}
    }
  `
}

export function createGeneratedRealmProgram(realmId) {
  const config = REALM_CONFIG[realmId]
  if (!config) throw new Error(`No generated realm configuration for ${realmId}`)
  const realmKind = REALM_ORDER.indexOf(realmId) + 1
  const kernelSource = selectedKernelSource(realmId)
  const sacredSource = selectedSacredGeometrySource(kernelSource)
  const paletteSource = selectedPaletteSource(config.shade)
  const ketherUniforms = realmId === 'kether' ? /* glsl */ `
    uniform vec4 uKetherPhysicalBasis0;
    uniform vec4 uKetherPhysicalBasis1;
    uniform vec4 uKetherGlyphBasis0;
    uniform vec4 uKetherGlyphBasis1;
  ` : ''

  const fragment = /* glsl */ `
    precision highp float;

    uniform float uTime;
    uniform float uLogZoom;
    uniform float uSeed;
    uniform float uGlowStrength;
    uniform float uMotionScale;
    uniform float uSymbolDensity;
    uniform float uQuality;
    uniform float uInteraction;
    uniform float uDepthStage;
    uniform float uDepthPhase;
    uniform float uDepthEpoch;
    uniform vec3 uCoreColor;
    uniform vec3 uAuraColor;
    uniform vec3 uAccentColor;
    ${ketherUniforms}

    varying vec3 vWorldPosition;

    #define MAX_STEPS 96
    #define MAX_DIST 44.0
    #define SURF_EPS 0.00145

    ${sacredSource}
    ${paletteSource}
    ${kernelSource}

    float safeDistance(float d) {
      if (!(d > -128.0 && d < 128.0)) return 2.0;
      return clamp(d, -16.0, 16.0);
    }

    // The logarithmic rebase law is constant for every probe made by one
    // fragment. Build its affine transform once in main() rather than repeating
    // hashes, trigonometry and matrix construction at every march/normal probe.
    mat3 realmDomainRotation(float xyAngle, float xzAngle) {
      float cxy = cos(xyAngle);
      float sxy = sin(xyAngle);
      float cxz = cos(xzAngle);
      float sxz = sin(xzAngle);
      return mat3(
        cxz * cxy, sxy, sxz * cxy,
        -cxz * sxy, cxy, -sxz * sxy,
        -sxz, 0.0, cxz
      );
    }

    void createRealmDomain(
      out mat3 domainRotation,
      out vec3 domainOffset,
      out float localScale,
      out float octave
    ) {
      octave = floor(uLogZoom);
      float localPhase = fract(uLogZoom);
      localScale = exp2(localPhase * 2.65);
      vec3 domainShift = vec3(
        hash11(octave + uSeed * 3.1) - 0.5,
        hash11(octave + uSeed * 5.7) - 0.5,
        hash11(octave + uSeed * 9.2) - 0.5
      );
      float excite = uInteraction * (0.055 + 0.02 * sin(uTime * 4.2 + octave));
      float riteTwist = (uDepthStage - 1.5) * 0.012 + uDepthEpoch * 0.008;
      domainRotation = realmDomainRotation(
        excite + riteTwist,
        -excite * 0.68 - riteTwist * 0.47
      );
      domainOffset = domainRotation * (domainShift * ${config.drift});
    }

    vec4 rebasedPoint(vec3 p, mat3 domainRotation, vec3 domainOffset, float localScale) {
      return vec4(domainRotation * (p * localScale) + domainOffset, localScale);
    }

    float mapPhysicalLocal(vec4 local, float octave) {
      return safeDistance(realmDE(local.xyz, octave)) / local.w;
    }

    float mapGlyphLocal(vec4 local, float octave) {
      return safeDistance(realmGlyphDE(local.xyz, octave)) / local.w;
    }

    float mapPhysical(
      vec3 p,
      mat3 domainRotation,
      vec3 domainOffset,
      float localScale,
      float octave
    ) {
      return mapPhysicalLocal(
        rebasedPoint(p, domainRotation, domainOffset, localScale),
        octave
      );
    }

    vec3 calcNormal(
      vec3 p,
      mat3 domainRotation,
      vec3 domainOffset,
      float localScale,
      float octave
    ) {
      vec2 e = vec2(SURF_EPS, 0.0);
      float d = mapPhysical(p, domainRotation, domainOffset, localScale, octave);
      vec3 g = vec3(
        mapPhysical(p + e.xyy, domainRotation, domainOffset, localScale, octave) - d,
        mapPhysical(p + e.yxy, domainRotation, domainOffset, localScale, octave) - d,
        mapPhysical(p + e.yyx, domainRotation, domainOffset, localScale, octave) - d
      );
      float l = length(g);
      if (!(l > 0.00001 && l < 1000.0)) return vec3(0.0, 0.0, 1.0);
      return g / l;
    }

    float raymarch(
      vec3 ro,
      vec3 rd,
      mat3 domainRotation,
      vec3 domainOffset,
      float localScale,
      float octave,
      out vec3 hitPoint,
      out float glowAccum,
      out float glyphAccum
    ) {
      float travel = 0.0;
      glowAccum = 0.0;
      glyphAccum = 0.0;
      hitPoint = ro;
      float stepBudget = ${config.stepBudget};
      for (int i = 0; i < MAX_STEPS; i++) {
        if (float(i) > stepBudget) break;
        vec3 p = ro + rd * travel;
        vec4 local = rebasedPoint(p, domainRotation, domainOffset, localScale);
        float d = mapPhysicalLocal(local, octave);
        hitPoint = p;
        float nearField = exp(-abs(d) * mix(12.0, 19.0, uSymbolDensity));
        glowAccum += nearField * mix(0.0055, 0.0105, uQuality);

        // Decorative/emissive distance is not physical geometry. Sample it on
        // alternating steps and compensate its integral, matching the accepted
        // Malkuth/Tiphareth fast path without reducing the glyph's brightness or
        // allowing normal probes to evaluate it at all.
        if (mod(float(i), 2.0) < 0.5) {
          float glyphD = mapGlyphLocal(local, octave);
          float glyphNear = exp(-abs(glyphD) * mix(20.0, 34.0, uSymbolDensity));
          glyphAccum += glyphNear * mix(0.0130, 0.0250, uQuality) * (0.85 + 0.55 * uInteraction);
        }
        if (abs(d) < SURF_EPS || travel > MAX_DIST) break;
        travel += max(abs(d) * 0.70, 0.0030);
        if (!(travel >= 0.0 && travel < MAX_DIST + 8.0)) {
          travel = MAX_DIST + 1.0;
          break;
        }
      }
      glowAccum = min(glowAccum, 1.30);
      glyphAccum = min(glyphAccum, 1.45);
      return travel;
    }

    vec3 realmBackground(vec3 rd) {
      float vertical = clamp(0.5 + 0.5 * rd.y, 0.0, 1.0);
      float angular = atan(rd.y, rd.x);
      float pulse = 0.5 + 0.5 * sin(uTime * 0.12 * uMotionScale + uSeed);
      ${config.background}
      float aurora = pow(0.5 + 0.5 * sin(angular * ${realmKind + 2}.0 + rd.z * 8.0 + uTime * 0.08), 10.0);
      return base
        + uAccentColor * aurora * 0.028 * (0.65 + 0.35 * pulse)
        + mix(uCoreColor, uAccentColor, 0.55) * depthGatePulse() * 0.018;
    }

    vec3 shadeRealm(vec3 hitPoint, vec3 n, vec3 rd, float travel, float glowAccum, float glyphAccum) {
      vec3 lightDir = normalize(vec3(0.5, 0.8, -0.35));
      float diffuse = 0.14 + 0.86 * max(dot(n, lightDir), 0.0);
      float facing = max(dot(n, -rd), 0.0);
      float rim = pow(1.0 - facing, 2.15);
      float pulse = 0.5 + 0.5 * sin(uTime * (0.36 + uMotionScale * 0.34) + uSeed);
      float linePattern = realmLinePattern(hitPoint);
      vec3 color = neonSurface(
        uAuraColor, uCoreColor, uAccentColor, diffuse, rim, pulse, linePattern, uGlowStrength
      );
      ${config.shade}
      color += mix(uCoreColor, uAccentColor, 0.62) * depthGatePulse() * 0.12;
      color += uAccentColor * glowAccum * 0.52 * uGlowStrength;
      color += mix(uCoreColor, uAccentColor, 0.68) * glyphAccum * 0.78 * uGlowStrength;
      color *= 1.0 + 0.08 * uInteraction;
      float fog = 1.0 - exp(-${config.fog} * travel * travel);
      return mix(color, realmBackground(rd), fog);
    }

    void main() {
      vec3 ro = vec3(0.0, 0.0, 2.72);
      vec3 rd = normalize(vWorldPosition - cameraPosition);
      vec3 hitPoint = vec3(0.0);
      float glowAccum = 0.0;
      float glyphAccum = 0.0;
      mat3 domainRotation;
      vec3 domainOffset;
      float localScale;
      float octave;
      createRealmDomain(domainRotation, domainOffset, localScale, octave);
      float travel = raymarch(
        ro,
        rd,
        domainRotation,
        domainOffset,
        localScale,
        octave,
        hitPoint,
        glowAccum,
        glyphAccum
      );
      float starHash = hash11(dot(floor(rd * 720.0), vec3(17.0, 31.0, 47.0)) + uSeed);
      float star = pow(max(0.0, starHash - 0.992), 4.0) * 5.0;
      vec3 background = realmBackground(rd);
      vec3 atmosphericGlow = uAccentColor * glowAccum * 0.29 * uGlowStrength;
      atmosphericGlow += mix(uCoreColor, uAccentColor, 0.72) * glyphAccum * 0.52 * uGlowStrength;
      if (travel > MAX_DIST) {
        gl_FragColor = vec4(filmicCompress(background + atmosphericGlow + star, ${config.missExposure}), 1.0);
        return;
      }
      vec3 n = calcNormal(hitPoint, domainRotation, domainOffset, localScale, octave);
      vec3 color = shadeRealm(hitPoint, n, rd, travel, glowAccum, glyphAccum);
      gl_FragColor = vec4(filmicCompress(color + star, ${config.hitExposure}), 1.0);
    }
  `

  return Object.freeze({
    realmId,
    family: `dedicated-generated-${realmId}`,
    vertex: realmVertexShader,
    fragment,
  })
}
