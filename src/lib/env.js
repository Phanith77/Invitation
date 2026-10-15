import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin, CustomEase);
// a slow, "by hand" ease: hesitant start, long soft landing
CustomEase.create('hand', 'M0,0 C0.25,0.02 0.32,0.36 0.5,0.62 0.66,0.86 0.8,1 1,1');
CustomEase.create('silk', 'M0,0 C0.16,0.5 0.3,1 1,1');

const params = new URLSearchParams(location.search);
const mq = (q) => typeof matchMedia !== 'undefined' && matchMedia(q).matches;

export const reducedMotion = mq('(prefers-reduced-motion: reduce)');
export const isPhone = mq('(pointer: coarse)') && Math.min(screen.width, screen.height) < 820;
const conn = navigator.connection || {};
export const weakDevice =
  params.has('lite') ||
  (navigator.hardwareConcurrency || 8) <= 4 ||
  (navigator.deviceMemory || 8) <= 2 ||
  conn.saveData === true;
/** lighter version: no tilt, no shimmer, no WebGL, simpler reveals */
export const lite = reducedMotion || weakDevice;
export const skipEnvelope = params.has('open');
export const allowWebGL = !isPhone && !lite && !params.has('nogl');

export { gsap, ScrollTrigger };
