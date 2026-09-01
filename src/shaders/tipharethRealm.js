import { sacredGeometryGLSL } from './modules/sacredGeometry.js'
import { paletteGLSL } from './modules/palette.js'

// M4.14: Tiphareth receives the same compiler-isolation strategy that made
// Malkuth reliable on Fold-class mobile browsers. The solar grammar is not
// simplified: hexagram icon, sixfold court, recursive nested stars, solar
// corridor, toroidal crowns and stage-dependent glyph field are preserved.
export const tipharethVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const tipharethFragmentShader = /* glsl */ `
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

  #define MAX_STEPS 88
  #define MAX_DIST 44.0
  #define SURF_EPS 0.00148

  ${sacredGeometryGLSL}
  ${paletteGLSL}

  float safeDistance(float d) {
    if (!(d > -128.0 && d < 128.0)) return 2.0;
    return clamp(d, -16.0, 16.0);
  }

  // Exact accepted Tiphareth structural grammar, compiled in isolation.
  float tipharethDE(vec3 p, float octave) {
    float t = uTime * 0.31 * uMotionScale;
    vec3 q = p;
    q.xy *= rot(t * 0.18 + uDepthEpoch * 0.035);

    float hex = sdHexagramPrism(q, 0.72, 0.025, 0.15);
    vec3 inner = q * 1.72;
    inner.xy *= rot(-t * 0.13 + PI / 6.0);
    float hex2 = sdHexagramPrism(inner, 0.68, 0.017, 0.10) / 1.72;

    float mandala = sdRadialWaveRing(
      q,
      6.0,
      0.93 + 0.025 * sin(t * 1.8),
      0.07,
      0.018
    );

    vec3 tor = q;
    tor.yz *= rot(PI * 0.5);
    float halo = sdTorus(tor, vec2(0.84, 0.018));
    float sun = sdSphere(p, 0.085 + 0.008 * sin(t * 2.3));
    float d = min(min(hex, hex2), min(min(mandala, halo), sun));

    if (uDepthStage > 0.5) {
      vec3 court = polarRingCell(q, 6.0, 0.88);
      court.xy *= rot(PI / 6.0 - t * 0.04);
      float sixHex = sdHexagramPrism(court, 0.205, 0.009, 0.055);
      d = min(d, sixHex);
    }

    if (uDepthStage > 1.5) {
      vec3 recurse = q * 2.35;
      recurse.xy *= rot(PI / 6.0 + t * 0.04);
      float deepHex = sdHexagramPrism(recurse, 0.68, 0.009, 0.052) / 2.35;
      recurse *= 1.62;
      recurse.xy *= rot(-PI / 6.0);
      deepHex = min(deepHex, sdHexagramPrism(recurse, 0.66, 0.007, 0.038) / (2.35 * 1.62));
      d = min(d, deepHex);
    }

    if (uDepthStage > 2.5) {
      vec3 temple = q;
      float slice = floor((temple.z + 0.52) / 1.04);
      temple.z = mod(temple.z + 0.52, 1.04) - 0.52;
      temple.xy *= rot(slice * PI / 12.0 + t * 0.025);
      float corridor = sdHexagramPrism(temple, 0.56, 0.010, 0.045);
      vec3 ringCell = temple;
      ringCell.yz *= rot(PI * 0.5);
      corridor = min(corridor, sdTorus(ringCell, vec2(0.62, 0.010)));
      d = min(d, corridor);
    }
    return d;
  }

  float tipharethGlyphDE(vec3 p) {
    float t = uTime * uMotionScale;
    vec3 g = p;
    g.z = mod(g.z + 1.0, 2.0) - 1.0;
    g.xy *= rot(t * 0.07 + uDepthEpoch * 0.035);
    float hex = sdHexagramPrism(g, 0.69, 0.010, 0.052);
    float six = sdRadialWaveRing(g, 6.0, 0.88, 0.045, 0.009);
    float d = min(hex, six);
    if (uDepthStage > 0.5) {
      vec3 court = polarRingCell(g, 6.0, 0.86);
      d = min(d, sdHexagramPrism(court, 0.18, 0.006, 0.032));
    }
    if (uDepthStage > 1.5) {
      vec3 recursive = g * 2.28;
      d = min(d, sdHexagramPrism(recursive, 0.67, 0.006, 0.032) / 2.28);
    }
    return d;
  }

  float tipharethLinePattern(vec3 p) {
    float a = atan(p.y, p.x);
    float t = uTime * uMotionScale;
    float rite = 0.15 * uDepthStage + 0.08 * uDepthPhase;
    return max(
      neonBands(p, 8.0 + rite, t * 0.45),
      pow(0.5 + 0.5 * cos(6.0 * a - t * 0.14), 14.0)
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
    q += domainShift * 0.82;

    float excite = uInteraction * (0.055 + 0.02 * sin(uTime * 4.2 + octave));
    float riteTwist = (uDepthStage - 1.5) * 0.012 + uDepthEpoch * 0.008;
    q.xy *= rot(excite + riteTwist);
    q.xz *= rot(-excite * 0.68 - riteTwist * 0.47);
    return vec4(q, localScale);
  }

  float mapSurface(vec3 p) {
    vec4 local = rebasedPoint(p);
    return safeDistance(tipharethDE(local.xyz, floor(uLogZoom))) / local.w;
  }

  float mapGlyph(vec3 p) {
    vec4 local = rebasedPoint(p);
    return safeDistance(tipharethGlyphDE(local.xyz)) / local.w;
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

    float stepBudget = mix(46.0, 76.0, clamp(uQuality, 0.0, 1.0));

    for (int i = 0; i < MAX_STEPS; i++) {
      if (float(i) > stepBudget) break;
      vec3 p = ro + rd * travel;
      float d = mapSurface(p);
      hitPoint = p;

      float nearField = exp(-abs(d) * mix(12.0, 19.0, uSymbolDensity));
      glowAccum += nearField * mix(0.0055, 0.0105, uQuality);

      // Alternate glyph evaluation preserves the same luminous motif while
      // reducing secondary SDF work during the most expensive first frames.
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

  vec3 tipharethBackground(vec3 rd) {
    float vertical = clamp(0.5 + 0.5 * rd.y, 0.0, 1.0);
    float angular = atan(rd.y, rd.x);
    float pulse = 0.5 + 0.5 * sin(uTime * 0.12 * uMotionScale + uSeed);
    vec3 base = mix(vec3(0.012, 0.004, 0.0), uAuraColor * 0.16, 0.24 + vertical * 0.23);
    float aurora = pow(0.5 + 0.5 * sin(angular * 8.0 + rd.z * 8.0 + uTime * 0.08), 10.0);
    return base
      + uAccentColor * aurora * 0.028 * (0.65 + 0.35 * pulse)
      + mix(uCoreColor, uAccentColor, 0.55) * depthGatePulse() * 0.018;
  }

  vec3 shadeTiphareth(vec3 hitPoint, vec3 n, vec3 rd, float travel, float glowAccum, float glyphAccum) {
    vec3 lightDir = normalize(vec3(0.5, 0.8, -0.35));
    float diffuse = 0.14 + 0.86 * max(dot(n, lightDir), 0.0);
    float facing = max(dot(n, -rd), 0.0);
    float rim = pow(1.0 - facing, 2.15);
    float pulse = 0.5 + 0.5 * sin(uTime * (0.36 + uMotionScale * 0.34) + uSeed);
    float linePattern = tipharethLinePattern(hitPoint);
    float solar = exp(-1.25 * length(hitPoint));

    vec3 color = spectralMix(uAuraColor, uCoreColor, uAccentColor, linePattern * TAU + uTime * 0.18);
    color *= 0.74 + diffuse * 0.56;
    color += uAccentColor * (rim * 0.74 + solar * 0.88) * uGlowStrength;
    color += mix(uCoreColor, uAccentColor, 0.62) * depthGatePulse() * 0.12;
    color += uAccentColor * glowAccum * 0.52 * uGlowStrength;
    color += mix(uCoreColor, uAccentColor, 0.68) * glyphAccum * 0.78 * uGlowStrength;
    color *= 1.0 + 0.08 * uInteraction;

    float fog = 1.0 - exp(-0.032 * travel * travel);
    return mix(color, tipharethBackground(rd), fog);
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
    vec3 background = tipharethBackground(rd);
    vec3 atmosphericGlow = uAccentColor * glowAccum * 0.29 * uGlowStrength;
    atmosphericGlow += mix(uCoreColor, uAccentColor, 0.72) * glyphAccum * 0.52 * uGlowStrength;

    if (travel > MAX_DIST) {
      gl_FragColor = vec4(filmicCompress(background + atmosphericGlow + star, 0.78), 1.0);
      return;
    }

    vec3 n = calcNormal(hitPoint);
    vec3 color = shadeTiphareth(hitPoint, n, rd, travel, glowAccum, glyphAccum);
    gl_FragColor = vec4(filmicCompress(color + star, 0.76), 1.0);
  }
`
