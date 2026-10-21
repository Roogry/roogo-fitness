import { Injectable } from '@angular/core';
import type { SwipeActions } from './swipe-actions';

/** One revealed card at a time. Provide it on the list that hosts the cards. */
@Injectable()
export class SwipeActionsGroup {
  private current: SwipeActions | null = null;

  opened(actions: SwipeActions) {
    if (this.current === actions) return;
    const previous = this.current;
    this.current = actions;
    previous?.close();
  }

  closed(actions: SwipeActions) {
    if (this.current === actions) this.current = null;
  }

  closeAll() {
    this.current?.close();
  }
}
