// App icons for "Add to Home Screen": the rumdul mark on evening green.
// Usage: node scripts/icons.mjs → public/icons/*
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { rumdulMark } from '../src/art/rumdulMark.js';
mkdirSync('public/icons', { recursive: true });

const svg = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs><radialGradient id="bg" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#fbe7d6"/><stop offset="1" stop-color="#f1cfb4"/></radialGradient></defs>
  <rect width="200" height="200" fill="url(#bg)"/>
  <g transform="translate(100 100) scale(${1 - pad}) translate(-100 -100)">${rumdulMark({ prefix: 'icon' })}</g>
</svg>`;
for (const [name, size, pad] of [['icon-192.png', 192, 0.04], ['icon-512.png', 512, 0.04], ['maskable-512.png', 512, 0.24], ['apple-touch-icon.png', 180, 0.08]]) {
  await sharp(Buffer.from(svg(pad))).resize(size, size).png().toFile(`public/icons/${name}`);
}
console.log('public/icons written');
