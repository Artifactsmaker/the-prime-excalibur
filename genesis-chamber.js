/* eslint-env browser */
(function initPrimeOverlapGenesisChamber() {
  const canvas = document.getElementById("primeGenesisCanvas");
  const chamber = document.getElementById("genesisChamber");
  const stage = document.querySelector(".stage-visual");
  const readout = document.getElementById("genesisReadout");
  const fallback = document.getElementById("genesisFallback");
  const expandButton = document.getElementById("genesisExpandButton");
  const coEmergenceButton = document.getElementById("coEmergenceButton");
  const overlapInput = document.getElementById("overlapDepthInput");
  const residueInput = document.getElementById("residueRetentionInput");
  const closureInput = document.getElementById("piClosureInput");

  if (!canvas || !chamber) return;

  const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
  if (!gl) {
    if (fallback) {
      fallback.style.display = "block";
      fallback.textContent = "WebGL is not available in this browser.";
    }
    return;
  }

  const vertexSource = `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    uniform mat4 uMatrix;
    uniform float uPointSize;
    varying vec3 vColor;
    void main() {
      vec4 p = uMatrix * vec4(aPosition, 1.0);
      gl_Position = p;
      gl_PointSize = uPointSize * (1.0 + 0.32 / max(0.2, p.w));
      vColor = aColor;
    }
  `;

  const pointFragmentSource = `
    precision mediump float;
    varying vec3 vColor;
    void main() {
      vec2 c = gl_PointCoord - vec2(0.5);
      float d = length(c);
      float glow = smoothstep(0.55, 0.0, d);
      gl_FragColor = vec4(vColor, glow);
    }
  `;

  const lineFragmentSource = `
    precision mediump float;
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 0.68);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed");
    }
    return shader;
  }

  function createProgram(fragmentSource) {
    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
    }
    return program;
  }

  const pointProgram = createProgram(pointFragmentSource);
  const lineProgram = createProgram(lineFragmentSource);
  const pointBuffer = gl.createBuffer();
  const lineBuffer = gl.createBuffer();
  const state = { coEmergenceUntil: 0 };

  const domainA = Array.from({ length: 520 }, () => ({
    radius: 2.1 + Math.random() * 5.7,
    angle: Math.random() * Math.PI * 2,
    y: (Math.random() - 0.5) * 5.2,
    drift: Math.random() * Math.PI * 2,
    depth: (Math.random() - 0.5) * 5.4,
    strength: 0.55 + Math.random() * 0.45,
  }));

  const domainB = Array.from({ length: 520 }, () => ({
    radius: 2.1 + Math.random() * 5.7,
    angle: Math.random() * Math.PI * 2,
    y: (Math.random() - 0.5) * 5.2,
    drift: Math.random() * Math.PI * 2,
    depth: (Math.random() - 0.5) * 5.4,
    strength: 0.55 + Math.random() * 0.45,
  }));

  const stars = Array.from({ length: 560 }, () => {
    const radius = 16 + Math.random() * 25;
    const angle = Math.random() * Math.PI * 2;
    const warm = Math.random() > 0.52;
    return [
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 9,
      Math.sin(angle) * radius + (Math.random() - 0.5) * 24,
      warm ? 0.7 : 0.25,
      warm ? 0.52 : 0.72,
      warm ? 0.24 : 0.98,
    ];
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function multiply(a, b) {
    const out = new Array(16).fill(0);
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        out[col * 4 + row] =
          a[row] * b[col * 4] +
          a[4 + row] * b[col * 4 + 1] +
          a[8 + row] * b[col * 4 + 2] +
          a[12 + row] * b[col * 4 + 3];
      }
    }
    return out;
  }

  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  }

  function lookAt(eye, center, up) {
    const zx = eye[0] - center[0];
    const zy = eye[1] - center[1];
    const zz = eye[2] - center[2];
    const zLength = Math.hypot(zx, zy, zz) || 1;
    const z = [zx / zLength, zy / zLength, zz / zLength];
    let x = [
      up[1] * z[2] - up[2] * z[1],
      up[2] * z[0] - up[0] * z[2],
      up[0] * z[1] - up[1] * z[0],
    ];
    const xLength = Math.hypot(x[0], x[1], x[2]) || 1;
    x = [x[0] / xLength, x[1] / xLength, x[2] / xLength];
    const y = [
      z[1] * x[2] - z[2] * x[1],
      z[2] * x[0] - z[0] * x[2],
      z[0] * x[1] - z[1] * x[0],
    ];
    return [
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]),
      -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]),
      -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]),
      1,
    ];
  }

  function resize() {
    const box = chamber.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(box.width * dpr));
    canvas.height = Math.max(1, Math.floor(box.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function point(target, x, y, z, r, g, b) {
    target.push(x, y, z, r, g, b);
  }

  function drawBuffer(program, buffer, data, mode, pointSize, matrix) {
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    const color = gl.getAttribLocation(program, "aColor");
    gl.enableVertexAttribArray(position);
    gl.enableVertexAttribArray(color);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 24, 12);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uMatrix"), false, new Float32Array(matrix));
    gl.uniform1f(gl.getUniformLocation(program, "uPointSize"), pointSize);
    gl.drawArrays(mode, 0, data.length / 6);
  }

  function readControls(ms) {
    const active = ms < state.coEmergenceUntil;
    const overlap = clamp((Number(overlapInput?.value || 72) + (active ? 22 : 0)) / 100, 0.25, 1);
    const residue = clamp(Number(residueInput?.value || 64) / 100, 0.1, 1);
    const closure = clamp((Number(closureInput?.value || 68) + (active ? 18 : 0)) / 100, 0.2, 1);
    if (coEmergenceButton) coEmergenceButton.classList.toggle("is-active", active);
    return { active, overlap, residue, closure };
  }

  function domainPosition(seed, side, time, overlap, residue) {
    const domainOffset = side * (4.4 - overlap * 3.7);
    const angle = seed.angle + time * (side > 0 ? -0.13 : 0.11) + Math.sin(time * 0.17 + seed.drift) * 0.18;
    const radius = seed.radius * (1 - overlap * 0.2);
    return [
      domainOffset + Math.cos(angle) * radius,
      seed.y + Math.sin(angle * 1.7 + time * 0.18) * (0.25 + residue * 0.28),
      seed.depth + Math.sin(angle) * radius * 0.42,
    ];
  }

  function drawEllipse(lines, radiusX, radiusZ, y, color, time, tilt, segments) {
    for (let i = 0; i <= segments; i += 1) {
      const a = (i / segments) * Math.PI * 2 + time;
      point(lines, Math.cos(a) * radiusX, y + Math.sin(a + tilt) * 0.15, Math.sin(a) * radiusZ, color[0], color[1], color[2]);
    }
  }

  function drawGalaxy(points, lines, x, y, z, size, time, closure, residue, tint) {
    for (let i = 0; i < 110; i += 1) {
      const a = i * 2.399 + time * 0.38;
      const yy = -1 + (i / 109) * 2;
      const rr = Math.sqrt(Math.max(0, 1 - yy * yy)) * size;
      point(points, x + Math.cos(a) * rr * 0.52, y + yy * size * 0.34, z + Math.sin(a) * rr * 0.52, 1, 0.9, 0.45);
    }
    point(points, x, y, z, 0.05, 0.05, 0.08);
    for (let arm = 0; arm < 3; arm += 1) {
      for (let i = 0; i <= 120; i += 1) {
        const t = i / 120;
        const a = arm * Math.PI * 2 / 3 + t * Math.PI * (2.2 + residue * 1.5) + time * 0.32;
        const rr = size * (0.25 + t * (1.7 + residue));
        point(lines, x + Math.cos(a) * rr, y + Math.sin(t * Math.PI * 2 + arm) * 0.08, z + Math.sin(a) * rr * 0.62, tint[0], tint[1], tint[2]);
      }
    }
    for (let ring = 0; ring < 2; ring += 1) {
      drawEllipse(lines, size * (1.2 + ring * 0.34), size * (0.76 + ring * 0.2), y, [0.6, 1, 0.84], time * (0.2 + closure * 0.3), ring, 90);
    }
  }

  function animate(ms) {
    const time = ms * 0.001;
    const { active, overlap, residue, closure } = readControls(ms);
    const products = Math.round(24 + overlap * 88 + (active ? 44 : 0));
    const matter = Math.round(products * (0.22 + closure * 0.32));
    const galaxySeeds = Math.max(1, Math.round((overlap * closure - 0.35) * 6) + (active ? 3 : 0));
    const torsion = Math.round(residue * (45 + overlap * 42));
    const residuePercent = Math.round((1 - closure * 0.42) * residue * 100);
    const coStatus = active ? "ACTIVE" : galaxySeeds > 2 ? "FORMING" : "OFF";

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.DEPTH_TEST);

    const aspect = canvas.width / Math.max(1, canvas.height);
    const cameraRadius = 13.5 - overlap * 2.4;
    const eye = [
      Math.sin(time * 0.14) * cameraRadius,
      4.8 + Math.sin(time * 0.12) * 0.85,
      Math.cos(time * 0.14) * cameraRadius,
    ];
    const matrix = multiply(perspective(Math.PI / 3, aspect, 0.1, 90), lookAt(eye, [0, 0, 0], [0, 1, 0]));
    const points = [];
    const lines = [];

    stars.forEach((star) => point(points, star[0], star[1], star[2], star[3] * 0.36, star[4] * 0.36, star[5] * 0.42));

    domainA.forEach((seed) => {
      const p = domainPosition(seed, -1, time, overlap, residue);
      point(points, p[0], p[1], p[2], 1, 0.58 + seed.strength * 0.18, 0.18);
    });
    domainB.forEach((seed) => {
      const p = domainPosition(seed, 1, time, overlap, residue);
      point(points, p[0], p[1], p[2], 0.24, 0.72 + seed.strength * 0.18, 1);
    });

    drawEllipse(lines, 3.4 + overlap * 2.2, 1.6 + overlap * 1.3, 0, [0.86, 0.9, 1], time * 0.08, 0.4, 180);
    drawEllipse(lines, 4.1 + overlap * 2.4, 2.1 + overlap * 1.5, 0.05, [1, 0.76, 0.36], -time * 0.06, 1.1, 180);

    for (let i = 0; i < products; i += 1) {
      const phase = i * 2.399;
      const r = Math.sqrt(i / products) * (2.8 + overlap * 2.1);
      const a = phase + time * (0.18 + overlap * 0.26);
      const x = Math.cos(a) * r * 0.9;
      const y = Math.sin(phase + time * 0.6) * 0.9 * overlap;
      const z = Math.sin(a) * r * 0.55;
      const flash = 0.65 + Math.sin(time * 3.2 + i) * 0.25;
      point(points, x, y, z, 1, 0.86 + flash * 0.12, 0.54 + flash * 0.28);
      if (i % 7 === 0) {
        point(lines, x, y, z, 1, 0.9, 0.52);
        point(lines, x * 0.72, y * 0.72, z * 0.72, 0.44, 0.95, 1);
      }
    }

    for (let i = 0; i < matter; i += 1) {
      const a = i * 2.399 + time * 0.12;
      const r = Math.sqrt(i / matter) * (2.3 + closure * 1.7);
      point(points, Math.cos(a) * r, Math.sin(i + time) * 0.5, Math.sin(a) * r * 0.56, 1, 0.94, 0.62);
    }

    for (let seed = 0; seed < galaxySeeds; seed += 1) {
      const a = (seed / Math.max(1, galaxySeeds)) * Math.PI * 2 + time * 0.05;
      const radius = galaxySeeds > 1 ? 2.2 + overlap * 1.2 : 0;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius * 0.56;
      const y = Math.sin(a * 1.7 + time) * 0.34;
      const tint = seed % 2 ? [0.45, 0.9, 1] : [1, 0.72, 0.34];
      drawGalaxy(points, lines, x, y, z, 0.65 + closure * 0.54, time + seed, closure, residue, tint);
    }

    for (let trail = 0; trail < 7 + Math.round(residue * 8); trail += 1) {
      const base = trail * Math.PI * 2 / 7;
      for (let i = 0; i <= 120; i += 1) {
        const t = i / 120;
        const a = base + t * Math.PI * (2.4 + residue * 2.2) + time * (0.11 + trail * 0.01);
        const r = 2.5 + t * (3.7 + overlap * 1.4);
        point(lines, Math.cos(a) * r, Math.sin(t * Math.PI * 2 + trail) * 0.35, Math.sin(a) * r * 0.58, 0.58, 0.72, 1);
      }
    }

    drawBuffer(pointProgram, pointBuffer, points, gl.POINTS, 4.8 + overlap * 4.4, matrix);
    drawBuffer(lineProgram, lineBuffer, lines, gl.LINE_STRIP, 1, matrix);

    if (readout) {
      readout.textContent = `A ${Math.round(overlap * 92)} | B ${Math.round(overlap * 88)} | OVR ${Math.round(overlap * 100)} | P ${products} | M ${matter} | G ${galaxySeeds} | RES ${residuePercent} | TOR ${torsion} | CL ${Math.round(closure * 100)} | CO ${coStatus}`;
    }

    window.requestAnimationFrame(animate);
  }

  expandButton?.addEventListener("click", () => {
    stage?.classList.toggle("is-expanded");
    expandButton.textContent = stage?.classList.contains("is-expanded") ? "×" : "⛶";
    window.setTimeout(resize, 60);
  });

  coEmergenceButton?.addEventListener("click", () => {
    state.coEmergenceUntil = performance.now() + 6500;
  });

  try {
    window.addEventListener("resize", resize);
    resize();
    window.requestAnimationFrame(animate);
  } catch (error) {
    if (fallback) {
      fallback.style.display = "block";
      fallback.textContent = "Prime Overlap chamber could not start.";
    }
  }
})();
