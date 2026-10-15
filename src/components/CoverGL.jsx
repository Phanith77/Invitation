// Desktop-only WebGL layer over the cover photo: a slow water shimmer in the lower part
// and a soft candle-flicker warmth. Sizes to its parent via ResizeObserver (never from
// inside the render loop), and only renders while visible.
import { useEffect, useRef } from 'react';

const VERT = `attribute vec2 p; varying vec2 v; void main(){ v = p*.5+.5; gl_Position = vec4(p,0.,1.); }`;
const FRAG = `precision mediump float;
varying vec2 v; uniform sampler2D img; uniform float t; uniform vec2 scale; uniform vec2 offs;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
void main(){
  vec2 uv = vec2(v.x, 1.0 - v.y) * scale + offs;
  float water = smoothstep(.55, .95, 1.0 - v.y); // lower part of the photo only
  float w = sin(uv.y * 120.0 - t * 1.6) * .0016 + sin(uv.x * 40.0 + uv.y * 60.0 + t * 1.1) * .0012;
  uv.x += w * water * 1.6; uv.y += w * water * .6;
  vec3 c = texture2D(img, uv).rgb;
  float flick = .965 + .035 * sin(t * 7.0 + sin(t * 2.3) * 2.0) * sin(t * 3.1);
  float glow = smoothstep(.95, .1, distance(v, vec2(.5, .15)));
  c *= flick;
  c += vec3(.09, .05, .015) * glow * (flick - .9) * 4.0;
  c += (h(v * 800.0 + t) - .5) * .015;
  gl_FragColor = vec4(c, 1.0);
}`;

export default function CoverGL({ src, active }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;
    const sh = (type, s) => { const o = gl.createShader(type); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uT = gl.getUniformLocation(prog, 't'), uS = gl.getUniformLocation(prog, 'scale'), uO = gl.getUniformLocation(prog, 'offs');

    let imgW = 1, imgH = 1, ready = false, visible = true, raf = 0, dead = false;
    const fit = () => {
      // object-fit: cover in texture space
      const ca = canvas.width / canvas.height, ia = imgW / imgH;
      const sx = ca < ia ? ca / ia : 1, sy = ca < ia ? 1 : ia / ca;
      gl.uniform2f(uS, sx, sy);
      gl.uniform2f(uO, (1 - sx) / 2, (1 - sy) / 2);
    };
    const img = new Image();
    img.onload = () => {
      if (dead) return;
      imgW = img.naturalWidth; imgH = img.naturalHeight;
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      fit();
      ready = true;
      canvas.classList.add('on');
    };
    img.src = src;

    const parent = canvas.parentElement;
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.round(parent.clientWidth * dpr), h = Math.round(parent.clientHeight * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      if (ready) fit();
    });
    ro.observe(parent);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(parent);

    const t0 = performance.now();
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (!ready || !visible || document.hidden) return;
      gl.uniform1f(uT, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [active, src]);
  return <canvas ref={ref} className="cover-gl" aria-hidden="true" />;
}
