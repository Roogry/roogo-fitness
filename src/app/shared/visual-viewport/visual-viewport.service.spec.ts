import { TestBed } from '@angular/core/testing';
import { KEYBOARD_INSET_PROPERTY } from './visual-viewport.constants';
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
});
