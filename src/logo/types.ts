import type { MotionDurations, MotionEasings } from '@dloizides/design-tokens';

export type LogoDurationToken = keyof MotionDurations;

export type LogoEasingToken = keyof MotionEasings;

/** One beat: animate every `[data-motion-layer="<layer>"]` node through `keyframes`. */
export interface LogoBeat {
  layer: string;
  keyframes: Keyframe[];
  duration: LogoDurationToken | number;
  easing?: LogoEasingToken;
  delay?: number;
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
