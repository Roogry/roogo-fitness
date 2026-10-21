import { Directive, inject, input, computed } from '@angular/core';
import { ZardIdInternalService } from './id.service';

/**
 * Generates a unique, prefixed ID for an element and exposes it to the template.
 * Useful for maintaining stable IDs, especially for accessibility (e.g., pairing labels with inputs).
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
