import { TestBed } from '@angular/core/testing';
import { KEYBOARD_INSET_PROPERTY, KEYBOARD_REMEASURE_DELAYS_MS } from './visual-viewport.constants';
import { VisualViewportService } from './visual-viewport.service';

class FakeVisualViewport extends EventTarget {
  height = 800;
  offsetTop = 0;
  width = 390;
  offsetLeft = 0;
  scale = 1;
  pageLeft = 0;
  pageTop = 0;
  onresize: ((this: VisualViewport, ev: Event) => unknown) | null = null;
  onscroll: ((this: VisualViewport, ev: Event) => unknown) | null = null;
}

describe('VisualViewportService', () => {
  const originalViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
  const originalInnerHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');
  let viewport: FakeVisualViewport;

  beforeEach(() => {
    viewport = new FakeVisualViewport();
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    document.documentElement.style.removeProperty(KEYBOARD_INSET_PROPERTY);
  });

  afterEach(() => {
    document.documentElement.style.removeProperty(KEYBOARD_INSET_PROPERTY);
    if (originalViewport) Object.defineProperty(window, 'visualViewport', originalViewport);
    else Reflect.deleteProperty(window, 'visualViewport');
    if (originalInnerHeight) Object.defineProperty(window, 'innerHeight', originalInnerHeight);
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  function inset(): string {
    return document.documentElement.style.getPropertyValue(KEYBOARD_INSET_PROPERTY).trim();
  }

  it('sets --keyboard-inset on the first keyboard open and resets it on close', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
    const service = TestBed.inject(VisualViewportService);

    expect(inset()).toBe('0px');
    expect(service.keyboardOffset()).toBe(0);

    viewport.height = 480;
    viewport.offsetTop = 320;
    viewport.dispatchEvent(new Event('resize'));

    expect(inset()).toBe('320px');
    expect(service.keyboardOffset()).toBe(320);

    viewport.height = 800;
    viewport.offsetTop = 0;
    viewport.dispatchEvent(new Event('resize'));

    expect(inset()).toBe('0px');
    expect(service.keyboardOffset()).toBe(0);
  });

  describe('remeasure', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('updates --keyboard-inset immediately and again after each delay', () => {
      const service = TestBed.inject(VisualViewportService);
      const [firstDelay, secondDelay, thirdDelay] = KEYBOARD_REMEASURE_DELAYS_MS;

      viewport.height = 480;
      viewport.offsetTop = 320;
      service.remeasure();
      expect(inset()).toBe('320px');

      viewport.height = 500;
      viewport.offsetTop = 0;
      vi.advanceTimersByTime(firstDelay);
      expect(inset()).toBe('300px');

      viewport.height = 800;
      viewport.offsetTop = 0;
      vi.advanceTimersByTime(secondDelay - firstDelay);
      expect(inset()).toBe('0px');

      viewport.height = 480;
      viewport.offsetTop = 320;
      vi.advanceTimersByTime(thirdDelay - secondDelay);
      expect(inset()).toBe('320px');
    });

    it('clears the previous timers when called again', () => {
      const service = TestBed.inject(VisualViewportService);
      const setProperty = vi.spyOn(document.documentElement.style, 'setProperty');
      setProperty.mockClear();

      service.remeasure();
      service.remeasure();
      vi.advanceTimersByTime(KEYBOARD_REMEASURE_DELAYS_MS[2]);

      const immediateReads = 2;
      const delayedReads = KEYBOARD_REMEASURE_DELAYS_MS.length;
      expect(setProperty).toHaveBeenCalledTimes(immediateReads + delayedReads);
    });
  });
});
