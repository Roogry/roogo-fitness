import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { ZardButtonComponent } from '../button';

@Component({
  selector: 'app-sheet',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent, LucideAngularModule],
  templateUrl: './sheet.html',
})
export class RooSheetComponent {
  readonly X = X;

  @Input() title = '';
  @Input() description?: string;
  @Input() isOpen = false;
  
  @Output() onOpenChange = new EventEmitter<boolean>();

  close() {
    this.isOpen = false;
    this.onOpenChange.emit(false);
  }
}
