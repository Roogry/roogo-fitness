import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { LONG_PRESS_CANCEL_PX, LONG_PRESS_MS, LongPressDirective } from './long-press.directive';

@Component({
  imports: [LongPressDirective],
  template: `
    <div appLongPress (longPress)="fires = fires + 1" (pressingChange)="presses.push($event)">
      <a data-testid="title" href="/exercise/1">Bench</a>
      <input data-testid="weight" />
      <div data-testid="handle" data-drag-handle>handle</div>
    </div>
    <div [appLongPress]="false" (longPress)="fires = fires + 1">
      <div data-testid="off">Off</div>
    </div>
  `,
})
class Host {
  fires = 0;
  presses: boolean[] = [];
}

describe('LongPressDirective', () => {
  let fixture: ComponentFixture<Host>;
  let vibrate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: vibrate });

    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, 'vibrate');
  });

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

  function title(): HTMLElement {
    return fixture.nativeElement.querySelector('[data-testid="title"]');
  }

  it('fires after a still press and pulses the haptic when the device supports it', () => {
    touch('touchstart', title(), 20, 20);
    vi.advanceTimersByTime(LONG_PRESS_MS - 1);
    expect(fixture.componentInstance.fires).toBe(0);

    vi.advanceTimersByTime(1);
    expect(fixture.componentInstance.fires).toBe(1);
    expect(fixture.componentInstance.presses).toEqual([true, false]);
    expect(vibrate).toHaveBeenCalledWith(10);

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    title().dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
  });

  it('cancels when the finger moves, or when the press starts on an input or drag handle', () => {
    touch('touchstart', title(), 20, 20);
    expect(fixture.componentInstance.presses).toEqual([true]);
    touch('touchmove', title(), 20 + LONG_PRESS_CANCEL_PX + 1, 20);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(fixture.componentInstance.fires).toBe(0);
    expect(fixture.componentInstance.presses).toEqual([true, false]);

    const weight = fixture.nativeElement.querySelector('[data-testid="weight"]') as HTMLElement;
    touch('touchstart', weight, 20, 20);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(fixture.componentInstance.fires).toBe(0);

    const handle = fixture.nativeElement.querySelector('[data-testid="handle"]') as HTMLElement;
    touch('touchstart', handle, 20, 20);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(fixture.componentInstance.fires).toBe(0);
  });

  it('does nothing while disabled', () => {
    const off = fixture.nativeElement.querySelector('[data-testid="off"]') as HTMLElement;
    touch('touchstart', off, 20, 20);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(fixture.componentInstance.fires).toBe(0);
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('cancels a press that is still waiting when it becomes disabled', () => {
    TestBed.resetTestingModule();
    const toggle = TestBed.createComponent(ToggleHost);
    toggle.detectChanges();
    const title = toggle.nativeElement.querySelector('[data-testid="title"]') as HTMLElement;

    touch('touchstart', title, 20, 20);
    expect(toggle.componentInstance.presses).toEqual([true]);

    toggle.componentInstance.on.set(false);
    toggle.detectChanges();
    vi.advanceTimersByTime(LONG_PRESS_MS);

    expect(toggle.componentInstance.fires).toBe(0);
    expect(toggle.componentInstance.presses).toEqual([true, false]);
  });
});

@Component({
  imports: [LongPressDirective],
  template: `
    <div
      [appLongPress]="on()"
      (longPress)="fires = fires + 1"
      (pressingChange)="presses.push($event)"
    >
      <span data-testid="title">Bench</span>
    </div>
  `,
})
class ToggleHost {
  readonly on = signal(true);
  fires = 0;
  presses: boolean[] = [];
}
