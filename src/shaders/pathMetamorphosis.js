import { sacredGeometryGLSL } from './modules/sacredGeometry.js'
import { paletteGLSL } from './modules/palette.js'

export const pathMetamorphosisVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const pathMetamorphosisFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uProgress;
  uniform float uPathKind;
  uniform float uReverse;
  uniform float uInteraction;
  uniform float uQuality;
  uniform vec3 uFromCore;
  uniform vec3 uFromAura;
  uniform vec3 uFromAccent;
  uniform vec3 uToCore;
  uniform vec3 uToAura;
  uniform vec3 uToAccent;

  varying vec3 vWorldPosition;

  #define MAX_STEPS 80
  #define MAX_DIST 38.0
  #define SURF_EPS 0.00165

  ${sacredGeometryGLSL}
  ${paletteGLSL}

  float safeDistance(float d) {
    if (!(d > -128.0 && d < 128.0)) return 2.0;
    return clamp(d, -16.0, 16.0);
  }

  float canonicalProgress() {
    float p = smoothstep(0.0, 1.0, clamp(uProgress, 0.0, 1.0));
    return uReverse > 0.5 ? 1.0 - p : p;
  }

  vec2 fiveToSixFields(vec3 p, float morph) {
    float t = uTime * 0.24;
    vec3 q = p;
    q.xy *= rot(t * mix(0.22, 0.07, morph));
    q.xz *= rot((0.5 - morph) * 0.16 + 0.04 * sin(t));

    float pent = sdPentagramPrism(q, 0.70, 0.024, 0.10);
    float fiveRing = sdRadialWaveRing(q, 5.0, 0.94, 0.10, 0.022);
    vec3 blade = q;
    blade.xy *= rot(PI * 0.2);
    float cuttingPlane = abs(blade.x + blade.y * 0.38) - 0.025;
    cuttingPlane = max(cuttingPlane, abs(blade.z) - 0.72);
    float fromD = min(pent, min(fiveRing, cuttingPlane));

    float hex = sdHexagramPrism(q, 0.70, 0.022, 0.09);
    float sixRing = sdRadialWaveRing(q, 6.0, 0.92, 0.065, 0.020);
    vec3 haloP = q;
    haloP.yz *= rot(PI * 0.5);
    float halo = sdTorus(haloP, vec2(0.79, 0.020));
    float sun = sdSphere(q, 0.09);
    float toD = min(hex, min(sixRing, min(halo, sun)));

    float h = smoothstep(0.08, 0.92, morph);
    float structural = mix(fromD, toD, h);

    // During the middle of the path, a continuously changing angular field
    // makes the symmetry itself feel unstable between five and six.
    float bridge = sdRadialWaveRing(q, mix(5.0, 6.0, h), 0.83, 0.075, 0.014);
    structural = min(structural, bridge + 0.020 * (1.0 - abs(2.0 * h - 1.0)));

    vec3 court = polarRingCell(q, mix(5.0, 6.0, h), 0.82);
    float courtStar = mix(
      sdPentagramPrism(court, 0.18, 0.008, 0.036),
      sdHexagramPrism(court, 0.18, 0.007, 0.032),
      h
    );
    structural = min(structural, courtStar);

    float glyph = mix(
      sdPentagramPrism(q, 0.73, 0.009, 0.050),
      sdHexagramPrism(q, 0.73, 0.009, 0.050),
      h
    );
    glyph = min(glyph, sdRadialWaveRing(q, mix(5.0, 6.0, h), 0.97, 0.048, 0.008));
    return vec2(structural, glyph);
  }

  vec2 phaseToCrystalFields(vec3 p, float morph) {
    float t = uTime * 0.20;
    float h = smoothstep(0.06, 0.94, morph);
    vec3 q = p;

    float dream = 1.0 - h;
    q.z += dream * 0.13 * sin(q.x * 2.8 + t * 1.3);
    q.x += dream * 0.10 * sin(q.y * 2.1 - t);
    q.xy *= rot(dream * 0.12 * sin(t * 0.7));

    vec3 lunar = q;
    lunar.yz *= rot(PI * 0.5 + dream * 0.18 * sin(t));
    float moonRing = sdTorus(lunar, vec2(0.74, 0.026));
    float nine = sdRadialWaveRing(q, 9.0, 0.98, 0.065, 0.019);
    vec3 moonCell = polarRingCell(q, 9.0, 0.84);
    float moonBeads = sdSphere(moonCell, 0.085);
    float fromD = smoothUnion(moonRing, min(nine, moonBeads), 0.045);

    float span = mix(1.42, 0.98, h);
    vec3 cell = repeatCell(q + vec3(0.0, t * 0.025 * h, 0.0), span);
    float crystal = sdOctahedron(cell, mix(0.24, 0.34, h));
    float cage = sdBoxFrame(cell, vec3(mix(0.31, 0.38, h)), mix(0.010, 0.016, h));
    vec3 gate = polarRingCell(q, 4.0, 0.78);
    float fourfold = sdBoxFrame(gate, vec3(0.17, 0.28, 0.10), 0.012);
    vec3 strataP = q;
    strataP.y = mod(strataP.y + 0.34, 0.68) - 0.34;
    float strata = abs(strataP.y + 0.032 * sin(q.x * 3.0) * sin(q.z * 3.0)) - 0.016;
    float toD = min(min(crystal, cage), min(fourfold, strata));

    float structural = mix(fromD, toD, h);

    // The phase ring changes continuously from ninefold imaginal repetition to
    // fourfold material organization before crystallization takes over.
    float bridge = sdRadialWaveRing(q, mix(9.0, 4.0, h), 0.88, mix(0.060, 0.035, h), 0.012);
    structural = min(structural, bridge);

    float glyphFrom = min(sdRadialWaveRing(q, 9.0, 0.94, 0.050, 0.008), moonRing);
    float glyphTo = min(sdRadialWaveRing(q, 4.0, 0.90, 0.032, 0.008), sdBoxFrame(cell, vec3(0.36), 0.008));
    return vec2(structural, mix(glyphFrom, glyphTo, h));
  }

  vec2 pathFields(vec3 p) {
    float morph = canonicalProgress();
    vec2 fields;
    if (uPathKind < 1.5) fields = fiveToSixFields(p, morph);
    else fields = phaseToCrystalFields(p, morph);
    fields.x = safeDistance(fields.x);
    fields.y = safeDistance(fields.y);
    return fields;
  }

  float mapScene(vec3 p) {
    return pathFields(p).x;
  }

  vec3 calcNormal(vec3 p) {
    vec2 e = vec2(SURF_EPS, 0.0);
    float d = mapScene(p);
    vec3 g = vec3(
      mapScene(p + e.xyy) - d,
      mapScene(p + e.yxy) - d,
      mapScene(p + e.yyx) - d
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
    float stepBudget = mix(48.0, 72.0, clamp(uQuality, 0.0, 1.0));

    for (int i = 0; i < MAX_STEPS; i++) {
      if (float(i) > stepBudget) break;
      vec3 point = ro + rd * travel;
      vec2 fields = pathFields(point);
      float d = fields.x;
      hitPoint = point;

      glowAccum += exp(-abs(d) * 15.0) * mix(0.005, 0.009, uQuality);
      glyphAccum += exp(-abs(fields.y) * 28.0) * mix(0.006, 0.011, uQuality) * (0.9 + 0.35 * uInteraction);

      if (abs(d) < SURF_EPS || travel > MAX_DIST) break;
      travel += max(abs(d) * 0.68, 0.0032);
      if (!(travel >= 0.0 && travel < MAX_DIST + 8.0)) {
        travel = MAX_DIST + 1.0;
        break;
      }
    }

    glowAccum = min(glowAccum, 1.1);
    glyphAccum = min(glyphAccum, 1.25);
    return travel;
  }

  vec3 pathBackground(vec3 rd) {
    float p = clamp(uProgress, 0.0, 1.0);
    vec3 aura = mix(uFromAura, uToAura, p);
    vec3 core = mix(uFromCore, uToCore, p);
    float vertical = 0.5 + 0.5 * rd.y;
    float angular = atan(rd.y, rd.x);
    float veil = pow(0.5 + 0.5 * sin(angular * mix(5.0, 7.0, p) + rd.z * 7.0 + uTime * 0.10), 9.0);
    return mix(vec3(0.0007, 0.0007, 0.0025), aura * 0.13, 0.18 + vertical * 0.17)
      + core * veil * 0.018;
  }

  vec3 shadePath(vec3 p, vec3 n, vec3 rd, float travel, float glowAccum, float glyphAccum) {
    float progress = clamp(uProgress, 0.0, 1.0);
    vec3 core = mix(uFromCore, uToCore, progress);
    vec3 aura = mix(uFromAura, uToAura, progress);
    vec3 accent = mix(uFromAccent, uToAccent, progress);
    vec3 lightDir = normalize(vec3(0.5, 0.8, -0.35));
    float diffuse = 0.14 + 0.86 * max(dot(n, lightDir), 0.0);
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.0);
    float pulse = 0.5 + 0.5 * sin(uTime * 0.52 + progress * TAU);
    float pattern = neonBands(p, mix(11.0, 7.0, progress), uTime * mix(0.65, 0.22, progress));

    vec3 color = neonSurface(aura, core, accent, diffuse, rim, pulse, pattern, 1.25);
    color += accent * glowAccum * 0.48;
    color += mix(core, accent, 0.62) * glyphAccum * 0.72;
    color *= 1.0 + 0.07 * uInteraction;

    float fog = 1.0 - exp(-0.028 * travel * travel);
    return mix(color, pathBackground(rd), fog);
  }

  void main() {
    vec3 ro = vec3(0.0, 0.0, 2.72);
    vec3 rd = normalize(vWorldPosition - cameraPosition);

    vec3 hitPoint = vec3(0.0);
    float glowAccum = 0.0;
    float glyphAccum = 0.0;
    float travel = raymarch(ro, rd, hitPoint, glowAccum, glyphAccum);
    vec3 background = pathBackground(rd);

    if (travel > MAX_DIST) {
      vec3 atmosphere = mix(uFromAccent, uToAccent, uProgress) * (glowAccum * 0.25 + glyphAccum * 0.43);
      gl_FragColor = vec4(filmicCompress(background + atmosphere, 0.88), 1.0);
      return;
    }

    vec3 n = calcNormal(hitPoint);
    vec3 color = shadePath(hitPoint, n, rd, travel, glowAccum, glyphAccum);
    gl_FragColor = vec4(filmicCompress(color, 0.82), 1.0);
  }
`
