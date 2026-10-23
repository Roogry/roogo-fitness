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

describe('RooSheetComponent keyboard', () => {
  const originalViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
  const originalInnerHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');
  let viewport: FakeVisualViewport;
  let fixture: ComponentFixture<RooSheetComponent>;

  beforeEach(() => {
    viewport = new FakeVisualViewport();
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });

    TestBed.configureTestingModule({
      imports: [RooSheetComponent],
      providers: [provideZard()],
    });
    fixture = TestBed.createComponent(RooSheetComponent);
    fixture.componentRef.setInput('title', 'Add Exercise');
    fixture.detectChanges();
  });

  afterEach(() => {
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

  function column(): HTMLElement {
    return fixture.nativeElement.querySelector('[data-testid="sheet-column"]');
  }

  it('lifts on the first visualViewport resize after the sheet opens', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    expect(frame().style.bottom).toBe('');
    expect(panel().style.maxHeight).toBe('');

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);

    viewport.height = 480;
    viewport.offsetTop = 320;
    viewport.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    expect(frame().style.bottom).toBe('320px');
    expect(panel().style.maxHeight).toBe('min(480px, calc(85vh - 320px))');
    expect(column().style.maxHeight).toBe('min(480px, calc(85vh - 320px))');
    const backdrop = fixture.nativeElement.querySelector('.bg-ink\\/30') as HTMLElement;
    expect(backdrop.style.bottom).toBe('');
  });

  it('drops the inline height when the keyboard closes so the Tailwind classes apply', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    viewport.height = 480;
    viewport.offsetTop = 0;
    viewport.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    expect(frame().style.bottom).toBe('320px');

    viewport.height = 800;
    viewport.offsetTop = 0;
    viewport.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    expect(frame().style.bottom).toBe('');
    expect(panel().style.maxHeight).toBe('');
    expect(panel().className).toContain('max-h-[85vh]');
    expect(panel().className).toContain('md:max-h-[80vh]');
  });
});
