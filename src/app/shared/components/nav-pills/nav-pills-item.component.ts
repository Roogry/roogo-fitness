import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { pillVariants } from './nav-pills.variants';

/**
 * Individual pill item for the nav-pills component.
 * Applies active styling based on input.
 * 
 * @example
 * <button app-nav-pills-item [active]="true">Tab 1</button>
 */
@Component({
  selector: 'button[app-nav-pills-item]',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    '[class]': 'computedClass()',
  },
})
export class NavPillsItemComponent {
  active = input<boolean>(false);

  computedClass = computed(() => {
    return pillVariants({ active: this.active() });
  });
}
