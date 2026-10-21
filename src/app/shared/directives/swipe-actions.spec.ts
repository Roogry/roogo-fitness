import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AXIS_LOCK_PX } from './swipe-actions.constants';
import { SwipeActionsGroup } from './swipe-actions.service';
import { nextSwipeAxis, rubberBandOffset, shouldSnapSwipeOpen } from './swipe-actions.utils';
import { SwipeActions } from './swipe-actions';

describe('swipe gesture math', () => {
  it('stays undecided until the movement clears the axis threshold', () => {
    expect(nextSwipeAxis(AXIS_LOCK_PX - 1, AXIS_LOCK_PX - 1)).toBe('pending');
    expect(nextSwipeAxis(12, 4)).toBe('horizontal');
    expect(nextSwipeAxis(8, 20)).toBe('vertical');
    expect(nextSwipeAxis(12, 12)).toBe('vertical');
  });

  it('resists a drag past the open or closed edge', () => {
    expect(rubberBandOffset(-80, 160)).toBe(-80);
    expect(rubberBandOffset(0, 160)).toBe(0);
    expect(rubberBandOffset(-10, 0)).toBe(0);

    const pastOpen = rubberBandOffset(-200, 160);
    expect(pastOpen).toBeLessThan(-160);
    expect(pastOpen).toBeGreaterThan(-200);

    const pastClosed = rubberBandOffset(40, 160);
    expect(pastClosed).toBeGreaterThan(0);
    expect(pastClosed).toBeLessThan(40);
  });

  it('snaps open past halfway, or on a left flick, and closes on a right flick', () => {
    expect(shouldSnapSwipeOpen(-79, 160, 0)).toBe(false);
    expect(shouldSnapSwipeOpen(-80, 160, 0)).toBe(true);
    expect(shouldSnapSwipeOpen(-30, 160, -0.6)).toBe(true);
    expect(shouldSnapSwipeOpen(-120, 160, 0.6)).toBe(false);
    expect(shouldSnapSwipeOpen(-120, 0, -1)).toBe(false);
    /** Two size-12 actions, the gap, and padding (w-44) open at 88px. */
    expect(shouldSnapSwipeOpen(-87, 176, 0)).toBe(false);
    expect(shouldSnapSwipeOpen(-88, 176, 0)).toBe(true);
  });
});

@Component({
  imports: [SwipeActions],
  providers: [SwipeActionsGroup],
  template: `
    <app-swipe-actions [enabled]="true">
      <button swipe-actions type="button">Replace</button>
      <button swipe-actions type="button">Delete</button>
      <div data-testid="body">
        <a data-testid="title" href="/exercise/1">Bench</a>
        <input data-testid="weight" />
        <div data-testid="handle" data-drag-handle>handle</div>
      </div>
    </app-swipe-actions>
    <app-swipe-actions [enabled]="true">
      <button swipe-actions type="button">Replace</button>
      <div data-testid="body-2">Row</div>
    </app-swipe-actions>
  `,
})
class Host {}

/** Laid-out width of the session reveal: w-44. */
const REVEAL_PX = 176;

