import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZard } from '@/core/provider/providezard';
import { RooSheetComponent } from './sheet';

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

const SCROLL_TOP_PX = 240;

describe('RooSheetComponent', () => {
  const originalViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
  const originalInnerHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');
  const originalScrollHeight = Object.getOwnPropertyDescriptor(document.documentElement, 'scrollHeight');
  let viewport: FakeVisualViewport;
  let fixture: ComponentFixture<RooSheetComponent>;

  beforeEach(() => {
    viewport = new FakeVisualViewport();
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 3000,
    });
    vi.spyOn(document.documentElement, 'getBoundingClientRect').mockReturnValue(
      domRect(SCROLL_TOP_PX),
    );
    vi.spyOn(window, 'scroll').mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      imports: [RooSheetComponent],
      providers: [provideZard()],
    });
    fixture = TestBed.createComponent(RooSheetComponent);
    fixture.componentRef.setInput('title', 'Add Exercise');
    fixture.detectChanges();
  });

  afterEach(() => {
    document.documentElement.classList.remove('cdk-global-scrollblock');
    document.documentElement.style.top = '';
    document.documentElement.style.left = '';
    document.body.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
    if (originalScrollHeight) {
      Object.defineProperty(document.documentElement, 'scrollHeight', originalScrollHeight);
    }
    if (originalViewport) Object.defineProperty(window, 'visualViewport', originalViewport);
    else Reflect.deleteProperty(window, 'visualViewport');
    if (originalInnerHeight) Object.defineProperty(window, 'innerHeight', originalInnerHeight);
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  function frame(): HTMLElement {
    return fixture.nativeElement.querySelector('[data-testid="sheet-frame"]');
  }

  function panel(): HTMLElement {
    return fixture.nativeElement.querySelector('[data-testid="sheet-panel"]');
  }

  function body(): HTMLElement {
    return fixture.nativeElement.querySelector('[data-testid="sheet-body"]');
  }

  function open(target: ComponentFixture<RooSheetComponent> = fixture): void {
    target.componentRef.setInput('isOpen', true);
    target.detectChanges();
    TestBed.flushEffects();
  }

  function close(target: ComponentFixture<RooSheetComponent> = fixture): void {
    target.componentRef.setInput('isOpen', false);
    target.detectChanges();
    TestBed.flushEffects();
  }

  it('keeps the sheet on the bottom and pads the scroll body for the keyboard', () => {
    open();

    expect(frame().className).toContain('bottom-0');
    expect(frame().style.bottom).toBe('');
    expect(panel().style.maxHeight).toBe('');
    expect(panel().className).toContain('max-h-[85vh]');
    expect(body().className).toContain('pb-above-keyboard');

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
    viewport.height = 480;
    viewport.offsetTop = 320;
    viewport.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    expect(frame().style.bottom).toBe('');
    expect(panel().style.maxHeight).toBe('');
    expect(document.documentElement.style.getPropertyValue('--keyboard-inset').trim()).toBe('320px');
  });

  it('locks page scroll on open and restores the same position on close', () => {
    expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(false);

    open();

    expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(true);
    expect(document.documentElement.style.top).toBe(`-${SCROLL_TOP_PX}px`);
    expect(window.scroll).not.toHaveBeenCalled();

    close();

    expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(false);
    expect(document.documentElement.style.top).toBe('');
    expect(window.scroll).toHaveBeenCalledWith(0, SCROLL_TOP_PX);
  });

  it('keeps the page locked until the last stacked sheet closes', () => {
    const inner = TestBed.createComponent(RooSheetComponent);
    inner.detectChanges();

    open();
    open(inner);
    expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(true);

    close();
    expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(true);
    expect(window.scroll).not.toHaveBeenCalled();

    close(inner);
    expect(document.documentElement.classList.contains('cdk-global-scrollblock')).toBe(false);
    expect(window.scroll).toHaveBeenCalledTimes(1);
    expect(window.scroll).toHaveBeenCalledWith(0, SCROLL_TOP_PX);

    inner.destroy();
  });
});

function domRect(scrollTop: number): DOMRect {
  const top = -scrollTop;
  return {
    top,
    left: 0,
    bottom: top + 800,
    right: 390,
    width: 390,
    height: 800,
    x: 0,
    y: top,
    toJSON: () => ({}),
  };
}
