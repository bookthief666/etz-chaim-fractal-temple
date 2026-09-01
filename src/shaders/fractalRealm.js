import { sacredGeometryGLSL } from './modules/sacredGeometry.js'
import { paletteGLSL } from './modules/palette.js'
import { realmKernelsGLSL } from './modules/realmKernels.js'

export const fractalVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const fractalFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uLogZoom;
  uniform float uSeed;
  uniform float uRealmKind;
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

  #define MAX_STEPS 96
  #define MAX_DIST 44.0
  #define SURF_EPS 0.00145

  ${sacredGeometryGLSL}
  ${paletteGLSL}
  ${realmKernelsGLSL}

  // Guard the marcher against NaN/Inf-like values without relying on GLSL 3
  // isnan/isinf intrinsics. Comparisons with NaN are false, so the compound
  // range check also catches invalid arithmetic on older mobile WebGL drivers.
  float safeDistance(float d) {
    if (!(d > -128.0 && d < 128.0)) return 2.0;
    return clamp(d, -16.0, 16.0);
  }

  vec2 mapFields(vec3 p) {
    // Perceptual infinity: the integral octave becomes a deterministic domain
    // shift while the shader repeatedly returns to a bounded local coordinate
    // range. Surface and glyph fields share the exact same rebase so their
    // relative geometry never drifts apart during deep descent.
    float octave = floor(uLogZoom);
    float localPhase = fract(uLogZoom);
    float localScale = exp2(localPhase * 2.65);

    vec3 q = p * localScale;
    vec3 domainShift = vec3(
      hash11(octave + uSeed * 3.1) - 0.5,
      hash11(octave + uSeed * 5.7) - 0.5,
      hash11(octave + uSeed * 9.2) - 0.5
    );

    float driftAmount = 0.82;
    if (uRealmKind < 1.5) driftAmount = 0.28;
    else if (uRealmKind > 7.5 && uRealmKind < 8.5) driftAmount = 0.36;
    else if (uRealmKind > 9.5) driftAmount = 0.42;
    else if (uRealmKind > 1.5 && uRealmKind < 2.5) driftAmount = 1.02;

    q += domainShift * driftAmount;

    // Direct manipulation briefly excites the whole coordinate field. The
    // amplitude stays deliberately small so interaction energizes the temple
    // without destroying SDF convergence.
    float excite = uInteraction * (0.055 + 0.02 * sin(uTime * 4.2 + octave));
    float riteTwist = (uDepthStage - 1.5) * 0.012 + uDepthEpoch * 0.008;
    q.xy *= rot(excite + riteTwist);
    q.xz *= rot(-excite * 0.68 - riteTwist * 0.47);

    vec2 fields = vec2(
      safeDistance(realmDE(q, octave)),
      safeDistance(realmGlyphDE(q, octave))
    );
    return fields / localScale;
  }

  float mapScene(vec3 p) {
    return mapFields(p).x;
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

  float raymarch(
    vec3 ro,
    vec3 rd,
    out vec3 hitPoint,
    out float glowAccum,
    out float glyphAccum
  ) {
    float travel = 0.0;
    glowAccum = 0.0;
    glyphAccum = 0.0;
    hitPoint = ro;

    float stepBudget = mix(54.0, 84.0, clamp(uQuality, 0.0, 1.0));
    // Kether's nested frame estimator is deliberately expensive. On coarse
    // pointer/mobile profiles we cap work more aggressively to stay below the
    // Samsung Chromium GPU watchdog instead of risking a lost WebGL context.
    if (uRealmKind < 1.5) stepBudget = mix(40.0, 66.0, clamp(uQuality, 0.0, 1.0));
    else if (uRealmKind > 7.5 && uRealmKind < 8.5) stepBudget = mix(46.0, 74.0, clamp(uQuality, 0.0, 1.0));

    for (int i = 0; i < MAX_STEPS; i++) {
      if (float(i) > stepBudget) break;

      vec3 p = ro + rd * travel;
      vec2 fields = mapFields(p);
      float d = fields.x;
      float glyphD = fields.y;
      hitPoint = p;

      // Surface aura and a separate canonical-glyph aura. The second field is
      // why a pentagram or hexagram can remain visually legible even when the
      // ray ultimately lands on another object in front of it.
      float nearField = exp(-abs(d) * mix(12.0, 19.0, uSymbolDensity));
      glowAccum += nearField * mix(0.0055, 0.0105, uQuality);

      float glyphNear = exp(-abs(glyphD) * mix(20.0, 34.0, uSymbolDensity));
      glyphAccum += glyphNear * mix(0.0065, 0.0125, uQuality) * (0.85 + 0.55 * uInteraction);

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

    vec3 base = mix(vec3(0.0008, 0.001, 0.004), uAuraColor * 0.14, 0.18 + vertical * 0.18);

    if (uRealmKind < 1.5) {
      base = mix(vec3(0.004, 0.006, 0.012), uAuraColor * 0.12, 0.22 + vertical * 0.18);
    } else if (uRealmKind > 2.5 && uRealmKind < 3.5) {
      base = mix(vec3(0.0004, 0.0001, 0.0004), uAuraColor * 0.07, 0.14 + vertical * 0.12);
    } else if (uRealmKind > 5.5 && uRealmKind < 6.5) {
      base = mix(vec3(0.012, 0.004, 0.0), uAuraColor * 0.16, 0.24 + vertical * 0.23);
    } else if (uRealmKind > 8.5 && uRealmKind < 9.5) {
      base = mix(vec3(0.001, 0.0005, 0.009), uAuraColor * 0.16, 0.23 + vertical * 0.21);
    } else if (uRealmKind > 9.5) {
      base = mix(vec3(0.002, 0.0015, 0.0008), uAuraColor * 0.10, 0.18 + vertical * 0.14);
    }

    float aurora = pow(0.5 + 0.5 * sin(angular * (2.0 + uRealmKind) + rd.z * 8.0 + uTime * 0.08), 10.0);
    float threshold = depthGatePulse();
    return base
      + uAccentColor * aurora * 0.028 * (0.65 + 0.35 * pulse)
      + mix(uCoreColor, uAccentColor, 0.55) * threshold * 0.018;
  }

  vec3 shadeRealm(
    vec3 hitPoint,
    vec3 n,
    vec3 rd,
    float travel,
    float glowAccum,
    float glyphAccum
  ) {
    vec3 lightDir = normalize(vec3(0.5, 0.8, -0.35));
    float diffuse = 0.14 + 0.86 * max(dot(n, lightDir), 0.0);
    float facing = max(dot(n, -rd), 0.0);
    float rim = pow(1.0 - facing, 2.15);
    float pulse = 0.5 + 0.5 * sin(uTime * (0.36 + uMotionScale * 0.34) + uSeed);
    float linePattern = realmLinePattern(hitPoint);

    vec3 color = neonSurface(
      uAuraColor,
      uCoreColor,
      uAccentColor,
      diffuse,
      rim,
      pulse,
      linePattern,
      uGlowStrength
    );

    // Realm-specific color behavior. Geometry remains the primary separator;
    // these laws tune the energy signature without turning the ten realms into
    // simple recolorings of one field.
    if (uRealmKind < 1.5) {
      float source = exp(-2.1 * length(hitPoint));
      color = mix(vec3(0.54, 0.62, 0.78), uCoreColor, 0.76 + source * 0.18);
      color += uAccentColor * (rim * 1.45 + source * 1.15) * uGlowStrength;
      color *= 0.88 + 0.12 * pulse;
    } else if (uRealmKind < 2.5) {
      float surge = pow(0.5 + 0.5 * sin(hitPoint.z * 16.0 - uTime * 1.4 * uMotionScale), 4.0);
      color += uAccentColor * surge * 0.62 * uGlowStrength;
    } else if (uRealmKind < 3.5) {
      float strata = floor(diffuse * 6.0) / 6.0;
      color = mix(uAuraColor * 0.12, uCoreColor * 0.86, strata);
      color += uAccentColor * linePattern * 0.16 * uGlowStrength;
    } else if (uRealmKind < 4.5) {
      color = spectralMix(uAuraColor, uCoreColor, uAccentColor, linePattern * PI + pulse);
      color *= 0.52 + diffuse * 0.72;
      color += uAccentColor * rim * 0.44;
    } else if (uRealmKind < 5.5) {
      float cutFlash = pow(0.5 + 0.5 * sin((hitPoint.x - hitPoint.y) * 19.0 - uTime * 1.8), 10.0);
      color += uAccentColor * cutFlash * 0.95 * uGlowStrength;
      color *= 0.73 + 0.42 * step(0.15, diffuse);
    } else if (uRealmKind < 6.5) {
      float solar = exp(-1.25 * length(hitPoint));
      color = spectralMix(uAuraColor, uCoreColor, uAccentColor, linePattern * TAU + uTime * 0.18);
      color *= 0.74 + diffuse * 0.56;
      color += uAccentColor * (rim * 0.74 + solar * 0.88) * uGlowStrength;
    } else if (uRealmKind < 7.5) {
      float sap = 0.5 + 0.5 * sin(hitPoint.y * 7.0 + hitPoint.z * 5.0 - uTime * 0.42);
      color = mix(uAuraColor * 0.35, uCoreColor, 0.44 + 0.48 * sap);
      color += uAccentColor * (rim * 0.55 + linePattern * 0.24) * uGlowStrength;
    } else if (uRealmKind < 8.5) {
      float bit = step(0.56, fract((hitPoint.x + hitPoint.y * 2.0 + hitPoint.z * 3.0) * 5.0 + uTime * 0.24));
      color = mix(uAuraColor * 0.28, uCoreColor, diffuse * 0.72 + bit * 0.22);
      color += uAccentColor * linePattern * 0.78 * uGlowStrength;
    } else if (uRealmKind < 9.5) {
      float phase = 0.5 + 0.5 * sin(hitPoint.x * 10.0 + hitPoint.y * 7.0 - hitPoint.z * 8.0 + uTime * 0.72);
      color = mix(uAuraColor * 0.32, uCoreColor, 0.42 + 0.44 * phase);
      color += uAccentColor * (rim * 0.5 + linePattern * 0.42) * uGlowStrength;
    } else {
      // Fourfold material palette: citrine / olive / russet / black. This is an
      // interpretive visual echo of the familiar Hermetic fourfold Malkuth
      // color language; provenance-bearing historical color tables remain
      // separate from this shader module.
      vec3 citrine = vec3(0.92, 0.70, 0.18);
      vec3 olive = vec3(0.30, 0.39, 0.10);
      vec3 russet = vec3(0.47, 0.16, 0.065);
      vec3 mineralBlack = vec3(0.018, 0.015, 0.012);
      vec3 materialTone = citrine;
      if (hitPoint.x < 0.0 && hitPoint.z >= 0.0) materialTone = olive;
      else if (hitPoint.x < 0.0 && hitPoint.z < 0.0) materialTone = russet;
      else if (hitPoint.x >= 0.0 && hitPoint.z < 0.0) materialTone = mineralBlack;

      float mineral = floor((0.5 + 0.5 * sin(hitPoint.x * 8.0 + hitPoint.z * 6.0)) * 4.0) / 4.0;
      color = mix(uAuraColor * 0.20, materialTone, 0.42 + diffuse * 0.38 + mineral * 0.12);
      color += uAccentColor * linePattern * (0.14 + 0.05 * uDepthStage) * uGlowStrength;
      color += uCoreColor * rim * 0.16;
    }

    // Volumetric-looking aura accumulated while the ray approaches geometry.
    float thresholdFlash = depthGatePulse();
    color += mix(uCoreColor, uAccentColor, 0.62) * thresholdFlash * 0.12;
    color += uAccentColor * glowAccum * 0.52 * uGlowStrength;
    vec3 glyphColor = mix(uCoreColor, uAccentColor, 0.68);
    if (uRealmKind > 9.5) glyphColor = mix(uCoreColor, uAccentColor, 0.18);
    color += glyphColor * glyphAccum * 0.78 * uGlowStrength;
    color *= 1.0 + 0.08 * uInteraction;

    float fogDensity = 0.032;
    if (uRealmKind > 2.5 && uRealmKind < 3.5) fogDensity = 0.023;
    if (uRealmKind > 9.5) fogDensity = 0.027;
    float fog = 1.0 - exp(-fogDensity * travel * travel);
    return mix(color, realmBackground(rd), fog);
  }

  void main() {
    // Canonical mathematical eye. Previously this inherited the macro Tree
    // node's world coordinates, which made Kether/Yesod/Geburah begin at wildly
    // different distances from their motifs. The display camera still supplies
    // the ray direction; only the mathematical realm origin is canonicalized.
    vec3 ro = vec3(0.0, 0.0, 2.72);
    vec3 rd = normalize(vWorldPosition - cameraPosition);

    vec3 hitPoint = vec3(0.0);
    float glowAccum = 0.0;
    float glyphAccum = 0.0;
    float travel = raymarch(ro, rd, hitPoint, glowAccum, glyphAccum);

    float starHash = hash11(dot(floor(rd * 720.0), vec3(17.0, 31.0, 47.0)) + uSeed);
    float star = pow(max(0.0, starHash - 0.992), 4.0) * 5.0;
    vec3 background = realmBackground(rd);
    vec3 atmosphericGlow = uAccentColor * glowAccum * 0.29 * uGlowStrength;
    vec3 atmosphereGlyph = mix(uCoreColor, uAccentColor, 0.72);
    if (uRealmKind > 9.5) atmosphereGlyph = mix(uCoreColor, uAccentColor, 0.16);
    atmosphericGlow += atmosphereGlyph * glyphAccum * 0.52 * uGlowStrength;

    if (travel > MAX_DIST) {
      float exposure = 1.05;
      if (uRealmKind < 1.5) exposure = 0.56;
      else if (uRealmKind > 7.5 && uRealmKind < 8.5) exposure = 0.72;
      else if (uRealmKind > 5.5 && uRealmKind < 6.5) exposure = 0.78;
      gl_FragColor = vec4(filmicCompress(background + atmosphericGlow + star, exposure), 1.0);
      return;
    }

    vec3 n = calcNormal(hitPoint);
    vec3 color = shadeRealm(hitPoint, n, rd, travel, glowAccum, glyphAccum);

    float exposure = 1.02;
    if (uRealmKind < 1.5) exposure = 0.54;
    else if (uRealmKind > 2.5 && uRealmKind < 3.5) exposure = 0.86;
    else if (uRealmKind > 5.5 && uRealmKind < 6.5) exposure = 0.76;
    else if (uRealmKind > 7.5 && uRealmKind < 8.5) exposure = 0.68;
    else if (uRealmKind > 8.5 && uRealmKind < 9.5) exposure = 0.90;

    gl_FragColor = vec4(filmicCompress(color + star, exposure), 1.0);
  }
`
