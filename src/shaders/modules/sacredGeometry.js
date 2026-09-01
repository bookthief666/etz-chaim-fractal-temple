export const sacredGeometryGLSL = /* glsl */ `
  const float PI = 3.141592653589793;
  const float TAU = 6.283185307179586;

  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  mat2 rot(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
  }

  float sdSphere(vec3 p, float r) {
    return length(p) - r;
  }

  float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
  }

  float sdRoundBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
  }

  float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
  }

  // Inigo Quilez-style box frame SDF. Used as the primitive from which the
  // tesseract-like projections and crystalline lattice cells are built.
  float sdBoxFrame(vec3 p, vec3 b, float e) {
    p = abs(p) - b;
    vec3 q = abs(p + e) - e;
    return min(
      min(
        length(max(vec3(p.x, q.y, q.z), 0.0)) + min(max(p.x, max(q.y, q.z)), 0.0),
        length(max(vec3(q.x, p.y, q.z), 0.0)) + min(max(q.x, max(p.y, q.z)), 0.0)
      ),
      length(max(vec3(q.x, q.y, p.z), 0.0)) + min(max(q.x, max(q.y, p.z)), 0.0)
    );
  }

  float sdOctahedron(vec3 p, float s) {
    p = abs(p);
    float m = p.x + p.y + p.z - s;
    vec3 q;
    if (3.0 * p.x < m) q = p.xyz;
    else if (3.0 * p.y < m) q = p.yzx;
    else if (3.0 * p.z < m) q = p.zxy;
    else return m * 0.57735027;
    float k = clamp(0.5 * (q.z - q.y + s), 0.0, s);
    return length(vec3(q.x, q.y - s + k, q.z - k));
  }

  float smoothUnion(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  float smoothSubtraction(float a, float b, float k) {
    float h = clamp(0.5 - 0.5 * (b + a) / k, 0.0, 1.0);
    return mix(b, -a, h) + k * h * (1.0 - h);
  }

  float sdSegment2D(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  vec2 polarPoint(float radius, float angle) {
    return radius * vec2(cos(angle), sin(angle));
  }

  // Folds an arbitrary point into one angular sector without a loop. Moving
  // the folded point away from the origin then creates N repeated motifs at
  // a fraction of the cost of evaluating N independent SDFs.
  vec2 polarRepeat(vec2 p, float repetitions) {
    float sector = TAU / repetitions;
    float angle = atan(p.y, p.x);
    angle = mod(angle + 0.5 * sector, sector) - 0.5 * sector;
    return length(p) * vec2(cos(angle), sin(angle));
  }

  vec3 polarRingCell(vec3 p, float repetitions, float radius) {
    vec2 folded = polarRepeat(p.xy, repetitions);
    folded.x -= radius;
    return vec3(folded, p.z);
  }

  // A true five-line pentagram rather than merely a spiky radial blob.
  float sdPentagramPrism(vec3 p, float radius, float thickness, float halfDepth) {
    float d = 99.0;
    for (int i = 0; i < 5; i++) {
      float a0 = PI * 0.5 + TAU * float(i) / 5.0;
      float a1 = PI * 0.5 + TAU * float(mod(float(i + 2), 5.0)) / 5.0;
      d = min(d, sdSegment2D(p.xy, polarPoint(radius, a0), polarPoint(radius, a1)));
    }
    return max(d - thickness, abs(p.z) - halfDepth);
  }

  float triangleLines(vec2 p, float radius, float phase) {
    vec2 a = polarPoint(radius, phase);
    vec2 b = polarPoint(radius, phase + TAU / 3.0);
    vec2 c = polarPoint(radius, phase + 2.0 * TAU / 3.0);
    return min(sdSegment2D(p, a, b), min(sdSegment2D(p, b, c), sdSegment2D(p, c, a)));
  }

  // Two interlaced triangular line-prisms: a clean six-pointed star motif.
  float sdHexagramPrism(vec3 p, float radius, float thickness, float halfDepth) {
    float up = triangleLines(p.xy, radius, PI * 0.5);
    float down = triangleLines(p.xy, radius, -PI * 0.5);
    return max(min(up, down) - thickness, abs(p.z) - halfDepth);
  }

  // Thin star/flower ring useful for 4-, 7-, 8-, 9- and 10-fold realms.
  float sdRadialWaveRing(vec3 p, float folds, float radius, float amplitude, float thickness) {
    float a = atan(p.y, p.x);
    float target = radius + amplitude * cos(folds * a);
    float radial = abs(length(p.xy) - target) - thickness;
    return max(radial, abs(p.z) - thickness * 2.2);
  }

  // A spatial sine/helix tube. Multiple rotated copies become flow fields.
  float sdHelixTube(vec3 p, float radius, float frequency, float thickness, float phase) {
    float a = p.z * frequency + phase;
    vec2 center = radius * vec2(cos(a), sin(a));
    return length(p.xy - center) - thickness;
  }

  float sdWaveRibbon(vec3 p, float amplitude, float frequency, float width, float phase) {
    float y = amplitude * sin(p.z * frequency + phase);
    return length(vec2(p.x, p.y - y)) - width;
  }

  // A 3D projection metaphor for a tesseract: two differently oriented cube
  // frames embedded in the same field, plus a smaller inner frame. It is
  // intentionally named "Like" rather than falsely claiming 4D projection fidelity.
  float sdTesseractFrameLike(vec3 p, float size, float thickness, float phase) {
    vec3 q = p;
    q.xy *= rot(phase);
    q.yz *= rot(phase * 0.73);
    float outer = sdBoxFrame(q, vec3(size), thickness);

    vec3 innerP = p;
    innerP.xz *= rot(-phase * 1.17 + 0.42);
    innerP.yz *= rot(phase * 0.51 - 0.31);
    float inner = sdBoxFrame(innerP, vec3(size * 0.58), thickness * 0.78);
    return min(outer, inner);
  }

  vec3 repeatCell(vec3 p, float span) {
    return mod(p + span * 0.5, span) - span * 0.5;
  }

  float neonBands(vec3 p, float frequency, float phase) {
    float a = sin((p.x + p.y + p.z) * frequency + phase);
    float b = sin((p.x - p.y + p.z * 0.5) * frequency * 0.73 - phase * 0.61);
    return pow(0.5 + 0.5 * a * b, 6.0);
  }
`;
