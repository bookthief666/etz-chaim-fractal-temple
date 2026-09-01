export const paletteGLSL = /* glsl */ `
  vec3 spectralMix(vec3 aura, vec3 core, vec3 accent, float t) {
    float wave = 0.5 + 0.5 * sin(t);
    vec3 base = mix(aura, core, smoothstep(0.08, 0.9, wave));
    return mix(base, accent, pow(1.0 - abs(2.0 * wave - 1.0), 5.0) * 0.42);
  }

  vec3 neonSurface(
    vec3 aura,
    vec3 core,
    vec3 accent,
    float diffuse,
    float rim,
    float pulse,
    float linePattern,
    float glowStrength
  ) {
    vec3 color = mix(aura * 0.34, core, 0.16 + 0.74 * diffuse);
    color += accent * rim * (0.46 + 0.38 * pulse) * glowStrength;
    color += core * linePattern * (0.24 + 0.26 * glowStrength);
    return color;
  }

  // Small self-contained ACES-like compression. The custom ShaderMaterial is
  // intentionally toneMapped=false, so we compress HDR-looking emissive values
  // ourselves before they reach the display. This keeps Kether/Hod readable on
  // bright OLED phone panels without requiring a post-processing pipeline.
  vec3 filmicCompress(vec3 x, float exposure) {
    x = max(vec3(0.0), x * exposure);
    vec3 a = x * (2.51 * x + 0.03);
    vec3 b = x * (2.43 * x + 0.59) + 0.14;
    return clamp(a / b, 0.0, 1.0);
  }
`;
