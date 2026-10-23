import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { KEYBOARD_OPEN_OFFSET_PX } from '@/shared/visual-viewport/visual-viewport.constants';
import { VisualViewportService } from '@/shared/visual-viewport/visual-viewport.service';
import { sheetMaxHeightAboveKeyboard } from './sheet.utils';

/** A slide-in sheet on mobile, centered modal on desktop. */
@Component({
  selector: 'app-sheet',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent, NgIcon],
  providers: [provideIcons({ lucideX })],
  templateUrl: './sheet.html',
  styles: `
    .sheet-panel {
      animation: sheetInMobile 0.32s cubic-bezier(0.16, 1, 0.3, 1);
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

    @media (min-width: 768px) {
      .sheet-panel {
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
  `,
})
export class RooSheetComponent {
  private readonly viewport = inject(VisualViewportService);

  readonly title = input('');
  readonly description = input<string | null>(null);
  readonly isOpen = input<boolean>(false);

  readonly onOpenChange = output<boolean>();

  /**
   * Keyboard inset in px. Null when the keyboard is closed so the desktop max-height classes apply.
   * A few dozen pixels is browser chrome, not the keyboard.
   */
  readonly keyboardLiftPx = computed(() => {
    const offset = this.viewport.keyboardOffset();
    if (offset <= KEYBOARD_OPEN_OFFSET_PX) return null;
    return offset;
  });

  readonly maxHeightAboveKeyboard = computed(() =>
    sheetMaxHeightAboveKeyboard(this.keyboardLiftPx() ?? 0, this.viewport.visualHeight()),
  );

  close() {
    this.onOpenChange.emit(false);
  }
}
