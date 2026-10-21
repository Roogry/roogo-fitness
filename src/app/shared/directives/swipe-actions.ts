import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { SwipeActionsGroup } from './swipe-actions.service';
import type { SwipeAxis } from './swipe-actions.types';
import {
  isSwipeIgnoredTarget,
  nextSwipeAxis,
  rubberBandOffset,
  shouldSnapSwipeOpen,
} from './swipe-actions.utils';

/**
 * Slides its default content left to reveal `[swipe-actions]` buttons.
 * Touch only. A vertical drag is left to the page once the axis locks.
 */
@Component({
  selector: 'app-swipe-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    <div class="relative" [class.overflow-hidden]="enabled()" [class.rounded-2xl]="enabled()">
      <div
        #actions
        data-testid="swipe-actions"
        class="absolute inset-y-0 right-0 z-0 flex items-center"
        [class.hidden]="!enabled()"
        [attr.inert]="open() ? null : ''"
        [attr.aria-hidden]="open() ? null : 'true'"
        (click)="close()"
      >
        <ng-content select="[swipe-actions]" />
      </div>

      <div
        #pane
        data-testid="swipe-pane"
        class="relative z-10 touch-pan-y motion-reduce:transition-none"
        [class.transition-transform]="!dragging()"
        [class.duration-200]="!dragging()"
        [class.ease-out]="!dragging()"
        [style.transform]="paneTransform()"
      >
        <ng-content />
      </div>
    </div>
  `,
})
export class SwipeActions implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly group = inject(SwipeActionsGroup, { optional: true });
  private readonly pane = viewChild<ElementRef<HTMLElement>>('pane');
  private readonly actions = viewChild<ElementRef<HTMLElement>>('actions');

  readonly enabled = input(false, { transform: booleanAttribute });

  readonly open = signal(false);
  readonly dragging = signal(false);
  private readonly actionWidth = signal(0);
  private readonly offset = signal(0);

  readonly paneTransform = computed(() =>
    this.enabled() ? `translate3d(${this.offset()}px, 0, 0)` : 'none',
  );

  private tracking = false;
  private axis: SwipeAxis = 'pending';
  private startX = 0;
  private startY = 0;
  private originOffset = 0;
  private lastX = 0;
  private lastAt = 0;
  private velocityX = 0;
  private suppressClick = false;

  constructor() {
    effect(() => {
      if (this.dragging()) return;
      const width = this.actionWidth();
      this.offset.set(this.open() ? -width : 0);
    });

    effect(() => {
      if (this.enabled() || !this.open()) return;
      this.close();
    });

    effect((onCleanup) => {
      const element = this.actions()?.nativeElement;
      if (!element || typeof ResizeObserver === 'undefined') {
        this.syncActionWidth();
        return;
      }

      const observer = new ResizeObserver(() => this.syncActionWidth());
      observer.observe(element);
      this.syncActionWidth();
      onCleanup(() => observer.disconnect());
    });

    effect((onCleanup) => {
      const element = this.pane()?.nativeElement;
      if (!element) return;

      element.addEventListener('touchstart', this.onTouchStart, { passive: true });
      element.addEventListener('touchmove', this.onTouchMove, { passive: false });
      element.addEventListener('touchend', this.onTouchEnd);
      element.addEventListener('touchcancel', this.onTouchEnd);
      element.addEventListener('click', this.onPaneClick, true);

      onCleanup(() => {
        element.removeEventListener('touchstart', this.onTouchStart);
        element.removeEventListener('touchmove', this.onTouchMove);
        element.removeEventListener('touchend', this.onTouchEnd);
        element.removeEventListener('touchcancel', this.onTouchEnd);
        element.removeEventListener('click', this.onPaneClick, true);
      });
    });

    effect((onCleanup) => {
      if (!this.open()) return;

      const onPointerDown = (event: Event) => {
        const target = event.target;
        if (!(target instanceof Node)) return;
        if (this.host.nativeElement.contains(target)) return;
        this.close();
      };

      document.addEventListener('pointerdown', onPointerDown, true);
      onCleanup(() => document.removeEventListener('pointerdown', onPointerDown, true));
    });
  }

  ngOnDestroy() {
    this.group?.closed(this);
  }

  close() {
    this.dragging.set(false);
    this.open.set(false);
    this.group?.closed(this);
  }

  /** Opens the tray without a drag. The screen-reader actions button uses this. */
  reveal() {
    if (!this.enabled()) return;
    this.syncActionWidth();
    this.snapOpen();
  }

  private snapOpen() {
    this.dragging.set(false);
    this.open.set(true);
    this.group?.opened(this);
  }

  private syncActionWidth() {
    const width = this.actions()?.nativeElement.offsetWidth ?? 0;
    if (width > 0) this.actionWidth.set(width);
  }

  private readonly onTouchStart = (event: TouchEvent) => {
    if (!this.enabled() || event.touches.length !== 1) return;
    if (isSwipeIgnoredTarget(event.target)) {
      this.tracking = false;
      return;
    }

    this.syncActionWidth();
    if (this.actionWidth() <= 0) return;

    this.tracking = true;
    this.axis = 'pending';
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
    this.originOffset = this.open() ? -this.actionWidth() : 0;
    this.lastX = this.startX;
    this.lastAt = Date.now();
    this.velocityX = 0;
  };

  private readonly onTouchMove = (event: TouchEvent) => {
    if (!this.tracking || event.touches.length !== 1) return;

    const x = event.touches[0].clientX;
    const y = event.touches[0].clientY;
    const dx = x - this.startX;
    const dy = y - this.startY;

    if (this.axis === 'pending') {
      this.axis = nextSwipeAxis(dx, dy);
      if (this.axis !== 'horizontal') return;
      this.dragging.set(true);
    }

    if (this.axis !== 'horizontal') return;
    if (event.cancelable) event.preventDefault();

    const now = Date.now();
    const elapsed = now - this.lastAt;
    if (elapsed > 0) this.velocityX = (x - this.lastX) / elapsed;
    this.lastX = x;
    this.lastAt = now;

    this.offset.set(rubberBandOffset(this.originOffset + dx, this.actionWidth()));
  };

  private readonly onTouchEnd = () => {
    if (!this.tracking) return;

    const axis = this.axis;
    const wasOpen = this.open();
    this.tracking = false;
    this.axis = 'pending';

    if (axis === 'horizontal') {
      this.suppressClick = true;
      const open = shouldSnapSwipeOpen(this.offset(), this.actionWidth(), this.velocityX);
      if (open) this.snapOpen();
      else this.close();
      return;
    }

    if (wasOpen && axis === 'pending') {
      this.suppressClick = true;
      this.close();
    }
  };

  private readonly onPaneClick = (event: Event) => {
    if (!this.suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    this.suppressClick = false;
  };
}
