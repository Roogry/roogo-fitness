import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchInput } from './search-input';

@Component({
  imports: [SearchInput],
  template: `
    <app-search-input
      label="Search exercises"
      [value]="value()"
      (valueChange)="value.set($event)"
    />
  `,
})
class SearchHost {
  readonly value = signal('');
}

describe('SearchInput', () => {
  let fixture: ComponentFixture<SearchHost>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SearchHost] });
    fixture = TestBed.createComponent(SearchHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function field(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  function clearButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('[data-testid="search-clear"]');
  }

  it('hides the clear button until there is text, then clears and keeps focus', () => {
    expect(clearButton()).toBeNull();

    fixture.componentInstance.value.set('press');
    fixture.detectChanges();

    const button = clearButton();
    expect(button).not.toBeNull();
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.getAttribute('aria-label')).toBe('Clear search');
    expect(button?.className).toContain('size-11');

    field().focus();
    button?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    button?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('');
    expect(field().value).toBe('');
    expect(document.activeElement).toBe(field());
    expect(clearButton()).toBeNull();
  });
});
