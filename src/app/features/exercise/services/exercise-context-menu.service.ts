import {
  Overlay,
  type OverlayRef,
  type PositionStrategy,
  type ScrollStrategy,
} from '@angular/cdk/overlay';
import { ComponentPortal, DomPortal } from '@angular/cdk/portal';
import { Injectable, Injector, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { VisualViewportService } from '@/core/services/visual-viewport.service';
import { ExerciseContextMenu } from '../components/exercise-context-menu/exercise-context-menu';
import {
  fixedOriginFromVisualRect,
  menuSpringOrigin,
  placeContextMenu,
  visualViewportOffset,
  type VisualViewportOffset,
} from './exercise-context-menu-position';

/** Matches `--duration-menu-out`. The lifted card stays up while the leave animation runs. */
export const MENU_LEAVE_MS = 160;

/**
 * Session bar plus a gap. The keyboard offset is added on top so the menu flips
 * above the bar instead of sitting under it.
 */
const SESSION_BAR_CLEARANCE_PX = 96;

export interface ExerciseContextMenuRequest {
  exerciseId: number;
  card: HTMLElement;
  onReplace: () => void;
  onDelete: () => void;
}

/**
 * One touch context menu for the whole session. The open id is the only source of
 * truth: opening a card closes whatever was pressed or open before it.
 */
@Injectable({ providedIn: 'root' })
export class ExerciseContextMenuService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly viewport = inject(VisualViewportService);

  private readonly pressedId = signal<number | null>(null);
  private readonly openId = signal<number | null>(null);

  readonly pressedExerciseId = this.pressedId.asReadonly();
  readonly openExerciseId = this.openId.asReadonly();

  private stageRef: OverlayRef | undefined;
  private menuRef: OverlayRef | undefined;
  private stageStrategy: FrozenBoxStrategy | undefined;
  private menuStrategy: FrozenBoxStrategy | undefined;
  private scrollLock: ScrollStrategy | undefined;
  private liftHost: HTMLElement | undefined;
  private menuHost: HTMLElement | undefined;
  private sourceCard: HTMLElement | undefined;
  private sourceCardVisibility = '';
  private cardVisual: { top: number; left: number; width: number; height: number } | undefined;
  private menuVisual: { top: number; left: number } | undefined;
  private viewportOffset: VisualViewportOffset | undefined;
  private focusTarget: HTMLElement | null = null;
  private onReplace: (() => void) | undefined;
  private onDelete: (() => void) | undefined;
  private shouldRestoreFocus = true;
  private isLeaving = false;
  private leaveTimer: ReturnType<typeof setTimeout> | undefined;
  private backdropSub: Subscription | undefined;
  private menuSub: Subscription | undefined;
  private dismissArmed = false;
  private armFrame = 0;
  private windowWidth = 0;
  private windowHeight = 0;
  private viewportWidth = 0;
  private viewportHeight = 0;
  private viewportOffsetTop = 0;

  private readonly onEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    this.close();
  };

  private readonly onWindowResize = () => {
    if (window.innerWidth === this.windowWidth && window.innerHeight === this.windowHeight) return;
    this.close();
  };

  private readonly onVisualViewportChange = () => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const unchanged =
      viewport.width === this.viewportWidth &&
      viewport.height === this.viewportHeight &&
      viewport.offsetTop === this.viewportOffsetTop;
    if (unchanged) return;
    this.close();
  };

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationStart => event instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.close());
  }

  /** True when this card may start a press. Another card's press or menu blocks it. */
  canPress(exerciseId: number): boolean {
    const pressedId = this.pressedId();
    const openId = this.openId();
    const noOtherPress = pressedId === null || pressedId === exerciseId;
    const noOtherMenu = openId === null || openId === exerciseId;
    return noOtherPress && noOtherMenu;
  }

  press(exerciseId: number) {
    this.pressedId.set(exerciseId);
  }

  release(exerciseId: number) {
    if (this.pressedId() !== exerciseId) return;
    this.pressedId.set(null);
  }

  open(request: ExerciseContextMenuRequest) {
    if (this.stageRef) this.discardNow({ restoreFocus: false });

    this.pressedId.set(null);
    this.shouldRestoreFocus = true;
    this.onReplace = request.onReplace;
    this.onDelete = request.onDelete;
    this.rememberFocus(request.card);
    this.openId.set(request.exerciseId);
    this.liftCard(request.card);
    this.attachMenu();
    this.engageScrollLock();
    this.armDismissListeners();
  }

  close() {
    if (!this.stageRef || this.isLeaving) return;
    this.isLeaving = true;
    this.openId.set(null);
    document.removeEventListener('keydown', this.onEscape);
    this.detachDismissListeners();
    this.playLeave();
    this.leaveTimer = setTimeout(() => this.discardNow(), MENU_LEAVE_MS);
  }

  private choose(action: 'replace' | 'delete') {
    const callback = action === 'replace' ? this.onReplace : this.onDelete;
    this.shouldRestoreFocus = false;
    this.close();
    callback?.();
  }

  private rememberFocus(card: HTMLElement) {
    const active = document.activeElement;
    if (active instanceof HTMLElement && card.contains(active)) {
      this.focusTarget = active;
      return;
    }
    this.focusTarget = card.querySelector<HTMLElement>('[data-testid="exercise-name"]') ?? card;
  }

  /**
   * The stage pane is only the card's rectangle. A full-screen pane would sit above
   * the backdrop and steal the outside tap. The copy scales inside the pane so the
   * positioned box itself never transforms.
   *
   * The rect is read before the scroll lock. Block-scroll sets `html` to
   * `position: fixed`, and on iOS that shifts the fixed origin by the collapsed
   * URL bar. Positioning after that lock is what painted the copy a toolbar-height
   * too low, then slid it up during the bounce.
   */
  private liftCard(card: HTMLElement) {
    const rect = restingCardRect(card);
    const offset = this.captureViewport(rect);
    const fixed = fixedOriginFromVisualRect(rect, offset);
    const positionStrategy = new FrozenBoxStrategy(fixed.top, fixed.left, {
      width: rect.width,
      height: rect.height,
    });
    this.stageStrategy = positionStrategy;

    this.stageRef = this.overlay.create({
      positionStrategy,
      width: rect.width,
      height: rect.height,
      hasBackdrop: true,
      backdropClass: 'exercise-context-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      panelClass: 'exercise-context-stage',
      disposeOnNavigation: false,
      usePopover: false,
    });

    const host = document.createElement('div');
    host.className = 'context-card-enter h-full w-full border-2 border-lime ring-2 ring-lime';
    host.dataset['testid'] = 'exercise-context-card';

    const clone = card.cloneNode(true) as HTMLElement;
    stripCloneMarkers(clone);
    clone.classList.remove('long-press-squeeze');
    clone.setAttribute('inert', '');
    clone.setAttribute('aria-hidden', 'true');
    host.append(clone);
    this.liftHost = host;
    // DomPortal only moves a node that already has a parent.
    document.body.append(host);
    this.stageRef.attach(new DomPortal(host));
    // Attach defers positioning until after paint. Apply now, before the scroll lock.
    this.stageRef.updatePosition();
    this.hideSourceCard(card);
    document.addEventListener('keydown', this.onEscape);
    this.backdropSub = this.stageRef.backdropClick().subscribe(() => this.close());
  }

  private attachMenu() {
    if (!this.cardVisual || !this.viewportOffset) return;

    const positionStrategy = new FrozenBoxStrategy(0, 0);
    this.menuStrategy = positionStrategy;
    this.menuRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      panelClass: 'exercise-context-menu-pane',
      disposeOnNavigation: false,
      usePopover: false,
    });

    const portal = new ComponentPortal(ExerciseContextMenu, null, this.injector);
    const menu = this.menuRef.attach(portal);
    // Zoneless attach can leave the host empty until a check, which would place a 0px menu.
    menu.changeDetectorRef.detectChanges();
    const menuHost = menu.location.nativeElement as HTMLElement;
    this.menuHost = menuHost;
    const menuBox = menuHost.querySelector<HTMLElement>('[data-testid="exercise-context-menu"]');
    const clearance = SESSION_BAR_CLEARANCE_PX + Math.max(0, this.viewport.keyboardOffset());
    const placement = placeContextMenu({
      cardTop: this.cardVisual.top,
      cardLeft: this.cardVisual.left,
      cardWidth: this.cardVisual.width,
      cardHeight: this.cardVisual.height,
      menuWidth: menuBox?.offsetWidth ?? 0,
      menuHeight: menuBox?.offsetHeight ?? 0,
      viewportWidth: this.viewportOffset.width,
      viewportHeight: this.viewportOffset.height,
      bottomClearance: clearance,
    });
    this.menuVisual = placement;
    const fixed = fixedOriginFromVisualRect(placement, this.viewportOffset);
    positionStrategy.moveTo(fixed.top, fixed.left);
    this.menuRef.updatePosition();
    menuHost.classList.add(
      'context-menu-pop',
      menuSpringOrigin(placement.placedAbove ? 'bottom' : 'top'),
    );

    this.menuSub = new Subscription();
    this.menuSub.add(menu.instance.replaceClick.subscribe(() => this.choose('replace')));
    this.menuSub.add(menu.instance.deleteClick.subscribe(() => this.choose('delete')));
  }

  /** Read once, before scroll lock, so a later toolbar shift cannot rewrite the rect. */
  private captureViewport(rect: DOMRect): VisualViewportOffset {
    const offset = visualViewportOffset(window.visualViewport, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    this.viewportOffset = offset;
    this.cardVisual = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
    return offset;
  }

  private hideSourceCard(card: HTMLElement) {
    this.sourceCard = card;
    this.sourceCardVisibility = card.style.visibility;
    card.style.visibility = 'hidden';
  }

  private restoreSourceCard() {
    if (!this.sourceCard) return;
    this.sourceCard.style.visibility = this.sourceCardVisibility;
    this.sourceCard = undefined;
    this.sourceCardVisibility = '';
  }

  /**
   * Scroll lock runs only after both boxes have their fixed coordinates.
   * If enabling it changes `offsetTop` before paint, retarget those same visual
   * points once. Nothing subscribes to move them again.
   */
  private engageScrollLock() {
    const offsetBefore = this.viewportOffset;
    this.scrollLock = this.overlay.scrollStrategies.block();
    this.scrollLock.enable();
    if (!offsetBefore) return;

    const offsetAfter = visualViewportOffset(window.visualViewport, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    const offsetChanged =
      offsetAfter.offsetTop !== offsetBefore.offsetTop ||
      offsetAfter.offsetLeft !== offsetBefore.offsetLeft;
    if (!offsetChanged) return;

    this.viewportOffset = offsetAfter;
    this.pinToViewport(offsetAfter);
  }

  private pinToViewport(offset: VisualViewportOffset) {
    if (this.cardVisual && this.stageStrategy) {
      const fixed = fixedOriginFromVisualRect(this.cardVisual, offset);
      this.stageStrategy.moveTo(fixed.top, fixed.left);
      this.stageRef?.updatePosition();
    }
    if (this.menuVisual && this.menuStrategy) {
      const fixed = fixedOriginFromVisualRect(this.menuVisual, offset);
      this.menuStrategy.moveTo(fixed.top, fixed.left);
      this.menuRef?.updatePosition();
    }
  }

  private releaseScrollLock() {
    this.scrollLock?.disable();
    this.scrollLock = undefined;
  }

  private playLeave() {
    this.liftHost?.classList.remove('context-card-enter');
    this.liftHost?.classList.add('context-menu-leave');

    this.menuHost?.classList.remove('context-menu-pop');
    this.menuHost?.classList.add('context-menu-leave');

    this.stageRef?.backdropElement?.classList.remove('cdk-overlay-backdrop-showing');
  }

  /**
   * Block-scroll hides the scrollbar and fires resize. Arm after that frame, and
   * ignore a resize that did not change the window, so opening does not close itself.
   */
  private armDismissListeners() {
    this.detachDismissListeners();
    this.armFrame = requestAnimationFrame(() => {
      this.armFrame = 0;
      if (!this.stageRef || this.isLeaving) return;
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
      this.rememberViewport();
      this.dismissArmed = true;
      window.addEventListener('resize', this.onWindowResize);
      window.visualViewport?.addEventListener('resize', this.onVisualViewportChange);
      window.visualViewport?.addEventListener('scroll', this.onVisualViewportChange);
    });
  }

  private rememberViewport() {
    const viewport = window.visualViewport;
    this.viewportWidth = viewport?.width ?? window.innerWidth;
    this.viewportHeight = viewport?.height ?? window.innerHeight;
    this.viewportOffsetTop = viewport?.offsetTop ?? 0;
  }

  private detachDismissListeners() {
    if (this.armFrame) {
      cancelAnimationFrame(this.armFrame);
      this.armFrame = 0;
    }
    if (!this.dismissArmed) return;
    this.dismissArmed = false;
    window.removeEventListener('resize', this.onWindowResize);
    window.visualViewport?.removeEventListener('resize', this.onVisualViewportChange);
    window.visualViewport?.removeEventListener('scroll', this.onVisualViewportChange);
  }

  private discardNow(options?: { restoreFocus?: boolean }) {
    if (this.leaveTimer !== undefined) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = undefined;
    }
    this.isLeaving = false;
    this.detachDismissListeners();
    document.removeEventListener('keydown', this.onEscape);
    this.backdropSub?.unsubscribe();
    this.backdropSub = undefined;
    this.menuSub?.unsubscribe();
    this.menuSub = undefined;

    const menu = this.menuRef;
    const stage = this.stageRef;
    const liftHost = this.liftHost;
    this.menuRef = undefined;
    this.stageRef = undefined;
    this.stageStrategy = undefined;
    this.menuStrategy = undefined;
    this.liftHost = undefined;
    this.menuHost = undefined;
    this.cardVisual = undefined;
    this.menuVisual = undefined;
    this.viewportOffset = undefined;
    this.releaseScrollLock();
    this.restoreSourceCard();
    menu?.dispose();
    stage?.dispose();
    liftHost?.remove();

    this.openId.set(null);
    const focusTarget = this.focusTarget;
    this.focusTarget = null;
    this.onReplace = undefined;
    this.onDelete = undefined;
    const restore = options?.restoreFocus ?? this.shouldRestoreFocus;
    this.shouldRestoreFocus = true;
    if (restore && focusTarget?.isConnected) focusTarget.focus();
  }
}

