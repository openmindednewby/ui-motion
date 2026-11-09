import type { MotionDurations, MotionEasings } from '@dloizides/design-tokens';

import type { LogoCut } from './LogoCut';

export type LogoDurationToken = keyof MotionDurations;

export type LogoEasingToken = keyof MotionEasings;

/** One beat: animate every `[data-motion-layer="<layer>"]` node through `keyframes`. */
export interface LogoBeat {
  layer: string;
  keyframes: Keyframe[];
  duration: LogoDurationToken | number;
  easing?: LogoEasingToken;
  delay?: number;
  required?: boolean;
}

export type LogoTimeline = readonly LogoBeat[];

export interface PlayLogoOptions {
  reducedMotion?: boolean;
  iterations?: number;
}

export interface LogoPlayback {
  finished: Promise<void>;
  cancel: () => void;
}

export type BindMicroOptions = Pick<PlayLogoOptions, 'reducedMotion'>;

export interface LogoPresetCuts {
  intro: LogoTimeline;
  micro: LogoTimeline;
}

export interface LogoPresetOptions {
  cut?: LogoCut | `${LogoCut}`;
}
