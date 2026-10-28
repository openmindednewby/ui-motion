import { DEFAULT_MOTION } from '@dloizides/design-tokens';

import type { LogoTimeline } from '../types';
import { playLogo } from './playLogo';
import { installFakeAnimate, makeSvg, removeFakeAnimate } from './testSvg';

const MARK = '<path data-motion-layer="stem"/><path data-motion-layer="flag"/>';

describe('playLogo', () => {
  afterEach(removeFakeAnimate);

  it('with two layered beats, animates each layer with token-resolved timing', () => {
    const { animate } = installFakeAnimate();
    const stem = [{ opacity: 0 }, { opacity: 1 }];
    const flag = [{ transform: 'translateX(-8px)' }, { transform: 'translateX(0px)' }];
    const timeline: LogoTimeline = [
      { layer: 'stem', keyframes: stem, duration: 'slow', easing: 'decelerate', delay: 40 },
      { layer: 'flag', keyframes: flag, duration: 120 },
    ];

    playLogo(makeSvg(MARK), timeline, { reducedMotion: false });

    expect(animate.mock.calls).toEqual([
      [stem, { duration: DEFAULT_MOTION.durations.slow, easing: DEFAULT_MOTION.easings.decelerate.css, delay: 40, fill: 'both', iterations: 1 }],
      [flag, { duration: 120, easing: DEFAULT_MOTION.easings.standard.css, delay: 0, fill: 'both', iterations: 1 }],
    ]);
  });

  it('with a layer the mark does not have, skips that beat', () => {
    const { animate } = installFakeAnimate();
    const timeline: LogoTimeline = [
      { layer: 'stem', keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: 'base' },
      { layer: 'missing', keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: 'base' },
    ];

    playLogo(makeSvg(MARK), timeline, { reducedMotion: false });

    expect(animate).toHaveBeenCalledTimes(1);
  });

  it('with every animation finished, resolves finished', async () => {
    const { animations } = installFakeAnimate();
    const timeline: LogoTimeline = [{ layer: 'stem', keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: 'base' }];
    const playback = playLogo(makeSvg(MARK), timeline, { reducedMotion: false });

    animations.forEach((animation) => animation.finish());

    await expect(playback.finished).resolves.toBeUndefined();
  });

  it('with cancel called, cancels every animation and still resolves finished', async () => {
    const { animations } = installFakeAnimate();
    const timeline: LogoTimeline = [
      { layer: 'stem', keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: 'base' },
      { layer: 'flag', keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: 'base' },
    ];
    const playback = playLogo(makeSvg(MARK), timeline, { reducedMotion: false });

    playback.cancel();

    expect(animations.map((animation) => animation.cancel.mock.calls.length)).toEqual([1, 1]);
    await expect(playback.finished).resolves.toBeUndefined();
  });

  it('with reduced motion, applies the final frame without animating', async () => {
    const { animate } = installFakeAnimate();
    const svg = makeSvg(MARK);
    const timeline: LogoTimeline = [
      { layer: 'stem', keyframes: [{ opacity: 0 }, { opacity: 1, offset: 1 }], duration: 'slow' },
      { layer: 'flag', keyframes: [{ transform: 'translateX(-8px)' }, { transform: 'translateX(0px)' }], duration: 120 },
    ];

    const playback = playLogo(svg, timeline, { reducedMotion: true });

    expect(animate).not.toHaveBeenCalled();
    expect((svg.querySelector('[data-motion-layer="stem"]') as SVGElement).style.opacity).toBe('1');
    expect((svg.querySelector('[data-motion-layer="flag"]') as SVGElement).style.transform).toBe('translateX(0px)');
    await expect(playback.finished).resolves.toBeUndefined();
  });

  it('with no reducedMotion option and the OS preference set, applies the final frame', () => {
    const { animate } = installFakeAnimate();
    window.matchMedia = jest.fn(() => ({ matches: true })) as unknown as typeof window.matchMedia;
    const timeline: LogoTimeline = [{ layer: 'stem', keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: 'base' }];

    playLogo(makeSvg(MARK), timeline);

    expect(animate).not.toHaveBeenCalled();
  });

  it('with no Web Animations support, applies the final frame', () => {
    const svg = makeSvg(MARK);
    const timeline: LogoTimeline = [{ layer: 'stem', keyframes: [{ opacity: 0 }, { opacity: 0.8 }], duration: 'base' }];

    playLogo(svg, timeline, { reducedMotion: false });

    expect((svg.querySelector('[data-motion-layer="stem"]') as SVGElement).style.opacity).toBe('0.8');
  });
});
