import { focusLiftTarget } from './useFocusLift';

describe('focusLiftTarget', () => {
  it('lifts and scales a focused tile by the defaults', () => {
    expect(focusLiftTarget(true, false, {})).toEqual({ scale: 1.06, translateY: -8 });
  });

  it('rests an unfocused tile', () => {
    expect(focusLiftTarget(false, false, {})).toEqual({ scale: 1, translateY: 0 });
  });

  it('does not move a focused tile under reduced motion', () => {
    expect(focusLiftTarget(true, true, {})).toEqual({ scale: 1, translateY: 0 });
  });

  it('honours custom scale and lift', () => {
    expect(focusLiftTarget(true, false, { scale: 1.1, lift: 12 })).toEqual({ scale: 1.1, translateY: -12 });
  });
});
