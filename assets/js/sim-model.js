/* ============================================================
   CUAL / FLIGHT LOG — 真机模型查看器
   数据：assets/models/m0.glb m1.glb m2.glb（自研包 CUALMDL1，gzip 后分片混淆，
   3 片 XOR 混淆，WebGL 实时解码渲染，不落明文网格文件）
   ============================================================ */
(function () {
  'use strict';

  var stage = document.querySelector('.sim-stage');
  var canvas = document.getElementById('simCanvas');
  if (!stage || !canvas) return;

  var statusEl = document.getElementById('simStatus');
  var hintEl = document.getElementById('simHint');

  /* ---- 分片表：seed 以异或形式存放，运行时还原 ---- */
  var MIX = 0x5bd1e995;
  var GZ_BYTES = 1095457;                   // 内层 gzip 真实长度（4 字节补齐后要剪掉尾巴）
  var CHUNKS = [
    ['assets/models/m0.glb?v=7', 365152, (0x1b873593 ^ MIX) >>> 0],
    ['assets/models/m1.glb?v=7', 365152, (0x7f4a7c15 ^ MIX) >>> 0],
    ['assets/models/m2.glb?v=7', 365156, (0x2c1b3c6d ^ MIX) >>> 0]
  ];

  var started = false;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setStatus(t) {
    if (statusEl) statusEl.textContent = t;
  }

  function fail(reason) {
    stage.classList.add('sim-fallback');
    setStatus('ERR ' + String(reason).slice(0, 60));
    console.warn('[sim] fallback:', reason);
  }

  /* ---------------- 解码 + 解析 ---------------- */
  function xorStream(dv, seed) {
    var words = (dv.byteLength / 4) | 0;
    var x = (seed ^ MIX) >>> 0;
    for (var i = 0; i < words; i++) {
      x = (x ^ (x << 13)) >>> 0;
      x = (x ^ (x >>> 17)) >>> 0;
      x = (x ^ (x << 5)) >>> 0;
      dv.setUint32(i * 4, (dv.getUint32(i * 4, true) ^ x) >>> 0, true);
    }
  }

  function inflate(bytes) {
    if (typeof DecompressionStream === 'undefined') {
      return Promise.reject(new Error('no DecompressionStream'));
    }
    var ds = new DecompressionStream('gzip');
    var writer = ds.writable.getWriter();
    writer.write(bytes).catch(function () {});
    writer.close().catch(function () {});
    var reader = ds.readable.getReader();
    var parts = [];
    var total = 0;
    return new Promise(function (resolve, reject) {
      function pump() {
        reader.read().then(function (res) {
          if (res.done) {
            var buf = new Uint8Array(total);
            var off = 0;
            parts.forEach(function (c) { buf.set(c, off); off += c.length; });
            resolve(buf);
            return;
          }
          parts.push(new Uint8Array(res.value));
          total += res.value.byteLength;
          pump();
        }, reject);
      }
      pump();
    });
  }

  function loadPacked() {
    var cursor = 0;
    var jobs = CHUNKS.map(function (c) {
      var start = cursor;
      cursor += c[1];
      return fetch(c[0], { cache: 'default' })
        .then(function (r) {
          if (!r.ok) throw new Error(c[0] + ' ' + r.status);
          return r.arrayBuffer();
        })
        .then(function (buf) {
          if (buf.byteLength !== c[1]) throw new Error('size mismatch ' + c[0]);
          return { start: start, bytes: new Uint8Array(buf), seed: c[2] };
        });
    });
    return Promise.all(jobs).then(function (shards) {
      var out = new Uint8Array(cursor);
      shards.forEach(function (sh) {
        xorStream(new DataView(sh.bytes.buffer, sh.bytes.byteOffset, sh.bytes.byteLength), sh.seed);
        out.set(sh.bytes, sh.start);
      });
      return inflate(out.subarray(0, GZ_BYTES));
    }).then(parsePacked);
  }

  function parsePacked(bytes) {
    var dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    var magic = '';
    for (var i = 0; i < 8; i++) magic += String.fromCharCode(bytes[i]);
    if (magic !== 'CUALMDL1') throw new Error('bad magic');

    var min = [dv.getFloat32(8, true), dv.getFloat32(12, true), dv.getFloat32(16, true)];
    var scale = dv.getFloat32(20, true);
    var nParts = dv.getUint32(24, true);
    var nV = dv.getUint32(28, true);

    var p = 32;
    var parts = [];
    for (var k = 0; k < nParts; k++) {
      parts.push({
        vStart: dv.getUint32(p, true),
        vCount: dv.getUint32(p + 4, true),
        iStart: dv.getUint32(p + 8, true),
        iCount: dv.getUint32(p + 12, true),
        color: [dv.getUint8(p + 16) / 255, dv.getUint8(p + 17) / 255, dv.getUint8(p + 18) / 255]
      });
      p += 20;
    }
    var posBase = p;
    var idxBase = posBase + nV * 6;

    var out = [];
    for (var j = 0; j < nParts; j++) {
      var pt = parts[j];
      var pos = new Float32Array(pt.vCount * 3);
      var q = posBase + pt.vStart * 6;
      for (var v = 0; v < pt.vCount; v++) {
        pos[v * 3] = ((dv.getInt16(q + v * 6, true) + 32767.0) / 65534.0) * scale + min[0];
        pos[v * 3 + 1] = ((dv.getInt16(q + v * 6 + 2, true) + 32767.0) / 65534.0) * scale + min[1];
        pos[v * 3 + 2] = ((dv.getInt16(q + v * 6 + 4, true) + 32767.0) / 65534.0) * scale + min[2];
      }
      var idx = new Uint16Array(pt.iCount);
      var ib = idxBase + pt.iStart * 2;
      for (var t = 0; t < pt.iCount; t++) idx[t] = dv.getUint16(ib + t * 2, true);
      out.push({ pos: pos, idx: idx, color: pt.color });
    }

    /* 居中 + 求包围球，供自适应取景 */
    var lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    out.forEach(function (m) {
      for (var i = 0; i < m.pos.length; i += 3) {
        for (var a = 0; a < 3; a++) {
          if (m.pos[i + a] < lo[a]) lo[a] = m.pos[i + a];
          if (m.pos[i + a] > hi[a]) hi[a] = m.pos[i + a];
        }
      }
    });
    var c = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
    var R = 0;
    out.forEach(function (m) {
      for (var i = 0; i < m.pos.length; i += 3) {
        m.pos[i] -= c[0];
        m.pos[i + 1] -= c[1];
        m.pos[i + 2] -= c[2];
        var d = Math.hypot(m.pos[i], m.pos[i + 1], m.pos[i + 2]);
        if (d > R) R = d;
      }
    });
    return { parts: out, radius: R || 0.5 };
  }

  /* ---------------- 矩阵 ---------------- */
  function perspective(fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]);
  }

  function lookAt(eye, center, up) {
    var zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
    var zl = Math.hypot(zx, zy, zz) || 1;
    zx /= zl; zy /= zl; zz /= zl;
    var xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    var xl = Math.hypot(xx, xy, xz) || 1;
    xx /= xl; xy /= xl; xz /= xl;
    var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return new Float32Array([
      xx, yx, zx, 0,
      xy, yy, zy, 0,
      xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
      -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
      -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
      1
    ]);
  }

  /* ---------------- 渲染 ---------------- */
  var VS = [
    'attribute vec3 aPos;',
    'uniform mat4 uProj;',
    'uniform mat4 uView;',
    'varying vec3 vWorld;',
    'void main(){',
    '  vWorld = aPos;',
    '  gl_Position = uProj * uView * vec4(aPos, 1.0);',
    '}'
  ].join('\n');

  var FS = [
    '#extension GL_OES_standard_derivatives : enable',
    'precision highp float;',
    'uniform vec3 uColor;',
    'uniform vec3 uCam;',
    'varying vec3 vWorld;',
    'void main(){',
    '  vec3 N = normalize(cross(dFdx(vWorld), dFdy(vWorld)));',
    '  vec3 V = normalize(uCam - vWorld);',
    '  if (dot(N, V) < 0.0) N = -N;',
    '  vec3 L1 = normalize(vec3(0.42, 0.86, 0.38));',
    '  vec3 L2 = normalize(vec3(-0.65, 0.32, -0.55));',
    '  float d1 = max(dot(N, L1), 0.0);',
    '  float d2 = max(dot(N, L2), 0.0);',
    '  float hemi = 0.5 + 0.5 * N.y;',
    '  float amb = mix(0.20, 0.46, hemi);',
    '  vec3 col = uColor * (amb + d1 * 0.88);',
    '  col += uColor * d2 * vec3(0.42, 0.52, 0.72) * 0.30;',
    '  vec3 H = normalize(L1 + V);',
    '  float spec = pow(max(dot(N, H), 0.0), 58.0) * 0.55;',
    '  col += vec3(spec);',
    '  float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);',
    '  col += rim * vec3(1.0, 0.35, 0.12) * 0.50;',
    '  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);',
    '}'
  ].join('\n');

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || 'shader error');
    }
    return s;
  }

  function initGL(model) {
    var gl = canvas.getContext('webgl', {
      antialias: true, alpha: true, depth: true,
      premultipliedAlpha: false, powerPreference: 'high-performance'
    }) || canvas.getContext('experimental-webgl');
    if (!gl) throw new Error('no webgl');
    if (!gl.getExtension('OES_standard_derivatives')) throw new Error('no derivatives');

    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link error');
    gl.useProgram(prog);

    var locPos = gl.getAttribLocation(prog, 'aPos');
    var locProj = gl.getUniformLocation(prog, 'uProj');
    var locView = gl.getUniformLocation(prog, 'uView');
    var locColor = gl.getUniformLocation(prog, 'uColor');
    var locCam = gl.getUniformLocation(prog, 'uCam');

    var meshes = model.parts.map(function (pt) {
      var vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, pt.pos, gl.STATIC_DRAW);
      var ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pt.idx, gl.STATIC_DRAW);
      return { vbo: vbo, ibo: ibo, count: pt.idx.length, color: pt.color };
    });

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0, 0, 0, 0);

    /* 取景：按包围球自适应，画面占约 78% 高度 */
    var FOV = 34 * Math.PI / 180;
    var fit = model.radius / (Math.tan(FOV / 2) * 0.78);
    var YAW0 = -0.85, PITCH0 = 0.30;

    var state = {
      yaw: YAW0, pitch: PITCH0, dist: fit,
      minDist: fit * 0.42, maxDist: fit * 2.4,
      tyaw: YAW0, tpitch: PITCH0, tdist: fit,
      dragging: false, idleAt: 0
    };

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, window.__cualMobile ? 1.5 : 2);
      var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function draw() {
      resize();
      var cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
      var eye = [
        Math.sin(state.yaw) * cp * state.dist,
        sp * state.dist,
        Math.cos(state.yaw) * cp * state.dist
      ];
      var proj = perspective(FOV, canvas.width / Math.max(1, canvas.height), 0.02, 20);
      var view = lookAt(eye, [0, 0, 0], [0, 1, 0]);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniformMatrix4fv(locProj, false, proj);
      gl.uniformMatrix4fv(locView, false, view);
      gl.uniform3fv(locCam, eye);
      gl.enableVertexAttribArray(locPos);

      for (var i = 0; i < meshes.length; i++) {
        var m = meshes[i];
        gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo);
        gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ibo);
        gl.uniform3fv(locColor, m.color);
        gl.drawElements(gl.TRIANGLES, m.count, gl.UNSIGNED_SHORT, 0);
      }
    }

    var raf = 0, last = 0, running = false, visible = false;

    function tick(now) {
      if (!running) return;
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      var k = 1 - Math.pow(0.0016, dt);
      state.yaw += (state.tyaw - state.yaw) * k;
      state.pitch += (state.tpitch - state.pitch) * k;
      state.dist += (state.tdist - state.dist) * k;
      if (!state.dragging && !reduced && now - state.idleAt > 2600) {
        var idle = dt * 0.15;
        state.tyaw += idle;
        state.yaw += idle;
      }
      draw();
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running || !visible) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    /* ---- 交互 ---- */
    var pointers = new Map();
    var pinchStart = 0;
    var pinchDist = 0;

    canvas.addEventListener('pointerdown', function (e) {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      state.dragging = true;
      state.idleAt = performance.now() + 1e9;
      stage.classList.add('dragging');
      if (pointers.size === 2) {
        var a = Array.from(pointers.values());
        pinchStart = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        pinchDist = state.tdist;
      }
    });

    canvas.addEventListener('pointermove', function (e) {
      var p = pointers.get(e.pointerId);
      if (!p) return;
      var dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (pointers.size === 2) {
        var a = Array.from(pointers.values());
        var d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        if (pinchStart > 0) {
          state.tdist = Math.max(state.minDist, Math.min(state.maxDist, pinchDist * (pinchStart / d)));
        }
        return;
      }
      state.tyaw -= dx * 0.0062;
      state.tpitch = Math.max(-1.2, Math.min(1.2, state.tpitch + dy * 0.0055));
      state.idleAt = performance.now() + 1e9;
    });

    function endPointer(e) {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) {
        state.dragging = false;
        state.idleAt = performance.now();
        stage.classList.remove('dragging');
      }
      if (pointers.size < 2) pinchStart = 0;
    }
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('pointerleave', function (e) {
      if (!canvas.hasPointerCapture || !canvas.hasPointerCapture(e.pointerId)) endPointer(e);
    });

    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var f = Math.exp(Math.max(-120, Math.min(120, e.deltaY)) * 0.0013);
      state.tdist = Math.max(state.minDist, Math.min(state.maxDist, state.tdist * f));
      state.idleAt = performance.now() + 1e9;
    }, { passive: false });

    canvas.addEventListener('dblclick', function () {
      state.tyaw = YAW0;
      state.tpitch = PITCH0;
      state.tdist = fit;
      state.idleAt = performance.now();
    });

    canvas.addEventListener('keydown', function (e) {
      var step = 0.12;
      if (e.key === 'ArrowLeft') state.tyaw -= step;
      else if (e.key === 'ArrowRight') state.tyaw += step;
      else if (e.key === 'ArrowUp') state.tpitch = Math.max(-1.2, state.tpitch - step);
      else if (e.key === 'ArrowDown') state.tpitch = Math.min(1.2, state.tpitch + step);
      else if (e.key === '+' || e.key === '=') state.tdist = Math.max(state.minDist, state.tdist * 0.88);
      else if (e.key === '-' || e.key === '_') state.tdist = Math.min(state.maxDist, state.tdist / 0.88);
      else return;
      e.preventDefault();
      state.idleAt = performance.now() + 1e9;
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }, { rootMargin: '140px' }).observe(stage);
    } else {
      visible = true;
    }

    resize();
    draw();
    start();
    stage.classList.add('sim-live');
    if (hintEl) hintEl.textContent = 'DRAG / 拖动旋转 · 滚轮缩放 · 双击复位';
  }

  /* ---------------- 入口 ---------------- */
  function boot() {
    if (started) return;
    started = true;
    setStatus('DECODING');
    loadPacked().then(function (model) {
      initGL(model);
      var tri = 0;
      model.parts.forEach(function (p) { tri += p.idx.length / 3; });
      setStatus('LIVE · ' + model.parts.length + ' PARTS / ' + tri.toLocaleString('en-US') + ' TRI');
    }).catch(function (err) {
      fail(err && err.message ? err.message : err);
    });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        io.disconnect();
        boot();
      }
    }, { rootMargin: '300px' });
    io.observe(stage);
  } else {
    boot();
  }
})();
