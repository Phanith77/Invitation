// SAMPLE pre-wedding film (~48 s): a cinematic walk through the illustrations — the title card,
// the rituals, the couple and their portraits — with a different slow camera move on each shot
// (zoom in, zoom out, pan left, pan right) and soft crossfades. It stands in until the couple's
// real video replaces it (public/video/prewedding.mp4, or wedding.video.youtube).
// Usage: node scripts/video.mjs → public/video/prewedding.mp4 + prewedding.jpg
import { spawnSync } from 'node:child_process';
import { mkdirSync, statSync, writeFileSync, rmSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';

// [image, camera move]
const SHOTS = [
  ['public/og.jpg', 'in'],
  ['photos/art-01-cover.jpg', 'right'],
  ['photos/art-06-sunrise.jpg', 'left'],
  ['photos/rite-gifts.jpg', 'in'],
  ['photos/rite-lotus.jpg', 'out'],
  ['photos/rite-scissors.jpg', 'right'],
  ['photos/art-02-couple.jpg', 'in'],
  ['photos/rite-rings.jpg', 'left'],
  ['photos/rite-thread.jpg', 'in'],
  ['photos/art-07-trays.jpg', 'out'],
  ['photos/art-03-groom.jpg', 'in'],
  ['photos/art-04-bride.jpg', 'in'],
  ['photos/art-08-garden.jpg', 'right'],
  ['photos/rite-feast.jpg', 'left'],
  ['photos/art-05-lanterns.jpg', 'out'],
  ['public/og.jpg', 'out'],
];
const SEC = 4, FADE = 1, FPS = 30, W = 1280, H = 720;
const D = Math.round(SEC * FPS);
mkdirSync('public/video', { recursive: true });

// zoompan expressions for each camera move (on = frame number within the shot)
const MOVES = {
  in: { z: `'1+0.12*on/${D}'`, x: `'iw/2-(iw/zoom/2)'`, y: `'ih/2-(ih/zoom/2)'` },
  out: { z: `'1.12-0.12*on/${D}'`, x: `'iw/2-(iw/zoom/2)'`, y: `'ih/2-(ih/zoom/2)'` },
  right: { z: `'1.14'`, x: `'(iw-iw/zoom)*on/${D}'`, y: `'ih/2-(ih/zoom/2)'` },
  left: { z: `'1.14'`, x: `'(iw-iw/zoom)*(1-on/${D})'`, y: `'ih/2-(ih/zoom/2)'` },
};

// ── original soundtrack: slow pentatonic bells over a soft drone (synthesised here, so no rights issues) ──
function soundtrack(seconds, file) {
  const R = 44100, n = Math.ceil(seconds * R), out = new Float32Array(n);
  const hz = (m) => 440 * 2 ** ((m - 69) / 12);
  // C major pentatonic phrases over C, A minor, F, G; one bell every 0.75 s
  const CHORDS = [[48, [60, 64, 67, 72, 69, 67, 64, 62]], [45, [57, 60, 64, 69, 67, 64, 60, 62]], [41, [53, 57, 60, 65, 64, 60, 57, 60]], [43, [55, 59, 62, 67, 69, 67, 62, 64]]];
  const STEP = 0.75, BAR = STEP * 8;
  for (let b = 0; b * BAR < seconds; b++) {
    const [root, notes] = CHORDS[b % 4];
    // drone: root + fifth, swelling over the bar
    const s0 = Math.floor(b * BAR * R), len = Math.min(Math.floor(BAR * R * 1.4), n - s0);
    for (let i = 0; i < len; i++) {
      const t = i / R, env = Math.sin(Math.PI * Math.min(1, t / (BAR * 1.4))) * 0.07;
      out[s0 + i] += env * (Math.sin(2 * Math.PI * hz(root) * t) + 0.6 * Math.sin(2 * Math.PI * hz(root + 7) * t) + 0.3 * Math.sin(2 * Math.PI * hz(root + 12) * t * 1.002));
    }
    notes.forEach((m, k) => {
      const st = Math.floor((b * BAR + k * STEP) * R), f = hz(m + (b % 8 >= 4 && k % 2 ? 12 : 0));
      for (let i = 0; i < R * 2.6 && st + i < n; i++) {
        const t = i / R, env = Math.min(1, t / 0.006) * Math.exp(-t * 2.1) * 0.16;
        out[st + i] += env * (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * 3) + 0.12 * Math.sin(2 * Math.PI * f * 3 * t) * Math.exp(-t * 5));
      }
    });
  }
  // fade in/out, soft limit, 16-bit mono WAV
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(R, 24); buf.writeUInt32LE(R * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const t = i / R, fade = Math.max(0, Math.min(1, t / 2, (seconds - t) / 3));
    buf.writeInt16LE(Math.round(Math.tanh(out[i] * 1.4) * fade * 0.85 * 32767), 44 + i * 2);
  }
  writeFileSync(file, buf);
}

const args = ['-y'];
// one frame per picture: zoompan turns it into exactly D frames (looping the input would multiply that)
SHOTS.forEach(([file]) => args.push('-i', file));
const parts = SHOTS.map(([, move], i) => {
  const m = MOVES[move];
  return `[${i}:v]scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2},zoompan=z=${m.z}:x=${m.x}:y=${m.y}:d=${D}:s=${W}x${H}:fps=${FPS},setsar=1[v${i}]`;
});
let last = 'v0', offset = SEC - FADE;
for (let i = 1; i < SHOTS.length; i++) {
  parts.push(`[${last}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${offset.toFixed(2)}[x${i}]`);
  last = `x${i}`;
  offset += SEC - FADE;
}
const total = offset + FADE;
const WAV = 'public/video/_soundtrack.wav';
soundtrack(total, WAV);
args.push('-i', WAV);
parts.push(`[${last}]fade=t=in:st=0:d=1.2,fade=t=out:st=${(total - 1.5).toFixed(2)}:d=1.5,format=yuv420p[out]`);
args.push('-filter_complex', parts.join(';'), '-map', '[out]', '-map', `${SHOTS.length}:a`, '-t', total.toFixed(2), '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', 'public/video/prewedding.mp4');

const r = spawnSync(ffmpeg, args, { stdio: ['ignore', 'ignore', 'pipe'] });
rmSync(WAV, { force: true });
if (r.status !== 0) { console.error(r.stderr.toString().split('\n').slice(-8).join('\n')); process.exit(1); }
spawnSync(ffmpeg, ['-y', '-ss', '6', '-i', 'public/video/prewedding.mp4', '-frames:v', '1', '-q:v', '4', 'public/video/prewedding.jpg']);
console.log(`public/video/prewedding.mp4 (${total.toFixed(0)} s, ${(statSync('public/video/prewedding.mp4').size / 1048576).toFixed(1)} MB) + poster`);
