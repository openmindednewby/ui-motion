import { LogoLayer } from '../LogoLayer';
import type { LogoBeat, LogoPresetCuts } from '../types';
import { PART_LAYERS, pulseBeat } from './shared';

const ORBIT_MS = 1000;
const PART_MS = 1200;
const PART_VISIBLE_OFFSET = 0.2;
const LOCK_START_MS = 880;
const LOCK_START_OFFSET = LOCK_START_MS / PART_MS;
const MICRO_MS = 300;
const COUNTER_TURN_START_POSE = 'rotate(-360deg) scale(0.7)';
const MICRO_TILT_POSE = 'rotate(-12deg)';

const orbit: LogoBeat = {
  layer: LogoLayer.Emblem,
  keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
  duration: ORBIT_MS,
  required: true,
};

const counterTurn = (layer: LogoLayer): LogoBeat => ({
  layer,
  keyframes: [
    { transform: COUNTER_TURN_START_POSE, opacity: 0, offset: 0 },
    { opacity: 1, offset: PART_VISIBLE_OFFSET },
    { transform: 'rotate(0deg) scale(0.7)', offset: LOCK_START_OFFSET },
    { transform: 'rotate(0deg) scale(1)', offset: 1 },
  ],
  duration: PART_MS,
});

export const orbitLock: LogoPresetCuts = {
  intro: [orbit, ...PART_LAYERS.map(counterTurn)],
  micro: [pulseBeat(LogoLayer.Emblem, { transform: MICRO_TILT_POSE }, { duration: MICRO_MS, required: true })],
};
