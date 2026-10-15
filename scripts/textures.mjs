// Generates colour-neutral, tileable paper overlays (fine grain + faint fibres).
// They are laid over any paper colour, so changing the palette never needs a re-run.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const S = 256;
mkdirSync('public/textures', { recursive: true });

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function make(name, { seed, grain, coarse, fibres, fibreAlpha, strength }) {
  const r = rng(seed);
  const buf = new Float32Array(S * S);
  const gauss = () => (r() + r() + r() - 1.5) / 1.5;
  // fine grain, per pixel (tiles by construction)
  for (let i = 0; i < buf.length; i++) buf[i] += gauss() * grain;
  // slightly coarser tooth at 2px, wrapped
  const C = S / 2, c = new Float32Array(C * C);
  for (let i = 0; i < c.length; i++) c[i] = gauss() * coarse;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) buf[y * S + x] += c[((y >> 1) % C) * C + ((x >> 1) % C)];
  // fibres: short gently curved strands, coordinates wrapped so edges tile
  for (let f = 0; f < fibres; f++) {
    let x = r() * S, y = r() * S, a = r() * Math.PI * 2;
    const len = 18 + r() * 70, sign = r() < 0.55 ? 1 : -1, amp = fibreAlpha * (0.4 + r() * 0.6);
    for (let s = 0; s < len; s++) {
      a += (r() - 0.5) * 0.18;
      x += Math.cos(a) * 0.8; y += Math.sin(a) * 0.8;
      const fade = Math.sin((s / len) * Math.PI);
      const xi = ((Math.round(x) % S) + S) % S, yi = ((Math.round(y) % S) + S) % S;
      buf[yi * S + xi] += sign * amp * fade;
    }
  }
  const out = Buffer.alloc(S * S * 4);
  for (let i = 0; i < buf.length; i++) {
    const v = Math.max(-1, Math.min(1, buf[i]));
    const light = v > 0 ? 255 : 0;
    out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = light;
    out[i * 4 + 3] = Math.round(Math.abs(v) * strength * 255);
  }
  return sharp(out, { raw: { width: S, height: S, channels: 4 } })
    .webp({ quality: 70, alphaQuality: 60 })
    .toFile(`public/textures/${name}.webp`);
}

// silk: fine diagonal twill (period divides the tile, so it stays seamless) + soft grain
async function silk(name, { seed, strength }) {
  const r = rng(seed);
  const out = Buffer.alloc(S * S * 4);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const twill = Math.sin(((x + y) / 4) * Math.PI * 2) * 0.55 + Math.sin(((x - 2 * y) / 8) * Math.PI * 2) * 0.2;
    const v = Math.max(-1, Math.min(1, twill + (r() - 0.5) * 0.7));
    const i = (y * S + x) * 4;
    out[i] = out[i + 1] = out[i + 2] = v > 0 ? 255 : 0;
    out[i + 3] = Math.round(Math.abs(v) * strength * 255);
  }
  return sharp(out, { raw: { width: S, height: S, channels: 4 } }).webp({ quality: 72, alphaQuality: 60 }).toFile(`public/textures/${name}.webp`);
}
await silk('silk', { seed: 5, strength: 0.07 });
await make('paper-envelope', { seed: 11, grain: 0.35, coarse: 0.25, fibres: 200, fibreAlpha: 0.32, strength: 0.09 });
await make('paper-card', { seed: 23, grain: 0.3, coarse: 0.2, fibres: 140, fibreAlpha: 0.3, strength: 0.07 });
await make('paper-lining', { seed: 37, grain: 0.32, coarse: 0.3, fibres: 260, fibreAlpha: 0.38, strength: 0.08 });
console.log('textures written to public/textures');
