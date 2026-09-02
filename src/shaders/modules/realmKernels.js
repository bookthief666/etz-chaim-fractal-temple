export const realmKernelsGLSL = /* glsl */ `
  float crossVoid(vec3 p, float width) {
    p = abs(p);
    float xy = max(p.x, p.y);
    float yz = max(p.y, p.z);
    float zx = max(p.z, p.x);
    return min(xy, min(yz, zx)) - width;
  }

  // M3A depth rite. uDepthStage is 0..3 and repeats after every complete
  // four-stage descent cycle. uDepthEpoch increments on each repetition, so a
  // realm can recur without merely returning to precisely the same state.
  float depthStageOn(float stage) {
    return step(stage - 0.01, uDepthStage);
  }

  float depthGatePulse() {
    float edge = min(uDepthPhase, 1.0 - uDepthPhase);
    return exp(-edge * edge * 240.0);
  }

  // 1 · KETHER -----------------------------------------------------------
  float ketherDE(vec3 p, float octave) {
    float t = uTime * 0.12 * uMotionScale;
    vec3 q = p;
    q.xy *= rot(t * 0.37 + 0.08 * sin(octave) + uDepthEpoch * 0.03);
    q.yz *= rot(-t * 0.29);

    float d = sdTesseractFrameLike(q, 0.78, 0.028, 0.42 + t);

    vec3 ringA = p;
    ringA.xy *= rot(t * 0.21);
    float crownA = sdTorus(ringA, vec2(0.78, 0.022));

    vec3 ringB = p;
    ringB.yz *= rot(PI * 0.5 + t * 0.17);
    float crownB = sdTorus(ringB, vec2(0.54, 0.014));
    d = min(d, min(crownA, crownB));

    float scale = 1.0;
    vec3 r = p;
    for (int i = 0; i < 2; i++) {
      r = abs(r) * 1.82 - vec3(0.67, 0.64, 0.66);
      scale *= 1.82;
      float frame = sdTesseractFrameLike(r, 0.31, 0.016, t + float(i) * 0.61) / scale;
      d = min(d, frame);
    }

    // The third nested frame is retained at higher quality but skipped on the
    // conservative Fold profile. Keeping it outside the fixed loop avoids
    // mobile GLSL compilers having to support a uniform-dependent loop break.
    if (uQuality >= 0.68) {
      r = abs(r) * 1.82 - vec3(0.67, 0.64, 0.66);
      scale *= 1.82;
      float frame = sdTesseractFrameLike(r, 0.31, 0.016, t + 1.22) / scale;
      d = min(d, frame);
    }

    if (uDepthStage > 1.5 && uQuality > 0.52) {
      vec3 crownCell = polarRingCell(q, 8.0, 0.93);
      d = min(d, sdTesseractFrameLike(crownCell, 0.16, 0.009, t * 0.6));
    }

    d = min(d, sdSphere(p, 0.045));
    return d;
  }

  vec2 combinePhaseBasis(vec2 basis, vec2 offsetBasis) {
    return vec2(
      basis.x * offsetBasis.x - basis.y * offsetBasis.y,
      basis.y * offsetBasis.x + basis.x * offsetBasis.y
    );
  }

  vec2 rotateWithBasis(vec2 p, vec2 basis) {
    return vec2(p.x * basis.x - p.y * basis.y, p.x * basis.y + p.y * basis.x);
  }

  // Exact sdTesseractFrameLike geometry with its uniform-only phase
  // trigonometry supplied as a precomputed basis. Kether calls the same frame
  // at every march/normal probe, so this preserves the SDF while avoiding
  // thousands of repeated sin/cos evaluations per fragment.
  float sdTesseractFrameLikeBasis(
    vec3 p,
    float size,
    float thickness,
    vec4 basis0,
    vec4 basis1,
    vec4 offsetBasis0,
    vec4 offsetBasis1
  ) {
    vec3 q = p;
    q.xy = rotateWithBasis(q.xy, combinePhaseBasis(basis0.xy, offsetBasis0.xy));
    q.yz = rotateWithBasis(q.yz, combinePhaseBasis(basis0.zw, offsetBasis0.zw));
    float outer = sdBoxFrame(q, vec3(size), thickness);

    vec3 innerP = p;
    innerP.xz = rotateWithBasis(
      innerP.xz,
      combinePhaseBasis(basis1.xy, offsetBasis1.xy)
    );
    innerP.yz = rotateWithBasis(
      innerP.yz,
      combinePhaseBasis(basis1.zw, offsetBasis1.zw)
    );
    float inner = sdBoxFrame(innerP, vec3(size * 0.58), thickness * 0.78);
    return min(outer, inner);
  }

  // M4.16 generated Kether fast path. Geometry and quality/depth thresholds
  // are identical to ketherDE; only uniform phase trigonometry is hoisted out
  // of the fragment's ray/normal loops through four precomputed vec4 uniforms.
  float ketherGeneratedDE(vec3 p, float octave) {
    float t = uTime * 0.12 * uMotionScale;
    vec3 q = p;
    q.xy *= rot(t * 0.37 + 0.08 * sin(octave) + uDepthEpoch * 0.03);
    q.yz *= rot(-t * 0.29);

    float d = sdTesseractFrameLikeBasis(
      q,
      0.78,
      0.028,
      uKetherPhysicalBasis0,
      uKetherPhysicalBasis1,
      vec4(0.913088940, 0.407760453, 0.953365263, 0.301818945),
      vec4(0.997452103, -0.071339350, 0.995414688, -0.095653531)
    );

    vec3 ringA = p;
    ringA.xy *= rot(t * 0.21);
    float crownA = sdTorus(ringA, vec2(0.78, 0.022));

    vec3 ringB = p;
    ringB.yz *= rot(PI * 0.5 + t * 0.17);
    float crownB = sdTorus(ringB, vec2(0.54, 0.014));
    d = min(d, min(crownA, crownB));

    float scale = 1.82;
    vec3 r = p;
    r = abs(r) * 1.82 - vec3(0.67, 0.64, 0.66);
    float nestedA = sdTesseractFrameLikeBasis(
      r,
      0.31,
      0.016,
      uKetherPhysicalBasis0,
      uKetherPhysicalBasis1,
      vec4(1.0, 0.0, 1.0, 0.0),
      vec4(0.913088940, 0.407760453, 0.952333570, -0.305058636)
    ) / scale;
    d = min(d, nestedA);

    r = abs(r) * 1.82 - vec3(0.67, 0.64, 0.66);
    scale *= 1.82;
    float nestedB = sdTesseractFrameLikeBasis(
      r,
      0.31,
      0.016,
      uKetherPhysicalBasis0,
      uKetherPhysicalBasis1,
      vec4(0.819648018, 0.572867460, 0.902481487, 0.430728644),
      vec4(0.957179296, -0.289495762, 0.999999395, 0.001100000)
    ) / scale;
    d = min(d, nestedB);

    if (uQuality >= 0.68) {
      r = abs(r) * 1.82 - vec3(0.67, 0.64, 0.66);
      scale *= 1.82;
      float frame = sdTesseractFrameLikeBasis(
        r,
        0.31,
        0.016,
        uKetherPhysicalBasis0,
        uKetherPhysicalBasis1,
        vec4(0.343645746, 0.939099356, 0.628945670, 0.777449255),
        vec4(0.534060684, -0.845446146, 0.951660137, 0.307153030)
      ) / scale;
      d = min(d, frame);
    }

    if (uDepthStage > 1.5 && uQuality > 0.52) {
      vec3 crownCell = polarRingCell(q, 8.0, 0.93);
      d = min(d, sdTesseractFrameLike(crownCell, 0.16, 0.009, t * 0.6));
    }

    d = min(d, sdSphere(p, 0.045));
    return d;
  }

  float ketherGeneratedGlyphDE(vec3 p) {
    vec3 g = p;
    float t = uTime * uMotionScale;
    g.xy *= rot(0.11 * t + uDepthEpoch * 0.03);
    float frame = sdTesseractFrameLikeBasis(
      g,
      0.62,
      0.010,
      uKetherGlyphBasis0,
      uKetherGlyphBasis1,
      vec4(1.0, 0.0, 1.0, 0.0),
      vec4(0.913088940, 0.407760453, 0.952333570, -0.305058636)
    );
    vec3 ring = p;
    ring.yz *= rot(PI * 0.5);
    return min(frame, sdTorus(ring, vec2(0.72, 0.011)));
  }

  // 2 · CHOKMAH ----------------------------------------------------------
  float chokmahDE(vec3 p, float octave) {
    float t = uTime * 0.58 * uMotionScale;
    vec3 q = p;
    q.xy *= rot(t * 0.24 + octave * 0.07 + uDepthEpoch * 0.06);

    float h1 = sdHelixTube(q, 0.43, 5.2, 0.033, t);
    float h2 = sdHelixTube(q, 0.43, 5.2, 0.033, t + PI);
    float d = min(h1, h2);

    vec3 xFlow = p.zxy;
    xFlow.xy *= rot(0.7 + t * 0.11);
    d = min(d, sdHelixTube(xFlow, 0.62, 3.7, 0.023, -t * 0.8));

    vec3 yFlow = p.yzx;
    yFlow.xy *= rot(-0.42 - t * 0.09);
    d = min(d, sdHelixTube(yFlow, 0.78, 2.8, 0.018, t * 0.63));

    vec3 shellP = p;
    shellP.z *= 0.55;
    float burst = sdRadialWaveRing(
      shellP,
      12.0,
      0.88 + 0.05 * sin(t * 1.7),
      0.13 + 0.04 * sin(t + octave),
      0.018
    );
    d = min(d, burst);

    if (uDepthStage > 1.5) {
      vec3 stream = polarRingCell(q, 6.0, 0.74);
      d = min(d, sdHelixTube(stream, 0.14, 8.0, 0.012, -t * 1.1));
    }
    return d;
  }

  // 3 · BINAH ------------------------------------------------------------
  float binahDE(vec3 p, float octave) {
    float t = uTime * 0.08 * uMotionScale;
    p.xz *= rot(0.055 * sin(t + octave * 0.1) + uDepthEpoch * 0.016);
    float d = sdBox(p, vec3(1.12));
    float scale = 1.0;
    vec3 q = p;

    for (int i = 0; i < 4; i++) {
      vec3 cell = mod(q * scale + 1.0, 2.0) - 1.0;
      float voidField = crossVoid(cell, 0.34) / scale;
      d = max(d, -voidField);
      scale *= 3.0;
    }

    float shell = abs(length(p) - 1.58) - 0.046;
    float cage = sdTesseractFrameLike(p, 1.38, 0.025, 0.18 + t);
    return min(d, min(shell, cage));
  }

  // 4 · CHESED -----------------------------------------------------------
  float chesedDE(vec3 p, float octave) {
    float t = uTime * 0.22 * uMotionScale;
    vec3 q = p;
    q.xy *= rot(0.18 * sin(t) + uDepthEpoch * 0.025);
    vec3 mirrored = abs(q);

    float bloom = sdRoundBox(
      mirrored - vec3(0.48, 0.48, 0.0),
      vec3(0.22 + 0.035 * sin(t + octave), 0.22, 0.18),
      0.09
    );

    float fourRing = sdRadialWaveRing(q, 4.0, 0.78, 0.11, 0.026);
    vec3 crown = q;
    crown.yz *= rot(PI * 0.5);
    float torus = sdTorus(crown, vec2(0.74 + 0.04 * sin(t * 0.7), 0.025));

    float d = smoothUnion(bloom, fourRing, 0.075);
    d = smoothUnion(d, torus, 0.055);
    if (uDepthStage > 1.5) {
      vec3 small = polarRingCell(q, 4.0, 0.84);
      d = smoothUnion(d, sdRoundBox(small, vec3(0.13), 0.05), 0.035);
    }
    return d;
  }

  // 5 · GEBURAH ----------------------------------------------------------
  // M3A turns one iconic pentagram into a four-stage rite: singular sword,
  // five satellite stars, a star-tunnel, then nested recursive discrimination.
  float geburahDE(vec3 p, float octave) {
    float t = uTime * 0.48 * uMotionScale;
    float snap = floor(t * 2.0) / 2.0;
    vec3 q = p;
    q.xy *= rot(0.19 * sin(t * 0.7) + snap * 0.045 + uDepthEpoch * 0.055);

    float star = sdPentagramPrism(q, 0.74, 0.027, 0.16);
    vec3 q2 = q * 1.66;
    q2.xy *= rot(PI / 5.0 + t * 0.08);
    float innerStar = sdPentagramPrism(q2, 0.72, 0.022, 0.13) / 1.66;

    float blades = 99.0;
    for (int i = 0; i < 3; i++) {
      vec3 b = p;
      b.xy *= rot(float(i) * PI / 3.0 + t * (0.09 + 0.02 * float(i)));
      b.yz *= rot(-0.22 + float(i) * 0.17);
      blades = min(blades, sdRoundBox(b, vec3(1.04, 0.018, 0.12), 0.008));
    }

    float fiveRing = sdRadialWaveRing(q, 5.0, 0.98, 0.11, 0.021);
    float d = min(min(star, innerStar), min(blades, fiveRing));

    if (uDepthStage > 0.5) {
      vec3 satellites = polarRingCell(q, 5.0, 0.89);
      satellites.xy *= rot(PI * 0.5 + t * 0.05);
      float starField = sdPentagramPrism(satellites, 0.22, 0.011, 0.065);
      d = min(d, starField);
    }

    if (uDepthStage > 1.5) {
      vec3 tunnel = q;
      float slice = floor((tunnel.z + 0.46) / 0.92);
      tunnel.z = mod(tunnel.z + 0.46, 0.92) - 0.46;
      tunnel.xy *= rot(slice * 0.19 + t * 0.035);
      float tunnelStar = sdPentagramPrism(tunnel, 0.53, 0.013, 0.040);
      d = min(d, tunnelStar);
    }

    if (uDepthStage > 2.5) {
      vec3 recursion = q * 2.48;
      recursion.xy *= rot(-PI / 5.0 + t * 0.06);
      float nested = sdPentagramPrism(recursion, 0.70, 0.010, 0.055) / 2.48;
      recursion *= 1.68;
      recursion.xy *= rot(PI / 5.0);
      nested = min(nested, sdPentagramPrism(recursion, 0.68, 0.008, 0.045) / (2.48 * 1.68));
      d = min(d, nested);
    }
    return d;
  }

  // 6 · TIPHARETH --------------------------------------------------------
  // The showcase solar temple. Successive stages reveal a sixfold court,
  // nested stars, and finally a repeating solar/hexagram corridor.
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

  // 7 · NETZACH ----------------------------------------------------------
  float netzachDE(vec3 p, float octave) {
    float t = uTime * 0.39 * uMotionScale;
    vec3 q = p;
    q.xy *= rot(0.13 * sin(t * 0.6) + uDepthEpoch * 0.022);

    float petals = sdRadialWaveRing(q, 7.0, 0.73, 0.18, 0.028);
    float d = petals;

    vec3 vineA = p;
    vineA.xy *= rot(t * 0.12);
    d = smoothUnion(d, sdHelixTube(vineA, 0.39, 3.9, 0.031, t), 0.075);

    vec3 vineB = p.yzx;
    vineB.xy *= rot(-0.7 + t * 0.08);
    d = smoothUnion(d, sdHelixTube(vineB, 0.55, 3.1, 0.027, -t * 0.73), 0.07);

    vec3 blossom = abs(p);
    float bud = sdSphere(blossom - vec3(0.34, 0.34, 0.34), 0.11 + 0.02 * sin(t + octave));
    d = smoothUnion(d, bud, 0.10);

    if (uDepthStage > 1.5) {
      vec3 petalCell = polarRingCell(q, 7.0, 0.88);
      d = smoothUnion(d, sdTorus(petalCell, vec2(0.14, 0.012)), 0.035);
    }
    return d;
  }

  // 8 · HOD --------------------------------------------------------------
  float hodDE(vec3 p, float octave) {
    float tick = floor(uTime * 3.0 * uMotionScale) / 3.0;
    vec3 q = p;
    q.xy *= rot(0.13 * sin(tick * 0.7) + uDepthEpoch * 0.02);
    q.xz *= rot(-0.09 * cos(tick * 0.5));

    vec3 cell = repeatCell(q, 1.02);
    float frame = sdTesseractFrameLike(cell, 0.30, 0.015, 0.31 + tick * 0.08);
    float crystal = sdOctahedron(cell, 0.34) - 0.010;
    crystal = max(crystal, -sdOctahedron(cell, 0.21));

    float ring = sdRadialWaveRing(q, 8.0, 0.94, 0.085, 0.017);
    float d = min(min(frame, crystal), ring);
    if (uDepthStage > 1.5) {
      vec3 signal = polarRingCell(q, 8.0, 0.83);
      d = min(d, sdTesseractFrameLike(signal, 0.14, 0.008, tick * 0.11));
    }
    return d;
  }

  // 9 · YESOD ------------------------------------------------------------
  // M3A develops the lunar field from mirrored bodies into ninefold moon
  // beads, a phase corridor, and finally recursive image-within-image shells.
  float yesodDE(vec3 p, float octave) {
    float t = uTime * 0.34 * uMotionScale;
    p.xy *= rot(0.09 * sin(t * 0.8) + uDepthEpoch * 0.028);
    p.z += 0.12 * sin(p.x * 2.3 + t);
    p.x += 0.09 * sin(p.y * 2.0 - t * 0.74);

    vec3 mirrored = abs(p);
    float d = 8.0;

    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float a = fi * 2.399963 + uSeed * 0.17 + octave * 0.09;
      vec3 center = vec3(
        0.34 + 0.34 * cos(a + t * (0.16 + fi * 0.012)),
        0.32 + 0.30 * sin(a * 1.37 - t * 0.14),
        0.22 + 0.26 * sin(a * 0.73 + t * 0.18)
      );
      float radius = 0.17 + 0.055 * sin(a * 1.9 + t * 0.32);
      float body = length(mirrored - abs(center)) - radius;
      d = smoothUnion(d, body, 0.13);
    }

    vec3 moonRingP = p;
    moonRingP.yz *= rot(PI * 0.5 + 0.18 * sin(t * 0.7));
    moonRingP.xy *= rot(0.16 * sin(t * 0.41));
    float lunarRing = sdTorus(moonRingP, vec2(0.76 + 0.035 * sin(t * 0.55), 0.024));
    float nineRing = sdRadialWaveRing(p, 9.0, 1.02, 0.062, 0.015);
    d = smoothUnion(smoothUnion(d, lunarRing, 0.055), nineRing, 0.045);

    if (uDepthStage > 0.5) {
      vec3 moonCell = polarRingCell(p, 9.0, 0.88);
      float beads = sdSphere(moonCell, 0.082 + 0.012 * sin(t * 1.4));
      d = smoothUnion(d, beads, 0.032);
    }

    if (uDepthStage > 1.5) {
      vec3 corridor = p;
      float slice = floor((corridor.z + 0.42) / 0.84);
      corridor.z = mod(corridor.z + 0.42, 0.84) - 0.42;
      corridor.xy *= rot(slice * 0.17 + 0.09 * sin(t * 0.5));
      float waveGate = sdRadialWaveRing(corridor, 9.0, 0.62, 0.055, 0.010);
      d = smoothUnion(d, waveGate, 0.024);
    }

    if (uDepthStage > 2.5) {
      vec3 echo = abs(p) * 2.15 - vec3(0.66, 0.61, 0.58);
      echo.xy *= rot(t * 0.08);
      float echoRing = sdRadialWaveRing(echo, 9.0, 0.48, 0.055, 0.009) / 2.15;
      vec3 echoTor = echo;
      echoTor.yz *= rot(PI * 0.5);
      echoRing = min(echoRing, sdTorus(echoTor, vec2(0.42, 0.009)) / 2.15);
      d = smoothUnion(d, echoRing, 0.018);
    }
    return d;
  }

  // 10 · MALKUTH ---------------------------------------------------------
  // M3A turns the Kingdom into an increasingly architectural manifestation:
  // crystal matter, fourfold gates, a mineral corridor, then nested crystal.
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

  float realmDE(vec3 p, float octave) {
    if (uRealmKind < 1.5) return ketherDE(p, octave);
    if (uRealmKind < 2.5) return chokmahDE(p, octave);
    if (uRealmKind < 3.5) return binahDE(p, octave);
    if (uRealmKind < 4.5) return chesedDE(p, octave);
    if (uRealmKind < 5.5) return geburahDE(p, octave);
    if (uRealmKind < 6.5) return tipharethDE(p, octave);
    if (uRealmKind < 7.5) return netzachDE(p, octave);
    if (uRealmKind < 8.5) return hodDE(p, octave);
    if (uRealmKind < 9.5) return yesodDE(p, octave);
    return malkuthDE(p, octave);
  }

  float realmGlyphDE(vec3 p, float octave) {
    float t = uTime * uMotionScale;

    if (uRealmKind < 1.5) {
      vec3 g = p;
      g.xy *= rot(0.11 * t + uDepthEpoch * 0.03);
      float frame = sdTesseractFrameLike(g, 0.62, 0.010, 0.34 + t * 0.05);
      vec3 ring = p;
      ring.yz *= rot(PI * 0.5);
      return min(frame, sdTorus(ring, vec2(0.72, 0.011)));
    }
    if (uRealmKind < 2.5) {
      vec3 g = p;
      float helix = sdHelixTube(g, 0.48, 5.2, 0.012, t * 0.7);
      float burst = sdRadialWaveRing(g, 12.0, 0.84, 0.10, 0.010);
      return min(helix, burst);
    }
    if (uRealmKind < 3.5) {
      vec3 g = p;
      g.xz *= rot(0.03 * sin(t * 0.2));
      return sdTesseractFrameLike(g, 1.34, 0.010, 0.16 + t * 0.02);
    }
    if (uRealmKind < 4.5) {
      vec3 g = p;
      float four = sdRadialWaveRing(g, 4.0, 0.82, 0.08, 0.010);
      vec3 tor = g;
      tor.yz *= rot(PI * 0.5);
      return min(four, sdTorus(tor, vec2(0.67, 0.010)));
    }
    if (uRealmKind < 5.5) {
      vec3 g = p;
      g.z = mod(g.z + 0.9, 1.8) - 0.9;
      g.xy *= rot(0.12 * sin(t * 0.34) + uDepthEpoch * 0.05);
      float star = sdPentagramPrism(g, 0.68, 0.010, 0.055);
      vec3 inner = g * 1.55;
      inner.xy *= rot(PI / 5.0);
      float star2 = sdPentagramPrism(inner, 0.64, 0.008, 0.045) / 1.55;
      float d = min(star, star2);
      if (uDepthStage > 0.5) {
        vec3 satellites = polarRingCell(g, 5.0, 0.86);
        d = min(d, sdPentagramPrism(satellites, 0.20, 0.007, 0.035));
      }
      if (uDepthStage > 2.5) {
        vec3 recursive = g * 2.35;
        d = min(d, sdPentagramPrism(recursive, 0.66, 0.006, 0.032) / 2.35);
      }
      return d;
    }
    if (uRealmKind < 6.5) {
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
    if (uRealmKind < 7.5) {
      vec3 g = p;
      float petals = sdRadialWaveRing(g, 7.0, 0.70, 0.115, 0.010);
      vec3 vine = g.yzx;
      float helix = sdHelixTube(vine, 0.44, 3.5, 0.011, -t * 0.31);
      return min(petals, helix);
    }
    if (uRealmKind < 8.5) {
      vec3 cell = repeatCell(p, 1.02);
      float frame = sdTesseractFrameLike(cell, 0.30, 0.009, 0.24 + floor(t * 2.0) * 0.03);
      float eight = sdRadialWaveRing(p, 8.0, 0.89, 0.052, 0.009);
      return min(frame, eight);
    }
    if (uRealmKind < 9.5) {
      vec3 g = p;
      g.xy *= rot(0.08 * sin(t * 0.29) + uDepthEpoch * 0.028);
      float nine = sdRadialWaveRing(g, 9.0, 0.94, 0.052, 0.009);
      vec3 tor = g;
      tor.yz *= rot(PI * 0.5 + 0.12 * sin(t * 0.2));
      float d = min(nine, sdTorus(tor, vec2(0.69, 0.010)));
      if (uDepthStage > 0.5) {
        vec3 moons = polarRingCell(g, 9.0, 0.86);
        d = min(d, sdSphere(moons, 0.060));
      }
      if (uDepthStage > 2.5) {
        vec3 echo = abs(g) * 2.1 - vec3(0.64, 0.60, 0.57);
        d = min(d, sdRadialWaveRing(echo, 9.0, 0.45, 0.04, 0.006) / 2.1);
      }
      return d;
    }

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

  float realmLinePattern(vec3 p) {
    float a = atan(p.y, p.x);
    float t = uTime * uMotionScale;
    float rite = 0.15 * uDepthStage + 0.08 * uDepthPhase;

    if (uRealmKind < 1.5) {
      return max(neonBands(p, 7.0 + rite, t * 0.16), pow(0.5 + 0.5 * cos(4.0 * a), 10.0));
    }
    if (uRealmKind < 2.5) {
      return max(neonBands(p, 10.0 + rite, -t * 0.8), pow(0.5 + 0.5 * sin(12.0 * a - t), 8.0));
    }
    if (uRealmKind < 3.5) {
      return neonBands(floor(p * 6.0) / 6.0, 4.0 + rite, t * 0.08);
    }
    if (uRealmKind < 4.5) {
      return max(neonBands(p, 5.0 + rite, t * 0.25), pow(0.5 + 0.5 * cos(4.0 * a), 8.0));
    }
    if (uRealmKind < 5.5) {
      return max(neonBands(p, 12.0 + rite * 2.0, t * 1.2), pow(0.5 + 0.5 * cos(5.0 * a + t * 0.3), 12.0));
    }
    if (uRealmKind < 6.5) {
      return max(neonBands(p, 8.0 + rite, t * 0.45), pow(0.5 + 0.5 * cos(6.0 * a - t * 0.14), 14.0));
    }
    if (uRealmKind < 7.5) {
      return max(neonBands(p, 6.0 + rite, t * 0.6), pow(0.5 + 0.5 * cos(7.0 * a + t * 0.2), 9.0));
    }
    if (uRealmKind < 8.5) {
      return max(neonBands(p, 15.0 + rite, floor(t * 3.0) * 0.2), pow(0.5 + 0.5 * cos(8.0 * a), 13.0));
    }
    if (uRealmKind < 9.5) {
      return max(neonBands(p, 7.0 + rite, -t * 0.5), pow(0.5 + 0.5 * cos(9.0 * a + t * 0.17), 10.0));
    }
    return max(neonBands(p, 11.0 + rite, t * 0.18), pow(0.5 + 0.5 * cos(10.0 * a), 12.0));
  }
`;
