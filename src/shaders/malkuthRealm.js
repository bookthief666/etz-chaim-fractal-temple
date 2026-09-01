import { sacredGeometryGLSL } from './modules/sacredGeometry.js'
import { paletteGLSL } from './modules/palette.js'

// M4.10: Malkuth gets a dedicated program rather than entering through the
// 10-realm monolithic dispatcher. The visible grammar is preserved: repeated
// crystal cells, fourfold gates, tenfold rings, mineral corridor and recursive
// inner crystal. This reduces first-entry compiler pressure on mobile WebGL and
// removes unrelated Sephirah kernels from Malkuth's runtime program.
export const malkuthVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const malkuthFragmentShader = /* glsl */ `
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

  varying vec3 vWorldPosition;

  #define MAX_STEPS 84
  #define MAX_DIST 44.0
  #define SURF_EPS 0.00155

  ${sacredGeometryGLSL}
  ${paletteGLSL}

  float depthGatePulse() {
    float edge = min(uDepthPhase, 1.0 - uDepthPhase);
    return exp(-edge * edge * 240.0);
  }

  float safeDistance(float d) {
    if (!(d > -128.0 && d < 128.0)) return 2.0;
    return clamp(d, -16.0, 16.0);
  }

  // Exact M3A/M4.9 Malkuth structural grammar, compiled in isolation.
  float malkuthDE(vec3 p, float octave) {
    float t = uTime * 0.17 * uMotionScale;
    vec3 q = p;
    q.xz *= rot(0.025 * sin(t) + uDepthEpoch * 0.015);

    vec3 cell = repeatCell(q + vec3(0.0, t * 0.035, 0.0), 1.04);
    float crystal = sdOctahedron(cell, 0.34 + 0.016 * sin(t + octave));
    float cage = sdBoxFrame(cell, vec3(0.37), 0.015);
    float material = min(crystal, cage);

    vec3 strataP = q;
    strataP.y = mod(strataP.y + 0.32, 0.64) - 0.32;
    float strata = abs(strataP.y + 0.045 * sin(q.x * 3.2) * sin(q.z * 3.2)) - 0.018;

    float fourfold = sdRadialWaveRing(q, 4.0, 0.72, 0.09, 0.021);
    float tenfold = sdRadialWaveRing(q, 10.0, 1.08, 0.045, 0.014);
    float d = min(material, min(strata, min(fourfold, tenfold)));

    if (uDepthStage > 0.5) {
      vec3 gate = polarRingCell(q, 4.0, 0.78);
      float elementalGate = sdBoxFrame(gate, vec3(0.18, 0.31, 0.12), 0.012);
      d = min(d, elementalGate);
    }

    if (uDepthStage > 1.5) {
      vec3 corridor = q;
      float slice = floor((corridor.z + 0.48) / 0.96);
      corridor.z = mod(corridor.z + 0.48, 0.96) - 0.48;
      corridor.xy *= rot(slice * PI * 0.5);
      float hall = sdBoxFrame(corridor, vec3(0.58, 0.58, 0.39), 0.015);
      float altar = sdOctahedron(corridor, 0.25) - 0.008;
      d = min(d, min(hall, altar));
    }

    if (uDepthStage > 2.5) {
      vec3 seed = repeatCell(q * 2.1, 1.04);
      float innerCrystal = sdOctahedron(seed, 0.31) / 2.1;
      float innerCage = sdBoxFrame(seed, vec3(0.34), 0.010) / 2.1;
      d = min(d, min(innerCrystal, innerCage));
    }
    return d;
  }

  float malkuthGlyphDE(vec3 p) {
    vec3 cell = repeatCell(p, 1.04);
    float lattice = sdBoxFrame(cell, vec3(0.37), 0.009);
    float ten = sdRadialWaveRing(p, 10.0, 0.94, 0.036, 0.008);
    float d = min(lattice, ten);
    if (uDepthStage > 0.5) {
      vec3 gate = polarRingCell(p, 4.0, 0.78);
      d = min(d, sdBoxFrame(gate, vec3(0.16, 0.26, 0.08), 0.006));
    }
    if (uDepthStage > 2.5) {
      vec3 inner = repeatCell(p * 2.0, 1.04);
      d = min(d, sdOctahedron(inner, 0.29) / 2.0);
    }
    return d;
  }

  float malkuthLinePattern(vec3 p) {
    float a = atan(p.y, p.x);
    float t = uTime * uMotionScale;
    float rite = 0.15 * uDepthStage + 0.08 * uDepthPhase;
    return max(
      neonBands(p, 11.0 + rite, t * 0.18),
      pow(0.5 + 0.5 * cos(10.0 * a), 12.0)
    );
  }

  vec4 rebasedPoint(vec3 p) {
    float octave = floor(uLogZoom);
    float localPhase = fract(uLogZoom);
    float localScale = exp2(localPhase * 2.65);
    vec3 q = p * localScale;
    vec3 domainShift = vec3(
      hash11(octave + uSeed * 3.1) - 0.5,
      hash11(octave + uSeed * 5.7) - 0.5,
      hash11(octave + uSeed * 9.2) - 0.5
    );
    q += domainShift * 0.42;

    float excite = uInteraction * (0.055 + 0.02 * sin(uTime * 4.2 + octave));
    float riteTwist = (uDepthStage - 1.5) * 0.012 + uDepthEpoch * 0.008;
    q.xy *= rot(excite + riteTwist);
    q.xz *= rot(-excite * 0.68 - riteTwist * 0.47);
    return vec4(q, localScale);
  }

  float mapSurface(vec3 p) {
    vec4 local = rebasedPoint(p);
    return safeDistance(malkuthDE(local.xyz, floor(uLogZoom))) / local.w;
  }

  float mapGlyph(vec3 p) {
    vec4 local = rebasedPoint(p);
    return safeDistance(malkuthGlyphDE(local.xyz)) / local.w;
  }

  vec3 calcNormal(vec3 p) {
    vec2 e = vec2(SURF_EPS, 0.0);
    float d = mapSurface(p);
    vec3 g = vec3(
      mapSurface(p + e.xyy) - d,
      mapSurface(p + e.yxy) - d,
      mapSurface(p + e.yyx) - d
    );
    float l = length(g);
    if (!(l > 0.00001 && l < 1000.0)) return vec3(0.0, 0.0, 1.0);
    return g / l;
  }

  float raymarch(vec3 ro, vec3 rd, out vec3 hitPoint, out float glowAccum, out float glyphAccum) {
    float travel = 0.0;
    glowAccum = 0.0;
    glyphAccum = 0.0;
    hitPoint = ro;

    // Same final world, gentler first-frame work. uQuality still rises to the
    // accepted realm profile after ignition; geometry is never switched off.
    float stepBudget = mix(44.0, 74.0, clamp(uQuality, 0.0, 1.0));

    for (int i = 0; i < MAX_STEPS; i++) {
      if (float(i) > stepBudget) break;
      vec3 p = ro + rd * travel;
      float d = mapSurface(p);
      hitPoint = p;

      float nearField = exp(-abs(d) * mix(12.0, 19.0, uSymbolDensity));
      glowAccum += nearField * mix(0.0055, 0.0105, uQuality);

      // The glyph field is evaluated on alternating steps. Its accumulated
      // contribution is doubled, preserving apparent brightness while cutting
      // the expensive secondary SDF workload approximately in half.
      if (mod(float(i), 2.0) < 0.5) {
        float glyphD = mapGlyph(p);
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

  vec3 malkuthBackground(vec3 rd) {
    float vertical = clamp(0.5 + 0.5 * rd.y, 0.0, 1.0);
    float angular = atan(rd.y, rd.x);
    float pulse = 0.5 + 0.5 * sin(uTime * 0.12 * uMotionScale + uSeed);
    vec3 base = mix(vec3(0.002, 0.0015, 0.0008), uAuraColor * 0.10, 0.18 + vertical * 0.14);
    float aurora = pow(0.5 + 0.5 * sin(angular * 12.0 + rd.z * 8.0 + uTime * 0.08), 10.0);
    return base
      + uAccentColor * aurora * 0.028 * (0.65 + 0.35 * pulse)
      + mix(uCoreColor, uAccentColor, 0.55) * depthGatePulse() * 0.018;
  }

  vec3 shadeMalkuth(vec3 hitPoint, vec3 n, vec3 rd, float travel, float glowAccum, float glyphAccum) {
    vec3 lightDir = normalize(vec3(0.5, 0.8, -0.35));
    float diffuse = 0.14 + 0.86 * max(dot(n, lightDir), 0.0);
    float facing = max(dot(n, -rd), 0.0);
    float rim = pow(1.0 - facing, 2.15);
    float pulse = 0.5 + 0.5 * sin(uTime * (0.36 + uMotionScale * 0.34) + uSeed);
    float linePattern = malkuthLinePattern(hitPoint);

    vec3 citrine = vec3(0.92, 0.70, 0.18);
    vec3 olive = vec3(0.30, 0.39, 0.10);
    vec3 russet = vec3(0.47, 0.16, 0.065);
    vec3 mineralBlack = vec3(0.018, 0.015, 0.012);
    vec3 materialTone = citrine;
    if (hitPoint.x < 0.0 && hitPoint.z >= 0.0) materialTone = olive;
    else if (hitPoint.x < 0.0 && hitPoint.z < 0.0) materialTone = russet;
    else if (hitPoint.x >= 0.0 && hitPoint.z < 0.0) materialTone = mineralBlack;

    float mineral = floor((0.5 + 0.5 * sin(hitPoint.x * 8.0 + hitPoint.z * 6.0)) * 4.0) / 4.0;
    vec3 color = mix(uAuraColor * 0.20, materialTone, 0.42 + diffuse * 0.38 + mineral * 0.12);
    color += uAccentColor * linePattern * (0.14 + 0.05 * uDepthStage) * uGlowStrength;
    color += uCoreColor * rim * 0.16;

    color += mix(uCoreColor, uAccentColor, 0.62) * depthGatePulse() * 0.12;
    color += uAccentColor * glowAccum * 0.52 * uGlowStrength;
    color += mix(uCoreColor, uAccentColor, 0.18) * glyphAccum * 0.78 * uGlowStrength;
    color *= 1.0 + 0.08 * uInteraction;

    float fog = 1.0 - exp(-0.027 * travel * travel);
    return mix(color, malkuthBackground(rd), fog);
  }

  void main() {
    vec3 ro = vec3(0.0, 0.0, 2.72);
    vec3 rd = normalize(vWorldPosition - cameraPosition);

    vec3 hitPoint = vec3(0.0);
    float glowAccum = 0.0;
    float glyphAccum = 0.0;
    float travel = raymarch(ro, rd, hitPoint, glowAccum, glyphAccum);

    float starHash = hash11(dot(floor(rd * 720.0), vec3(17.0, 31.0, 47.0)) + uSeed);
    float star = pow(max(0.0, starHash - 0.992), 4.0) * 5.0;
    vec3 background = malkuthBackground(rd);
    vec3 atmosphericGlow = uAccentColor * glowAccum * 0.29 * uGlowStrength;
    atmosphericGlow += mix(uCoreColor, uAccentColor, 0.16) * glyphAccum * 0.52 * uGlowStrength;

    if (travel > MAX_DIST) {
      gl_FragColor = vec4(filmicCompress(background + atmosphericGlow + star, 1.0), 1.0);
      return;
    }

    vec3 n = calcNormal(hitPoint);
    vec3 color = shadeMalkuth(hitPoint, n, rd, travel, glowAccum, glyphAccum);
    gl_FragColor = vec4(filmicCompress(color + star, 0.98), 1.0);
  }
`
