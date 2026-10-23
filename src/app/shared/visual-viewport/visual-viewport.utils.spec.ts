import { computeKeyboardOffset } from './visual-viewport.utils';

describe('computeKeyboardOffset', () => {
  it('measures the gap under the visual viewport', () => {
    expect(computeKeyboardOffset(800, { height: 500, offsetTop: 0 })).toBe(300);
    expect(computeKeyboardOffset(800, { height: 800, offsetTop: 10 })).toBe(0);
  });

  it('counts a first-open pan, where offsetTop swallows the gap, as keyboard inset', () => {
    expect(computeKeyboardOffset(800, { height: 480, offsetTop: 320 })).toBe(320);
  });
});
