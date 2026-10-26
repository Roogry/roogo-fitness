import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_MUSCLE_ICON } from '@/shared/constants/muscle.constants';
import { CircleMuscleCardComponent } from './circle-muscle-card';

describe('CircleMuscleCardComponent', () => {
  let fixture: ComponentFixture<CircleMuscleCardComponent>;

  beforeEach(() => {
    const style = document.createElement('style');
    style.textContent = '.relative { position: relative; }';
    document.head.appendChild(style);

    TestBed.configureTestingModule({ imports: [CircleMuscleCardComponent] });
    fixture = TestBed.createComponent(CircleMuscleCardComponent);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  function image(): HTMLImageElement {
    const element = fixture.nativeElement.querySelector('img');
    if (!(element instanceof HTMLImageElement)) {
      throw new Error('muscle card did not render an image');
    }
    return element;
  }

  it('renders the placeholder when the muscle has no icon', () => {
    fixture.componentRef.setInput('muscle', { id: 16, name: 'Forearms' });
    fixture.detectChanges();

    expect(image()).not.toBeNull();
    expect(fixture.componentInstance.iconUrl()).toBe(DEFAULT_MUSCLE_ICON);
    expect(image().getAttribute('src')).toContain('default_muscle.webp');
  });

  it('switches a broken icon to the placeholder once', () => {
    fixture.componentRef.setInput('muscle', {
      id: 16,
      name: 'Forearms',
      icon_url: 'assets/images/muscles/missing.webp',
    });
    fixture.detectChanges();

    expect(image().getAttribute('src')).toContain('missing.webp');

    image().dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.componentInstance.iconUrl()).toBe(DEFAULT_MUSCLE_ICON);
    expect(image().getAttribute('src')).toContain('default_muscle.webp');

    const srcAfterFallback = image().getAttribute('src');
    image().dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(image().getAttribute('src')).toBe(srcAfterFallback);
    expect(fixture.componentInstance.iconUrl()).toBe(DEFAULT_MUSCLE_ICON);
  });
});
