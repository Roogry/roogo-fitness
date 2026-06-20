import { Directive, inject, Injectable, input, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
class ZardIdInternalService {
  private counter = 0;
  generate(prefix: string) {
    return `${prefix}-${++this.counter}`;
  }
}

/**
 * Generates a unique, prefixed ID for an element and exposes it to the template.
 * Useful for maintaining stable IDs, especially for accessibility (e.g., pairing labels with inputs).
 * @example
 * <div [zardId]="'my-prefix'" #myId="zardId" [id]="myId.id()"></div>
 */
@Directive({
  selector: '[zardId]',
  exportAs: 'zardId',
})
export class ZardIdDirective {
  private idService = inject(ZardIdInternalService);

  readonly zardId = input('ssr');

  readonly id = computed(() => this.idService.generate(this.zardId()));
}
