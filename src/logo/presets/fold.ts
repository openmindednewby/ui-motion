import { LogoLayer } from '../LogoLayer';
import type { LogoBeat, LogoPresetCuts } from '../types';
import { PART_LAYERS, pulseBeat } from './shared';

const FOLD_START_MS = 80;
const FOLD_MS = 1120;
const LOCK_START_MS = 840;
const LOCK_START_OFFSET = (LOCK_START_MS - FOLD_START_MS) / FOLD_MS;
const PART_VISIBLE_OFFSET = 0.15;
const NET_POSES = ['rotate(-120deg) scale(1, 0.2)', 'rotate(120deg) scale(1, 0.2)', 'rotate(0deg) scale(1, 0.2)'];

const WAX_START_MS = 640;
const WAX_MS = 480;

const MICRO_MS = 180;
const MICRO_STAGGER_MS = 40;

const foldPart = (layer: LogoLayer, index: number): LogoBeat => ({
  layer,
  keyframes: [
    { transform: NET_POSES[index] ?? '', opacity: 0, offset: 0 },
    { opacity: 1, offset: PART_VISIBLE_OFFSET },
    { transform: 'rotate(0deg) scale(1.08, 1.08)', offset: LOCK_START_OFFSET },
    { transform: 'rotate(0deg) scale(1, 1)', offset: 1 },
  ],
  duration: FOLD_MS,
  delay: FOLD_START_MS,
  required: true,
});

const wax: LogoBeat = {
  layer: LogoLayer.Emblem,
  keyframes: [{ clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)' }],
  duration: WAX_MS,
  easing: 'decelerate',
  delay: WAX_START_MS,
};

const press = (layer: LogoLayer, index: number): LogoBeat =>
  pulseBeat(layer, { transform: 'scale(0.94)' }, { duration: MICRO_MS, delay: index * MICRO_STAGGER_MS, required: true });

/** The parts fold in from a flat net and lock while the emblem is revealed to meet them. */
export const fold: LogoPresetCuts = {
  intro: [...PART_LAYERS.map(foldPart), wax],
  micro: PART_LAYERS.map(press),
};
