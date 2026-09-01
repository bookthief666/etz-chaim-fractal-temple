// M4.15.1: a deliberately tiny analytical fallback for mobile GPU drivers.
// It is not the canonical realm renderer. It only owns the screen while the
// requested raymarch program is loading/compiling, or if WebGL reports that the
// requested program failed to compile/link. No loops, dynamic dispatch, SDF
// library, or derivative extensions are used here.
export const compatibilityRealmVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

export const compatibilityRealmFragmentShader = /* glsl */ `
  precision mediump float;

  uniform float uTime;
  uniform float uSeed;
  uniform float uInteraction;
  uniform float uDepthStage;
  uniform float uDepthPhase;
  uniform float uRealmNumber;
  uniform vec3 uCoreColor;
  uniform vec3 uAuraColor;
  uniform vec3 uAccentColor;

  varying vec3 vWorldPosition;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec3 rd = normalize(vWorldPosition - cameraPosition);
    vec2 uv = rd.xy / max(0.24, abs(rd.z));
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    float symmetry = clamp(floor(uRealmNumber + 0.5), 1.0, 10.0);
    float t = uTime * 0.16;

    float spokes = pow(0.5 + 0.5 * cos(a * symmetry + t), 10.0);
    float rings = pow(0.5 + 0.5 * cos(log(r + 0.075) * 17.0 - t * 1.35 - uDepthStage * 1.4), 12.0);
    float gateRadius = 0.50 + 0.075 * sin(t * 0.7 + uSeed + uDepthPhase * 3.14159265);
    float gate = exp(-abs(r - gateRadius) * 20.0);
    float recursion = pow(
      0.5 + 0.5 * cos(a * symmetry * 0.5 + 4.2 / (r + 0.19) + t * 0.8),
      8.0
    );
    float center = exp(-r * r * 3.2);
    float star = step(0.9965, hash21(floor((rd.xy + 1.0) * 420.0 + uSeed * 19.0)));
    float vignette = 1.0 - smoothstep(0.55, 1.55, r);

    vec3 color = vec3(0.003, 0.003, 0.010) + uAuraColor * (0.08 + 0.11 * vignette);
    color += uCoreColor * (spokes * (0.16 + rings * 0.82) + center * 0.28);
    color += uAccentColor * (gate * 0.36 + recursion * rings * 0.22 + star * 0.34);
    color *= 0.92 + 0.12 * sin(t + uSeed) + 0.08 * uInteraction;
    color *= 0.78 + 0.22 * vignette;

    color = color / (vec3(1.0) + color);
    gl_FragColor = vec4(color, 1.0);
  }
`

export const compatibilityRealmProgram = Object.freeze({
  realmId: 'compatibility',
  family: 'compatibility-analytical-realm',
  vertex: compatibilityRealmVertexShader,
  fragment: compatibilityRealmFragmentShader,
})
