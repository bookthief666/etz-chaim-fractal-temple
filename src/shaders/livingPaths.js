export const livingPathVertexShader = /* glsl */ `
  precision highp float;

  attribute vec4 aMotion;
  attribute vec4 aSignature;
  attribute vec4 aState;
  attribute vec3 aPathColor;

  varying float vPathPosition;
  varying vec4 vMotion;
  varying vec4 vSignature;
  varying vec4 vState;
  varying vec3 vPathColor;

  void main() {
    vPathPosition = position.y + 0.5;
    vMotion = aMotion;
    vSignature = aSignature;
    vState = aState;
    vPathColor = aPathColor;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`

export const livingPathFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uLayer;
  uniform float uMotionEnabled;

  varying float vPathPosition;
  varying vec4 vMotion;
  varying vec4 vSignature;
  varying vec4 vState;
  varying vec3 vPathColor;

  const float TAU = 6.283185307179586;

  float elementalLaw(float x, float t, float variant, float harmonic, float curvature) {
    float air = 0.5 + 0.5 * sin(TAU * (x * harmonic - t) + sin(x * TAU * 2.0) * curvature);
    float waterPhase = x + sin(x * TAU + t * 0.7) * (0.04 + curvature * 0.055);
    float water = 0.5 + 0.5 * cos(TAU * (waterPhase * harmonic - t * 0.62));
    float fireFront = fract(x * harmonic - t * 1.45);
    float fire = exp(-fireFront * 7.5) * (0.72 + 0.28 * sin(x * TAU * 5.0 + t));
    float airMask = 1.0 - step(0.5, variant);
    float waterMask = step(0.5, variant) * (1.0 - step(1.5, variant));
    return air * airMask + water * waterMask + fire * step(1.5, variant);
  }

  float planetaryLaw(float x, float t, float variant, float harmonic, float curvature) {
    float orbit = sin(TAU * (x * harmonic - t));
    float epicycle = sin(TAU * (x * (2.0 + mod(variant, 4.0)) + t * (0.45 + curvature)));
    float axial = cos(TAU * (x + t * (0.12 + variant * 0.018)));
    float conjunction = 0.5 + 0.5 * orbit * epicycle;
    return pow(clamp(conjunction * 0.74 + axial * axial * 0.26, 0.0, 1.0), 2.2);
  }

  float zodiacalLaw(float x, float t, float variant, float harmonic, float curvature) {
    float modality = mod(variant, 3.0);
    float polarity = mod(floor(variant * 0.5), 2.0);
    float mirrored = mix(x, abs(fract(x * 2.0) - 0.5) * 2.0, polarity);
    float angular = TAU * (mirrored * harmonic - t);
    float cyclic = 0.5 + 0.5 * cos(angular + curvature * sin(angular * 0.5));
    float gate = smoothstep(0.56 - modality * 0.08, 0.92 - modality * 0.04, cyclic);
    float counterGate = smoothstep(0.68, 0.96, 0.5 + 0.5 * cos(angular * (1.0 + modality) + t));
    return max(gate, counterGate * (0.30 + 0.16 * modality));
  }

  void main() {
    float family = vMotion.x;
    float variant = vMotion.y;
    float harmonic = vMotion.z;
    float phase = vMotion.w;
    float rate = vSignature.x;
    float curvature = vSignature.y;
    float inspectable = vSignature.z;
    float direction = vState.w;
    float x = direction > 0.0 ? vPathPosition : 1.0 - vPathPosition;
    float t = (uTime * rate * uMotionEnabled) + phase;

    float elemental = elementalLaw(x, t, variant, harmonic, curvature);
    float planetary = planetaryLaw(x, t, variant, harmonic, curvature);
    float zodiacal = zodiacalLaw(x, t, variant, harmonic, curvature);
    float elementalMask = 1.0 - step(0.5, family);
    float planetaryMask = step(0.5, family) * (1.0 - step(1.5, family));
    float law = elemental * elementalMask + planetary * planetaryMask + zodiacal * step(1.5, family);

    float currentHead = pow(0.5 + 0.5 * cos(TAU * (x * 1.35 - t * 1.8)), 16.0);
    float counterCurrent = pow(0.5 + 0.5 * cos(TAU * ((1.0 - x) * 1.8 - t * 1.3)), 22.0);
    float selected = vState.y;
    float operative = vState.z;
    float strength = vState.x;
    float current = mix(law, max(law, currentHead), 0.22 + inspectable * 0.14 + selected * 0.50);
    current = max(current, counterCurrent * operative * selected * 0.82);
    float layerAlpha = mix(0.72, 0.24, uLayer);
    float alpha = strength * layerAlpha * (0.28 + current * 0.88);
    alpha += operative * (0.025 + currentHead * 0.055 + counterCurrent * selected * 0.11);

    vec3 parchment = vec3(0.96, 0.90, 0.73);
    vec3 color = mix(vPathColor, parchment, current * (0.34 + selected * 0.30));
    color *= 0.70 + current * 0.78 + operative * 0.08;
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`
