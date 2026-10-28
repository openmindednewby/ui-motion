import { MicroTrigger } from '../MicroTrigger';
import type { LogoTimeline } from '../types';
import { bindMicro } from './bindMicro';
import { installFakeAnimate, makeSvg, removeFakeAnimate } from './testSvg';

const MARK = '<path data-motion-layer="flag"/>';

describe('bindMicro', () => {
  afterEach(removeFakeAnimate);

  it('with hover and the pointer entering, plays the micro once', () => {
    const { animate } = installFakeAnimate();
    const pulse: LogoTimeline = [{ layer: 'flag', keyframes: [{ opacity: 1 }, { opacity: 0.6 }], duration: 'slow' }];
    const svg = makeSvg(MARK);
    bindMicro(svg, pulse, MicroTrigger.Hover, { reducedMotion: false });

    svg.dispatchEvent(new Event('pointerenter'));

    expect(animate).toHaveBeenCalledWith(pulse[0]?.keyframes, expect.objectContaining({ iterations: 1 }));
  });

  it('with hover and the pointer leaving, cancels the running micro', () => {
    const { animations } = installFakeAnimate();
    const pulse: LogoTimeline = [{ layer: 'flag', keyframes: [{ opacity: 1 }, { opacity: 0.6 }], duration: 'slow' }];
    const svg = makeSvg(MARK);
    bindMicro(svg, pulse, 'hover', { reducedMotion: false });
    svg.dispatchEvent(new Event('pointerenter'));

    svg.dispatchEvent(new Event('pointerleave'));

    expect(animations[0]?.cancel).toHaveBeenCalledTimes(1);
  });

  it('with focus and focus arriving inside the mark, plays the micro', () => {
    const { animate } = installFakeAnimate();
    const pulse: LogoTimeline = [{ layer: 'flag', keyframes: [{ opacity: 1 }, { opacity: 0.6 }], duration: 'slow' }];
    const svg = makeSvg(MARK);
    bindMicro(svg, pulse, 'focus', { reducedMotion: false });

    svg.dispatchEvent(new Event('focusin'));

    expect(animate).toHaveBeenCalledTimes(1);
  });

  it('with loading, loops the micro at once until unbound', () => {
    const { animate, animations } = installFakeAnimate();
    const pulse: LogoTimeline = [{ layer: 'flag', keyframes: [{ opacity: 1 }, { opacity: 0.6 }], duration: 'slow' }];

    const unbind = bindMicro(makeSvg(MARK), pulse, 'loading', { reducedMotion: false });
    unbind();

    expect(animate).toHaveBeenCalledWith(pulse[0]?.keyframes, expect.objectContaining({ iterations: Infinity }));
    expect(animations[0]?.cancel).toHaveBeenCalledTimes(1);
  });

  it('with the binding removed, ignores later pointer events', () => {
    const { animate } = installFakeAnimate();
    const pulse: LogoTimeline = [{ layer: 'flag', keyframes: [{ opacity: 1 }, { opacity: 0.6 }], duration: 'slow' }];
    const svg = makeSvg(MARK);
    const unbind = bindMicro(svg, pulse, 'hover', { reducedMotion: false });
    unbind();

    svg.dispatchEvent(new Event('pointerenter'));

    expect(animate).not.toHaveBeenCalled();
  });

  it('with reduced motion, never animates', () => {
    const { animate } = installFakeAnimate();
    const pulse: LogoTimeline = [{ layer: 'flag', keyframes: [{ opacity: 1 }, { opacity: 0.6 }], duration: 'slow' }];
    const svg = makeSvg(MARK);
    bindMicro(svg, pulse, 'hover', { reducedMotion: true });

    svg.dispatchEvent(new Event('pointerenter'));

    expect(animate).not.toHaveBeenCalled();
  });
});
