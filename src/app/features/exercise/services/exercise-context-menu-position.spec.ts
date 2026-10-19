import {
  fixedOriginFromVisualRect,
  menuSpringOrigin,
  placeContextMenu,
} from './exercise-context-menu-position';

describe('menuSpringOrigin', () => {
  it('scales from the edge that touches the card', () => {
    expect(menuSpringOrigin('top')).toBe('menu-origin-top');
    expect(menuSpringOrigin('center')).toBe('menu-origin-top');
    expect(menuSpringOrigin('bottom')).toBe('menu-origin-bottom');
  });
});

describe('fixedOriginFromVisualRect', () => {
  it('adds the visual viewport offset so a fixed box matches the card', () => {
    expect(
      fixedOriginFromVisualRect({ top: 420, left: 16 }, { offsetTop: 47, offsetLeft: 0 }),
    ).toEqual({ top: 467, left: 16 });
  });
});

describe('placeContextMenu', () => {
  it('opens one gap under the card', () => {
    const placement = placeContextMenu({
      cardTop: 420,
      cardLeft: 16,
      cardWidth: 358,
      cardHeight: 180,
      menuWidth: 200,
      menuHeight: 96,
      viewportWidth: 390,
      viewportHeight: 800,
      bottomClearance: 96,
    });

    expect(placement.placedAbove).toBe(false);
    expect(placement.top).toBe(608);
    expect(placement.left).toBe(95);
  });

  it('flips above the card when the session bar leaves no room below', () => {
    const placement = placeContextMenu({
      cardTop: 700,
      cardLeft: 16,
      cardWidth: 358,
      cardHeight: 120,
      menuWidth: 200,
      menuHeight: 96,
      viewportWidth: 390,
      viewportHeight: 844,
      bottomClearance: 96,
    });

    expect(placement.placedAbove).toBe(true);
    expect(placement.top).toBe(596);
  });

  it('keeps the menu on screen horizontally', () => {
    const placement = placeContextMenu({
      cardTop: 100,
      cardLeft: 300,
      cardWidth: 80,
      cardHeight: 40,
      menuWidth: 200,
      menuHeight: 40,
      viewportWidth: 390,
      viewportHeight: 800,
      bottomClearance: 96,
    });

    expect(placement.left).toBe(182);
    expect(placement.placedAbove).toBe(false);
  });
});
