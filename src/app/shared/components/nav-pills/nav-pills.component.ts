import { Component, signal, input, inject, DestroyRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Container for navigation pills. Shrinks visually on scroll unless disabled.
 * 
 * @property {boolean} disableScrollShrink - If true, disables the shrink-on-scroll behavior.
 * 
 * @example
 * <app-nav-pills>
 *   <button app-nav-pills-item [active]="true">Tab 1</button>
 * </app-nav-pills>
 */
@Component({
  selector: 'app-nav-pills',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    class:
      'flex p-1 mb-2 bg-muted/60 rounded-full w-full max-w-xs mx-auto border border-border/50 transition-all duration-300 origin-top',
    '[class.scale-80]': 'isScrolled()',
    '[class.max-w-[200px]!]': 'isScrolled()',
    '[class.scale-100]': '!isScrolled()',
  },
})
export class NavPillsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly disableScrollShrink = input<boolean>(false);
  readonly isScrolled = signal(false);

  /**
   * Initializes scroll listener to shrink pills when scrolling down.
   * 
   * @returns {void}
   * 
   * @example
   * navPillsComponent.ngOnInit();
   */
  ngOnInit() {
    const handleScroll = (event: Event) => {
      if (this.disableScrollShrink()) {
        this.isScrolled.set(false);
        return;
      }

      const target = event.target;
      let scrollTop = 0;

      if (target === document || target === window) {
        scrollTop =
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;
      } else if (target instanceof HTMLElement) {
        scrollTop = target.scrollTop;
      }

      this.isScrolled.set(scrollTop > 20);
    };

    // Use capture phase to intercept scroll events from scrollable child containers (e.g. MainLayout)
    window.addEventListener('scroll', handleScroll, true);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', handleScroll, true);
    });
  }
}
