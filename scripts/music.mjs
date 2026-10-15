// Adds background music to the invitation from an audio or video file you have the right to use.
// Converts it to a light, phone-friendly mp3 (stereo 128 kbps, loudness-levelled, short fade in)
// in public/music/, then points `music` in src/data/wedding.js at it.
//
// Usage:  npm run music -- "C:\path\to\song.mp4"            (mp4, mp3, m4a, wav, …)
//         npm run music -- "song.mp3" --out somewhere/ --no-set   (convert only; for testing)
//
// Only use music you own or have permission to use: the invitation is shared publicly.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import ffmpeg from 'ffmpeg-static';

const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--out');
const outDir = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'public/music';
const setData = !args.includes('--no-set');
if (!src || !existsSync(src)) {
  console.error('Give the path of an audio or video file, e.g. npm run music -- "C:\\Users\\me\\song.mp3"');
  process.exit(1);
}

const slug = basename(src, extname(src)).normalize('NFKD').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'song';
mkdirSync(outDir, { recursive: true });
const out = join(outDir, `${slug}.mp3`);

const r = spawnSync(ffmpeg, [
  '-y', '-i', src,
  '-vn', // drop any video
  '-af', 'loudnorm=I=-18:TP=-1.5:LRA=11,afade=t=in:st=0:d=2',
  '-ac', '2', '-ar', '44100', '-b:a', '128k',
  '-map_metadata', '-1', // strip tags
  out,
], { stdio: ['ignore', 'ignore', 'pipe'] });
if (r.status !== 0) {
  console.error(r.stderr.toString().split('\n').slice(-6).join('\n'));
  process.exit(1);
}
const mb = (statSync(out).size / 1048576).toFixed(1);
console.log(`✓ ${out} (${mb} MB)`);

if (setData) {
  const p = 'src/data/wedding.js';
  const s = readFileSync(p, 'utf8');
  const next = s.replace(/^(\s*)music: [^\n]*$/m, `$1music: '/music/${slug}.mp3', // set by npm run music`);
  if (next === s) { console.error('Could not find the `music:` line in src/data/wedding.js'); process.exit(1); }
  writeFileSync(p, next);
  console.log(`✓ src/data/wedding.js → music: '/music/${slug}.mp3'`);
}