describe('SwipeActions', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(() => {
    let now = 0;
    /** A slow clock so these drags are decided by distance, not a same-turn flick. */
    vi.spyOn(Date, 'now').mockImplementation(() => {
      now += 250;
      return now;
    });

    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    for (const tray of trays()) {
      Object.defineProperty(tray, 'offsetWidth', { configurable: true, value: REVEAL_PX });
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function trays(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[data-testid="swipe-actions"]'));
  }

  function panes(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[data-testid="swipe-pane"]'));
  }

  function touch(
    type: 'touchstart' | 'touchmove' | 'touchend',
    target: Element,
    x: number,
    y: number,
  ) {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'touches', { value: [{ clientX: x, clientY: y }] });
    target.dispatchEvent(event);
    return event;
  }

  function flush() {
    TestBed.flushEffects();
    fixture.detectChanges();
  }

  it('ignores a vertical drag and a drag that starts on an input or the reorder handle', () => {
    const [pane] = panes();
    const body = fixture.nativeElement.querySelector('[data-testid="body"]') as HTMLElement;
    const weight = fixture.nativeElement.querySelector('[data-testid="weight"]') as HTMLElement;
    const handle = fixture.nativeElement.querySelector('[data-testid="handle"]') as HTMLElement;

    const vertical = touch('touchstart', body, 40, 20);
    touch('touchmove', body, 42, 80);
    touch('touchend', body, 42, 80);
    flush();

    expect(vertical.defaultPrevented).toBe(false);
    expect(pane.style.transform).toBe('translate3d(0px, 0, 0)');

    touch('touchstart', weight, 40, 20);
    const onInput = touch('touchmove', weight, -80, 20);
    touch('touchend', weight, -80, 20);
    flush();
    expect(onInput.defaultPrevented).toBe(false);
    expect(pane.style.transform).toBe('translate3d(0px, 0, 0)');

    touch('touchstart', handle, 40, 20);
    touch('touchmove', handle, -80, 20);
    touch('touchend', handle, -80, 20);
    flush();
    expect(pane.style.transform).toBe('translate3d(0px, 0, 0)');
  });

  it('locks horizontal, snaps open past halfway, and snaps closed short of it', () => {
    const [pane] = panes();
    const body = fixture.nativeElement.querySelector('[data-testid="body"]') as HTMLElement;

    const move = touch('touchstart', body, 200, 40);
    const horizontal = touch('touchmove', body, 150, 42);
    expect(horizontal.defaultPrevented).toBe(true);
    expect(move.defaultPrevented).toBe(false);
    flush();
    expect(pane.style.transform).toBe('translate3d(-50px, 0, 0)');

    touch('touchend', body, 150, 42);
    flush();
    expect(pane.style.transform).toBe('translate3d(0px, 0, 0)');
    expect(trays()[0].hasAttribute('inert')).toBe(true);

    touch('touchstart', body, 200, 40);
    touch('touchmove', body, 80, 42);
    touch('touchend', body, 80, 42);
    flush();

    expect(pane.style.transform).toBe('translate3d(-176px, 0, 0)');
    expect(trays()[0].hasAttribute('inert')).toBe(false);
    expect(pane.className).toContain('motion-reduce:transition-none');
  });

  it('keeps a single card open and closes it on an outside tap or a tap back', () => {
    const [firstBody, secondBody] = [
      fixture.nativeElement.querySelector('[data-testid="body"]') as HTMLElement,
      fixture.nativeElement.querySelector('[data-testid="body-2"]') as HTMLElement,
    ];
    const [firstPane, secondPane] = panes();

    touch('touchstart', firstBody, 200, 10);
    touch('touchmove', firstBody, 40, 12);
    touch('touchend', firstBody, 40, 12);
    flush();
    expect(firstPane.style.transform).toBe('translate3d(-176px, 0, 0)');

    touch('touchstart', secondBody, 200, 10);
    touch('touchmove', secondBody, 40, 12);
    touch('touchend', secondBody, 40, 12);
    flush();

    expect(firstPane.style.transform).toBe('translate3d(0px, 0, 0)');
    expect(secondPane.style.transform).toBe('translate3d(-176px, 0, 0)');

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    flush();
    outside.remove();

    expect(secondPane.style.transform).toBe('translate3d(0px, 0, 0)');

    touch('touchstart', firstBody, 200, 10);
    touch('touchmove', firstBody, 40, 12);
    touch('touchend', firstBody, 40, 12);
    flush();

    touch('touchstart', firstBody, 40, 12);
    touch('touchend', firstBody, 40, 12);
    flush();
    expect(firstPane.style.transform).toBe('translate3d(0px, 0, 0)');
  });

  it('opens the tray when reveal is called', () => {
    const swipe = fixture.debugElement.children[0].componentInstance as SwipeActions;
    expect(trays()[0].hasAttribute('inert')).toBe(true);

    swipe.reveal();
    flush();

    expect(panes()[0].style.transform).toBe('translate3d(-176px, 0, 0)');
    expect(trays()[0].hasAttribute('inert')).toBe(false);
    expect(panes()[1].style.transform).toBe('translate3d(0px, 0, 0)');
  });

  it('does not follow a click through after a swipe', () => {
    const title = fixture.nativeElement.querySelector('[data-testid="title"]') as HTMLElement;

    touch('touchstart', title, 200, 10);
    touch('touchmove', title, 40, 12);
    touch('touchend', title, 40, 12);
    flush();

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    title.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
  });
});
