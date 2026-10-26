import {
  booleanAttribute,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { VisualViewportService } from '@/shared/visual-viewport/visual-viewport.service';
import { SheetScrollLockService } from './sheet-scroll-lock.service';
import { sheetLeaveMs } from './sheet.utils';

/** A slide-in sheet on mobile, centered modal on desktop. */
@Component({
  selector: 'app-sheet',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent, NgIcon],
  providers: [provideIcons({ lucideX })],
  templateUrl: './sheet.html',
  styles: `
    .sheet-panel-in {
      animation: sheetInMobile 0.32s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .sheet-frame-leave {
      animation: sheetOutMobile 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .sheet-backdrop-leave {
      animation: sheetBackdropOut 0.32s ease-out forwards;
    }

    @keyframes sheetInMobile {
      from {
        transform: translateY(100%);
        opacity: 0.98;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes sheetOutMobile {
      from {
        transform: translateY(0);
      }
      to {
        transform: translateY(100%);
      }
    }

    @keyframes sheetBackdropOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    @media (min-width: 768px) {
      .sheet-panel-in {
        animation: sheetInDesktop 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes sheetInDesktop {
        from {
          transform: translateY(12px) scale(0.96);
          opacity: 0;
        }
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .sheet-panel-in,
      .sheet-frame-leave,
      .sheet-backdrop-leave {
        animation: none;
      }
    }
  `,
})
export class RooSheetComponent {
  /** Starts the keyboard listener, and re-measures when the sheet's content resizes. */
  private readonly viewport = inject(VisualViewportService);
  private readonly scrollLock = inject(SheetScrollLockService);
  private readonly sheetContent = viewChild<ElementRef<HTMLElement>>('sheetContent');

  /** Stays true after the first open so the projected search can reset while hidden. */
  protected readonly mounted = signal(false);
  /** True while the close animation is still on screen. */
  protected readonly leaving = signal(false);
  /** Keeps the page pinned through the close animation. */
  private readonly pinned = signal(false);
  private leaveTimer: ReturnType<typeof setTimeout> | undefined;

  readonly title = input('');
  readonly description = input<string | null>(null);
  readonly isOpen = input<boolean>(false);
  /** When true the sheet always uses its full max height, so list length can't resize it. */
  readonly fixedHeight = input(false, { transform: booleanAttribute });

  readonly onOpenChange = output<boolean>();

  constructor() {
    effect((onCleanup) => {
      if (this.isOpen()) {
        this.clearLeave();
        this.leaving.set(false);
        this.mounted.set(true);
        this.pinned.set(true);
        return;
      }
      if (!this.mounted()) return;
      this.clearLeave();
      this.leaving.set(true);
      this.pinned.set(true);
      this.leaveTimer = setTimeout(() => {
        this.leaveTimer = undefined;
        this.leaving.set(false);
        this.pinned.set(false);
      }, sheetLeaveMs());
      onCleanup(() => this.clearLeave());
    });

    effect((onCleanup) => {
      if (!this.pinned()) return;
      this.scrollLock.lock();
      onCleanup(() => this.scrollLock.unlock());
    });

    effect((onCleanup) => {
      const content = this.sheetContent();
      if (!this.isOpen() || !content || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => {
        if (this.viewport.keyboardOpen()) this.viewport.remeasure();
      });
      observer.observe(content.nativeElement);
      onCleanup(() => observer.disconnect());
    });
  }

  close() {
    this.onOpenChange.emit(false);
  }

  private clearLeave(): void {
    if (this.leaveTimer === undefined) return;
    clearTimeout(this.leaveTimer);
    this.leaveTimer = undefined;
  }
}
