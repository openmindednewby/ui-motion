import type { LogoTimeline } from '../types';
import { resolveDuration } from './resolveTiming';

const HOLD_BEFORE_MS = 300;
const HOLD_AFTER_MS = 500;
const STING_MS = 3600;
const MOVING_MS = STING_MS - HOLD_BEFORE_MS - HOLD_AFTER_MS;

/** The intro stretched into a sting: a hold, the same timeline slower, a hold on the still. */
export function stingCut(intro: LogoTimeline): LogoTimeline {
  const [lead] = intro;
  if (lead === undefined) return intro;
  const introEnd = Math.max(...intro.map((beat) => (beat.delay ?? 0) + resolveDuration(beat.duration)));
  const stretch = MOVING_MS / introEnd;
  const stretched = intro.map((beat) => ({
    ...beat,
    duration: Math.round(resolveDuration(beat.duration) * stretch),
    delay: HOLD_BEFORE_MS + Math.round((beat.delay ?? 0) * stretch),
  }));
  return [...stretched, { layer: lead.layer, keyframes: [{}, {}], duration: STING_MS }];
}