/**
 * The press scale is still on the card when the long-press fires, and that
 * transition would keep the measured box small. Drop it before reading the rect
 * so the lifted copy matches the card at rest.
 */
function restingCardRect(card: HTMLElement): DOMRect {
  const previousTransition = card.style.transition;
  card.style.transition = 'none';
  card.classList.remove('long-press-squeeze');
  const rect = card.getBoundingClientRect();
  card.style.transition = previousTransition;
  return rect;
}

/**
 * Writes the same top/left on every apply, including the deferred one CDK runs
 * after the next render. The bounce must not have a second position to slide to.
 */
class FrozenBoxStrategy implements PositionStrategy {
  private overlayRef: OverlayRef | undefined;

  constructor(
    private top: number,
    private left: number,
    private readonly size?: { width: number; height: number },
  ) {}

  attach(overlayRef: OverlayRef) {
    this.overlayRef = overlayRef;
  }

  moveTo(top: number, left: number) {
    this.top = top;
    this.left = left;
  }

  apply() {
    const pane = this.overlayRef?.overlayElement;
    if (!pane) return;
    const style = pane.style;
    style.position = 'fixed';
    style.top = `${this.top}px`;
    style.left = `${this.left}px`;
    style.right = 'auto';
    style.bottom = 'auto';
    style.margin = '0';
    style.transform = 'none';
    style.transition = 'none';
    style.maxWidth = 'none';
    style.maxHeight = 'none';
    if (!this.size) return;
    style.width = `${this.size.width}px`;
    style.height = `${this.size.height}px`;
  }

  dispose() {
    this.overlayRef = undefined;
  }
}

function stripCloneMarkers(root: HTMLElement) {
  root.removeAttribute('id');
  root.removeAttribute('data-testid');
  for (const node of root.querySelectorAll<HTMLElement>('[id], [data-testid]')) {
    node.removeAttribute('id');
    node.removeAttribute('data-testid');
  }
}
