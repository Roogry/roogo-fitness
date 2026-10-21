import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ZardIdInternalService {
  private counter = 0;

  generate(prefix: string) {
    return `${prefix}-${++this.counter}`;
  }
}
