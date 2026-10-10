import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DismissKeyboardOnScroll } from './dismiss-keyboard-on-scroll.directive';

@Component({
  standalone: true,
  imports: [DismissKeyboardOnScroll],
  template: `
    <div appDismissKeyboardOnScroll>
      <input data-testid="field" />
      <div data-testid="page">page</div>
      <div data-testid="keyboard-helper-bar">
        <button type="button" data-testid="chip">8</button>
      </div>
    </div>
  `,
})
class Host {}

describe('DismissKeyboardOnScroll', () => {
  let fixture: ComponentFixture<Host>;
  let input: HTMLInputElement;
  let page: HTMLElement;
  let chip: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    input = fixture.nativeElement.querySelector('[data-testid="field"]');
    page = fixture.nativeElement.querySelector('[data-testid="page"]');
    chip = fixture.nativeElement.querySelector('[data-testid="chip"]');
  });

  afterEach(() => {
    fixture.nativeElement.remove();
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
  }

  it('blurs the focused input after a vertical drag over 10px', () => {
    input.focus();
    touch('touchstart', page, 20, 40);
    touch('touchmove', page, 22, 52);
    expect(document.activeElement).not.toBe(input);
  });

  it('does not blur on a small vertical move', () => {
    input.focus();
    touch('touchstart', page, 20, 40);
    touch('touchmove', page, 20, 49);
    expect(document.activeElement).toBe(input);
  });

  it('does not blur on a mostly horizontal drag', () => {
    input.focus();
    touch('touchstart', page, 20, 40);
    touch('touchmove', page, 60, 52);
    expect(document.activeElement).toBe(input);
  });

  it('does not blur when the drag starts inside the keyboard helper bar', () => {
    input.focus();
    touch('touchstart', chip, 20, 40);
    touch('touchmove', chip, 20, 80);
    touch('touchend', chip, 20, 80);
    expect(document.activeElement).toBe(input);
  });
});
