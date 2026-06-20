import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/zard/button';

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
  @Input() title = '';
  @Input() description?: string;
  @Input() isOpen = false;

  @Output() onOpenChange = new EventEmitter<boolean>();

  close() {
    this.isOpen = false;
    this.onOpenChange.emit(false);
  }
}
