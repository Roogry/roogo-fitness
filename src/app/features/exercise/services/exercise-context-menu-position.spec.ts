import {
  menuSpringOrigin,
  menuSpringShift,
  springMenuPositions,
  springViewportMargin,
} from './exercise-context-menu-position';

describe('menuSpringOrigin', () => {
  it('scales from the edge that touches the card', () => {
    expect(menuSpringOrigin('top')).toBe('menu-origin-top');
    expect(menuSpringOrigin('center')).toBe('menu-origin-top');
    expect(menuSpringOrigin('bottom')).toBe('menu-origin-bottom');
  });
});

describe('menuSpringShift', () => {
  it('points the gap away from the card', () => {
    expect(menuSpringShift('top')).toBe('menu-shift-down');
    expect(menuSpringShift('bottom')).toBe('menu-shift-up');
  });
});

describe('springMenuPositions', () => {
  it('opens under the card, then flips above, and never docks to the side', () => {
    const positions = springMenuPositions();

    expect(positions).toHaveLength(2);
    expect(positions[0]).toMatchObject({ originY: 'bottom', overlayY: 'top', offsetY: 8 });
    expect(positions[1]).toMatchObject({ originY: 'top', overlayY: 'bottom', offsetY: -8 });
  });
});

describe('springViewportMargin', () => {
  it('keeps the large clearance on the bottom edge only', () => {
    expect(springViewportMargin(96)).toEqual({ top: 8, bottom: 96, start: 8, end: 8 });
  });
});
