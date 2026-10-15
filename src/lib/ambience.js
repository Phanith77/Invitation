// Generative "lotus pond" ambience, synthesised live with Web Audio (no audio file, no
// copyright): soft water, a warm drone and slow pentatonic bell tones. Used when no mp3
// is set in wedding.music.
const SCALE = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25, 739.99]; // D major pentatonic, two octaves

let ctx = null, master = null, timer = 0, nodes = [];

function noiseBuffer(ac, seconds = 4) {
  const buf = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; } // brown noise
  return buf;
}
function reverb(ac, seconds = 3.2) {
  const len = ac.sampleRate * seconds, buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  const conv = ac.createConvolver();
  conv.buffer = buf;
  return conv;
}

function bell(ac, out, freq, when, gain = 0.09) {
  // a soft struck bell: fundamental + slightly inharmonic partials, long decay
  [[1, 1], [2.76, 0.35], [5.4, 0.12]].forEach(([mult, g]) => {
    const o = ac.createOscillator(), e = ac.createGain();
    o.type = 'sine';
    o.frequency.value = freq * mult;
    e.gain.setValueAtTime(0, when);
    e.gain.linearRampToValueAtTime(gain * g, when + 0.015);
    e.gain.exponentialRampToValueAtTime(0.0001, when + 4.5 / mult + 0.6);
    o.connect(e).connect(out);
    o.start(when);
    o.stop(when + 6);
  });
}

export function startAmbience() {
  if (ctx) { ctx.resume(); fadeTo(1); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  const verb = reverb(ctx), wet = ctx.createGain();
  wet.gain.value = 0.55;
  verb.connect(wet).connect(master);

  // water: brown noise through a slowly moving low-pass
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 0.7;
  const wg = ctx.createGain(); wg.gain.value = 0.16;
  const lfo = ctx.createOscillator(), lfoG = ctx.createGain();
  lfo.frequency.value = 0.07; lfoG.gain.value = 180;
  lfo.connect(lfoG).connect(lp.frequency);
  src.connect(lp).connect(wg).connect(master);
  src.start(); lfo.start();

  // warm drone on D and A
  [73.42, 110, 146.83].forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = i === 2 ? 'triangle' : 'sine';
    o.frequency.value = f; o.detune.value = (i - 1) * 4;
    g.gain.value = i === 2 ? 0.012 : 0.03;
    o.connect(g).connect(master);
    o.connect(g).connect(verb);
    o.start();
    nodes.push(o);
  });
  nodes.push(src, lfo);

  // bells: a short phrase every few seconds
  const schedule = () => {
    const now = ctx.currentTime;
    let t = now + 0.1, idx = Math.floor(Math.random() * SCALE.length);
    const notes = 1 + Math.floor(Math.random() * 3);
    for (let n = 0; n < notes; n++) {
      idx = Math.max(0, Math.min(SCALE.length - 1, idx + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2))));
      bell(ctx, verb, SCALE[idx], t, 0.07 + Math.random() * 0.04);
      t += 0.45 + Math.random() * 0.5;
    }
    timer = setTimeout(schedule, 3200 + Math.random() * 3800);
  };
  schedule();
  fadeTo(1);
}

function fadeTo(v, seconds = 2.5) {
  if (!master) return;
  const g = master.gain, now = ctx.currentTime;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(v * 0.8, now + seconds);
}

export function stopAmbience() {
  if (!ctx) return;
  fadeTo(0, 0.8);
  setTimeout(() => ctx && ctx.suspend(), 900);
}
export const ambienceRunning = () => !!ctx && ctx.state === 'running';
