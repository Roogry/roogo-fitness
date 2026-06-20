import { Component, Input, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/zard/button';

/**
 * A slide-in sheet component for displaying content or forms overlaying the screen.
 *
 * @property {string} title - The title of the sheet header. Defaults to empty string.
 * @property {string | null} description - The description or subtitle displayed below the title. Defaults to null.
 * @property {boolean} isOpen - Whether the sheet is currently open and visible. Defaults to false.
 * @property {boolean} onOpenChange - Event emitted when the open state of the sheet changes.
 *
 * @example
 * <app-sheet title="Edit Session" [isOpen]="isSheetOpen" (onOpenChange)="isSheetOpen = $event">
 *   <!-- Content here -->
 * </app-sheet>
 */
@Component({
  selector: 'app-sheet',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent, NgIcon],
  providers: [provideIcons({ lucideX })],
  templateUrl: './sheet.html',
  styles: `
    .slide-in {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideIn {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    @media (min-width: 768px) {
      .slide-in {
        animation: slideInMd 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes slideInMd {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
    }
  `,
})
export class RooSheetComponent {
  readonly title = input('');
  readonly description = input<string | null>(null);
  readonly isOpen = input<boolean>(false);

  readonly onOpenChange = output<boolean>();

  /**
   * Closes the sheet and emits the onOpenChange event.
   *
   * @returns {void}
   *
   * @example
   * sheetComponent.close();
   */
  close() {
    this.onOpenChange.emit(false);
  }
}
