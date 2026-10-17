import {
  type ConnectedPosition,
  type FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayPositionBuilder,
  type OverlayRef,
  type ViewportMargin,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  type OnDestroy,
  type OnInit,
  output,
  PLATFORM_ID,
  Renderer2,
  signal,
  type TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import { filter, type Subscription } from 'rxjs';

import { mergeClasses } from '@/shared/utils/merge-classes';

import { popoverVariants } from './popover.variants';

export type ZardPopoverTrigger = 'click' | 'hover' | null;
export type ZardPopoverPlacement = 'top' | 'bottom' | 'left' | 'right' | 'bottomLeft';
export type ZardPopoverMotion = 'default' | 'spring';

/** Matches `--duration-menu-out` in styles.css. The pane stays up while the leave animation runs. */
export const MENU_LEAVE_MS = 160;

/** The menu's edge that touches the card is the scale origin. `bottom` means the menu flipped above. */
export function menuSpringOrigin(overlayY: string): 'menu-origin-top' | 'menu-origin-bottom' {
  return overlayY === 'bottom' ? 'menu-origin-bottom' : 'menu-origin-top';
}

/** Gap direction that matches the overlay offset. Above the card, the menu shifts up. */
export function menuSpringShift(overlayY: string): 'menu-shift-up' | 'menu-shift-down' {
  return overlayY === 'bottom' ? 'menu-shift-up' : 'menu-shift-down';
}

/** Side gap for a spring menu. The large clearance stays on the bottom only. */
const SPRING_EDGE_MARGIN_PX = 8;

/**
 * Below the card, then above it. Side fallbacks are omitted: a context menu should
 * flip vertically, not dock beside the card when the bottom is blocked.
 */
export function springMenuPositions(): ConnectedPosition[] {
  return [POPOVER_POSITIONS_MAP['bottom'], POPOVER_POSITIONS_MAP['top']];
}

/**
 * `bottomClearance` is the session bar, keyboard, or other chrome under the card.
 * CDK treats a single margin as every edge, which makes a phone-width menu look
 * like it does not fit and falls through to a side position.
 */
export function springViewportMargin(bottomClearance: number): ViewportMargin {
  return {
    top: SPRING_EDGE_MARGIN_PX,
    bottom: bottomClearance,
    start: SPRING_EDGE_MARGIN_PX,
    end: SPRING_EDGE_MARGIN_PX,
  };
}

const POPOVER_POSITIONS_MAP: { [key: string]: ConnectedPosition } = {
  top: {
    originX: 'center',
    originY: 'top',
    overlayX: 'center',
    overlayY: 'bottom',
    offsetX: 0,
    offsetY: -8,
  },
  bottom: {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'center',
    overlayY: 'top',
    offsetX: 0,
    offsetY: 8,
  },
  bottomLeft: {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetX: 0,
    offsetY: -48,
  },
  left: {
    originX: 'start',
    originY: 'center',
    overlayX: 'end',
    overlayY: 'center',
    offsetX: -8,
    offsetY: 0,
  },
  right: {
    originX: 'end',
    originY: 'center',
    overlayX: 'start',
    overlayY: 'center',
    offsetX: 8,
    offsetY: 0,
  },
} as const;

/**
 * A directive to display content in a popover overlaid on the UI.
 *
 * @example
 * <button [zPopover]="myPopover" zTrigger="click">Open Popover</button>
 * <ng-template #myPopover>Popover Content</ng-template>
 */
@Directive({
  selector: '[zPopover]',
  standalone: true,
  exportAs: 'zPopover',
})
export class ZardPopoverDirective implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly overlay = inject(Overlay);
  private readonly overlayPositionBuilder = inject(OverlayPositionBuilder);
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly platformId = inject(PLATFORM_ID);

  private overlayRef?: OverlayRef;
  private positionStrategy?: FlexibleConnectedPositionStrategy;
  private overlayRefSubscription?: Subscription;
  private listeners: (() => void)[] = [];
  private leaveTimer: ReturnType<typeof setTimeout> | undefined;
  private removeEscapeListener: (() => void) | undefined;

  readonly zTrigger = input<ZardPopoverTrigger>('click');
  readonly zContent = input.required<TemplateRef<unknown>>();
  readonly zPlacement = input<ZardPopoverPlacement>('bottom');
  readonly zOrigin = input<ElementRef>();
  readonly zVisible = input<boolean>(false);
  readonly zOverlayClickable = input<boolean>(true);
  /** Spring scale from the card edge. `default` keeps the popover's own enter animation. */
  readonly zMotion = input<ZardPopoverMotion>('default');
  /** Extra space the spring menu keeps clear, so it flips above the session bar or keyboard. */
  readonly zViewportMargin = input(8);
  readonly zVisibleChange = output<boolean>();

  private readonly isVisible = signal(false);

  get nativeElement() {
    return this.zOrigin()?.nativeElement ?? this.elementRef.nativeElement;
  }

  constructor() {
    toObservable(this.zVisible)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((visible) => {
        const currentlyVisible = this.isVisible();
        if (visible && !currentlyVisible) {
          this.show();
        } else if (!visible && currentlyVisible) {
          this.hide();
        }
      });

    toObservable(this.zTrigger)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((trigger) => {
        if (this.listeners.length) {
          this.unlistenAll();
        }
        this.setupTriggers();
        this.overlayRefSubscription?.unsubscribe();
        this.overlayRefSubscription = undefined;
        if (trigger === 'click' || this.zMotion() === 'spring') {
          this.subscribeToOverlayRef();
        }
      });
  }

  ngOnInit() {
    this.createOverlay();
  }

  ngOnDestroy() {
    this.cancelLeave();
    this.removeEscapeListener?.();
    this.unlistenAll();
    this.overlayRefSubscription?.unsubscribe();
    this.overlayRef?.dispose();
  }

  show() {
    if (this.isVisible()) {
      return;
    }

    this.cancelLeave();

    if (!this.overlayRef) {
      this.createOverlay();
    }

    // The keyboard can open after the overlay was created. Refresh before the next attach.
    this.syncSpringPosition();

    const templatePortal = new TemplatePortal(this.zContent(), this.viewContainerRef);
    this.overlayRef?.attach(templatePortal);
    this.playSpringEnter();
    this.listenForEscape();
    this.isVisible.set(true);
    this.zVisibleChange.emit(true);
  }

  hide() {
    if (!this.isVisible()) {
      return;
    }

    this.isVisible.set(false);
    this.zVisibleChange.emit(false);
    this.removeEscapeListener?.();
    this.removeEscapeListener = undefined;

    const pane = this.overlayRef?.overlayElement;
    if (this.zMotion() !== 'spring' || !pane) {
      this.overlayRef?.detach();
      return;
    }

    pane.classList.remove('menu-pop-in');
    pane.classList.add('menu-pop-out');
    this.leaveTimer = setTimeout(() => {
      this.leaveTimer = undefined;
      pane.classList.remove(
        'menu-pop-out',
        'menu-origin-top',
        'menu-origin-bottom',
        'menu-shift-up',
        'menu-shift-down',
      );
      if (this.overlayRef?.hasAttached()) {
        this.overlayRef.detach();
      }
    }, MENU_LEAVE_MS);
  }

  toggle() {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
  }

  private createOverlay() {
    if (isPlatformBrowser(this.platformId)) {
      const positionStrategy = this.overlayPositionBuilder
        .flexibleConnectedTo(this.nativeElement)
        .withPositions(this.getPositions())
        .withPush(false)
        .withFlexibleDimensions(false)
        .withViewportMargin(this.viewportMargin());

      this.positionStrategy = positionStrategy;

      if (this.zMotion() === 'spring') {
        positionStrategy.positionChanges
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((change) => {
            this.applySpringOrigin(change.connectionPair.overlayY);
          });
      }

      this.overlayRef = this.overlay.create({
        positionStrategy,
        hasBackdrop: false,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });
    }
  }

  private subscribeToOverlayRef(): void {
    const closesOnOutside = this.zTrigger() === 'click' || this.zMotion() === 'spring';
    if (
      this.zOverlayClickable() &&
      closesOnOutside &&
      isPlatformBrowser(this.platformId) &&
      this.overlayRef
    ) {
      this.overlayRefSubscription = this.overlayRef
        .outsidePointerEvents()
        .pipe(filter((event) => !this.nativeElement.contains(event.target)))
        .subscribe(() => this.hide());
    }
  }

  private setupTriggers() {
    const trigger = this.zTrigger();
    if (!trigger) {
      return;
    }

    if (trigger === 'click') {
      this.listeners.push(
        this.renderer.listen(this.nativeElement, 'click.stop', () => this.toggle()),
      );
    } else if (trigger === 'hover') {
      this.listeners.push(
        this.renderer.listen(this.nativeElement, 'mouseenter', () => this.show()),
      );

      this.listeners.push(
        this.renderer.listen(this.nativeElement, 'mouseleave', () => this.hide()),
      );
    }
  }

  private unlistenAll(): void {
    for (const listener of this.listeners) {
      listener();
    }
    this.listeners = [];
  }

  private cancelLeave() {
    if (this.leaveTimer === undefined) return;
    clearTimeout(this.leaveTimer);
    this.leaveTimer = undefined;
  }

  private syncSpringPosition() {
    if (this.zMotion() !== 'spring' || !this.positionStrategy) return;
    this.positionStrategy
      .withPositions(springMenuPositions())
      .withViewportMargin(springViewportMargin(this.zViewportMargin()));
  }

  private viewportMargin(): ViewportMargin {
    if (this.zMotion() !== 'spring') return 8;
    return springViewportMargin(this.zViewportMargin());
  }

  private playSpringEnter() {
    if (this.zMotion() !== 'spring') return;
    const pane = this.overlayRef?.overlayElement;
    if (!pane) return;
    pane.classList.remove('menu-pop-out');
    pane.classList.add('menu-pop-in', 'menu-origin-top', 'menu-shift-down');
  }

  private applySpringOrigin(overlayY: string) {
    const pane = this.overlayRef?.overlayElement;
    if (!pane) return;
    pane.classList.remove(
      'menu-origin-top',
      'menu-origin-bottom',
      'menu-shift-up',
      'menu-shift-down',
    );
    pane.classList.add(menuSpringOrigin(overlayY), menuSpringShift(overlayY));
  }

  private listenForEscape() {
    if (this.zMotion() !== 'spring' || !isPlatformBrowser(this.platformId)) return;
    this.removeEscapeListener?.();
    this.removeEscapeListener = this.renderer.listen(
      document,
      'keydown',
      (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || !this.isVisible()) return;
        this.hide();
      },
    );
  }

  private getPositions(): ConnectedPosition[] {
    if (this.zMotion() === 'spring') {
      return springMenuPositions();
    }

    const placement = this.zPlacement();
    const positions: ConnectedPosition[] = [];

    // Primary position
    const primaryConfig = POPOVER_POSITIONS_MAP[placement];
    positions.push({
      originX: primaryConfig.originX,
      originY: primaryConfig.originY,
      overlayX: primaryConfig.overlayX,
      overlayY: primaryConfig.overlayY,
      offsetX: primaryConfig.offsetX ?? 0,
      offsetY: primaryConfig.offsetY ?? 0,
    });

    // Fallback positions for better positioning when primary doesn't fit
    switch (placement) {
      case 'bottom':
        // Try top if bottom doesn't fit
        positions.push({
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetX: 0,
          offsetY: -8,
        });
        // If neither top nor bottom work, try right
        positions.push({
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
          offsetX: 8,
          offsetY: 0,
        });
        // Finally try left
        positions.push({
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center',
          offsetX: -8,
          offsetY: 0,
        });
        break;
      case 'bottomLeft':
        // Try bottom if bottomLeft doesn't fit
        positions.push({
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
          offsetX: 0,
          offsetY: 8,
        });
        // If neither bottomLeft nor bottom work, try top
        positions.push({
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetX: 0,
          offsetY: -8,
        });
        // Finally try left
        positions.push({
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center',
          offsetX: -8,
          offsetY: 0,
        });
        break;
      case 'top':
        // Try bottom if top doesn't fit
        positions.push({
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
          offsetX: 0,
          offsetY: 8,
        });
        // If neither top nor bottom work, try right
        positions.push({
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
          offsetX: 8,
          offsetY: 0,
        });
        // Finally try left
        positions.push({
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center',
          offsetX: -8,
          offsetY: 0,
        });
        break;
      case 'right':
        // Try left if right doesn't fit
        positions.push({
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center',
          offsetX: -8,
          offsetY: 0,
        });
        // If neither left nor right work, try bottom
        positions.push({
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
          offsetX: 0,
          offsetY: 8,
        });
        // Finally try top
        positions.push({
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetX: 0,
          offsetY: -8,
        });
        break;
      case 'left':
        // Try right if left doesn't fit
        positions.push({
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
          offsetX: 8,
          offsetY: 0,
        });
        // If neither left nor right work, try bottom
        positions.push({
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
          offsetX: 0,
          offsetY: 8,
        });
        // Finally try top
        positions.push({
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetX: 0,
          offsetY: -8,
        });
        break;
    }

    return positions;
  }
}

/**
 * A component representing the popover container.
 * Internal use for the zPopover directive.
 */
@Component({
  selector: 'z-popover',
  imports: [],
  standalone: true,
  template: ` <ng-content /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
  },
})
export class ZardPopoverComponent {
  readonly class = input<string>('');

  protected readonly classes = computed(() => mergeClasses(popoverVariants(), this.class()));
}
