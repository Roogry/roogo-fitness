import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/zard/button';

/**
 * A slide-in sheet on mobile, centered modal on desktop.
 */
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
  readonly title = input('');
  readonly description = input<string | null>(null);
  readonly isOpen = input<boolean>(false);

  readonly onOpenChange = output<boolean>();

  close() {
    this.onOpenChange.emit(false);
  }
}
