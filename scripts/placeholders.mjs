// Writes abstract placeholder "photos" into /photos so the layout can be judged
// before the real pre-wedding photos arrive. Delete these once you add yours.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
mkdirSync('photos', { recursive: true });

const list = [
  ['placeholder-01-cover', 2000, 1333, '#3b3a26', '#c9a35a'],
  ['placeholder-02', 1333, 2000, '#2c2a1c', '#d8b679'],
  ['placeholder-03', 2000, 1333, '#4a3b2a', '#e2c08a'],
  ['placeholder-04', 1333, 2000, '#22261c', '#b99350'],
  ['placeholder-05', 1600, 1600, '#3a2f22', '#f0d39b'],
  ['placeholder-06', 1333, 2000, '#2f3324', '#caa66a'],
];
for (const [name, w, h, dark, warm] of list) {
  let seed = name.length * 97;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let bokeh = '';
  for (let i = 0; i < 26; i++) {
    const cx = r() * w, cy = r() * h * 0.7, rad = 20 + r() * Math.min(w, h) * 0.07;
    bokeh += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${warm}" opacity="${0.08 + r() * 0.22}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><radialGradient id="g" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="${warm}" stop-opacity=".55"/><stop offset="1" stop-color="${dark}"/></radialGradient>
    <filter id="b"><feGaussianBlur stdDeviation="${Math.min(w, h) * 0.012}"/></filter></defs>
    <rect width="100%" height="100%" fill="${dark}"/><rect width="100%" height="100%" fill="url(#g)"/>
    <g filter="url(#b)">${bokeh}</g>
    <ellipse cx="${w * 0.44}" cy="${h * 0.95}" rx="${w * 0.12}" ry="${h * 0.42}" fill="#120f0a" opacity=".55"/>
    <ellipse cx="${w * 0.58}" cy="${h * 0.97}" rx="${w * 0.11}" ry="${h * 0.38}" fill="#120f0a" opacity=".5"/>
    <text x="50%" y="${h * 0.12}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.min(w, h) * 0.035}" fill="#fff" opacity=".45" letter-spacing="4">PLACEHOLDER PHOTO</text>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 86 }).toFile(`photos/${name}.jpg`);
}
console.log('placeholder photos written to /photos');
