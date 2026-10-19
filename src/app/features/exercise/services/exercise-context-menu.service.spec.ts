import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ExerciseContextMenuService, MENU_LEAVE_MS } from './exercise-context-menu.service';

@Component({ template: '' })
class Away {}

describe('ExerciseContextMenuService', () => {
  let service: ExerciseContextMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'away', component: Away }])],
    });
    service = TestBed.inject(ExerciseContextMenuService);
  });

  afterEach(async () => {
    service.close();
    await wait(MENU_LEAVE_MS + 40);
    document.querySelector('.cdk-overlay-container')?.remove();
    for (const name of document.querySelectorAll('[data-testid="exercise-name"]')) {
      name.parentElement?.remove();
    }
    document.documentElement.classList.remove('cdk-global-scrollblock');
    document.documentElement.style.top = '';
    document.documentElement.style.left = '';
    TestBed.resetTestingModule();
  });

  it('keeps a single pressed id and a single open menu', () => {
    service.press(1);
    service.press(2);
    expect(service.pressedExerciseId()).toBe(2);
    expect(service.canPress(1)).toBe(false);
    expect(service.canPress(2)).toBe(true);

    const first = card('Bench');
    const second = card('Row');
    service.open(request(1, first));
    service.open(request(2, second));

    expect(service.openExerciseId()).toBe(2);
    expect(service.pressedExerciseId()).toBeNull();
    expect(document.querySelectorAll('.exercise-context-backdrop')).toHaveLength(1);
    expect(document.querySelectorAll('[data-testid="exercise-context-menu"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-testid="exercise-name"]')).toHaveLength(2);
  });

  it('closes on a backdrop tap without clicking what is underneath', () => {
    const pageButton = document.createElement('button');
    let clicks = 0;
    pageButton.addEventListener('click', () => {
      clicks += 1;
    });
    document.body.append(pageButton);

    service.open(request(4, card('Bench')));
    const backdrop = document.querySelector('.exercise-context-backdrop');
    expect(backdrop).not.toBeNull();
    expect(backdrop?.classList.contains('cdk-overlay-backdrop')).toBe(true);

    backdrop?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(clicks).toBe(0);
    expect(service.openExerciseId()).toBeNull();
    pageButton.remove();
  });

  it('blocks document scroll while the menu is open', () => {
    const root = document.documentElement;
    // jsdom does not grow scrollHeight with content, so the block strategy would no-op.
    Object.defineProperty(root, 'scrollHeight', { configurable: true, get: () => 5000 });
    Object.defineProperty(root, 'scrollWidth', { configurable: true, get: () => 5000 });

    service.open(request(4, card('Bench')));

    expect(root.classList.contains('cdk-global-scrollblock')).toBe(true);

    service.close();
    return wait(MENU_LEAVE_MS + 40).then(() => {
      expect(root.classList.contains('cdk-global-scrollblock')).toBe(false);
      Reflect.deleteProperty(root, 'scrollHeight');
      Reflect.deleteProperty(root, 'scrollWidth');
    });
  });

  it('closes when navigation starts and restores focus after the leave animation', async () => {
    const element = card('Bench');
    const name = element.querySelector<HTMLElement>('[data-testid="exercise-name"]');
    service.open(request(4, element));
    expect(service.openExerciseId()).toBe(4);

    await TestBed.inject(Router).navigateByUrl('/away');

    expect(service.openExerciseId()).toBeNull();
    expect(document.querySelector('[data-testid="exercise-context-card"]')).not.toBeNull();

    await wait(MENU_LEAVE_MS + 40);

    expect(document.querySelector('.exercise-context-backdrop')).toBeNull();
    expect(document.activeElement).toBe(name);
  });

  it('runs replace and delete, and Escape closes without running them', async () => {
    const replaced: number[] = [];
    const deleted: number[] = [];
    service.open({
      exerciseId: 4,
      card: card('Bench'),
      onReplace: () => replaced.push(4),
      onDelete: () => deleted.push(4),
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(replaced).toEqual([]);
    expect(deleted).toEqual([]);
    expect(service.openExerciseId()).toBeNull();
    await wait(MENU_LEAVE_MS + 40);

    service.open({
      exerciseId: 4,
      card: card('Bench'),
      onReplace: () => replaced.push(4),
      onDelete: () => deleted.push(4),
    });
    (
      document.querySelector('[data-testid="exercise-context-replace"]') as HTMLButtonElement
    ).click();
    expect(replaced).toEqual([4]);
    expect(deleted).toEqual([]);
    await wait(MENU_LEAVE_MS + 40);

    service.open({
      exerciseId: 4,
      card: card('Bench'),
      onReplace: () => replaced.push(4),
      onDelete: () => deleted.push(4),
    });
    (
      document.querySelector('[data-testid="exercise-context-delete"]') as HTMLButtonElement
    ).click();
    expect(deleted).toEqual([4]);
  });

  it('closes when the window or visual viewport actually changes', async () => {
    const viewport = fakeVisualViewport();
    service.open(request(4, card('Bench')));
    await waitForFrame();

    window.dispatchEvent(new Event('resize'));
    expect(service.openExerciseId()).toBe(4);

    const width = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width + 40 });
    window.dispatchEvent(new Event('resize'));
    expect(service.openExerciseId()).toBeNull();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
    await wait(MENU_LEAVE_MS + 40);

    service.open(request(4, card('Bench')));
    await waitForFrame();
    viewport.height += 20;
    viewport.emit('resize');
    expect(service.openExerciseId()).toBeNull();
    viewport.remove();
  });
});

function request(exerciseId: number, element: HTMLElement) {
  return {
    exerciseId,
    card: element,
    onReplace: () => undefined,
    onDelete: () => undefined,
  };
}

function card(name: string): HTMLElement {
  const element = document.createElement('div');
  element.innerHTML = `<span data-testid="exercise-name" tabindex="0">${name}</span>`;
  document.body.append(element);
  return element;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
}

function fakeVisualViewport() {
  const previous = window.visualViewport;
  const listeners = new Map<string, Set<() => void>>();
  const viewport = {
    width: 390,
    height: 800,
    offsetTop: 0,
    addEventListener(type: string, listener: () => void) {
      const group = listeners.get(type) ?? new Set();
      group.add(listener);
      listeners.set(type, group);
    },
    removeEventListener(type: string, listener: () => void) {
      listeners.get(type)?.delete(listener);
    },
    emit(type: string) {
      listeners.get(type)?.forEach((listener) => listener());
    },
    remove() {
      if (previous) {
        Object.defineProperty(window, 'visualViewport', { configurable: true, value: previous });
      } else {
        Reflect.deleteProperty(window, 'visualViewport');
      }
    },
  };
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
  return viewport;
}
