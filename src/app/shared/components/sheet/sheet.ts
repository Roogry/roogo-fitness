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
