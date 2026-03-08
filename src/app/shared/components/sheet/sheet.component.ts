import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardButtonComponent } from '../button/button.component';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'roo-sheet',
  standalone: true,
  imports: [CommonModule, ZardButtonComponent, LucideAngularModule],
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm transition-opacity"
        (click)="close()"
      ></div>

      <!-- Sheet Container -->
      <div
        class="fixed z-[100] bg-white transition-transform bottom-0 left-0 right-0 h-[85vh] rounded-t-4xl md:top-0 md:bottom-0 md:left-auto md:right-0 md:h-full md:w-[450px] md:rounded-none md:border-l md:border-border slide-in flex flex-col"
      >
        <div class="pt-4 h-full flex flex-col">
          <!-- Sheet Indicator -->
          <div
            class="w-[50px] h-2 mb-4 bg-gray-200 mx-auto rounded-full cursor-pointer sm:hidden shrink-0"
            (click)="close()"
          ></div>

          <!-- Sheet Header -->
          <div class="px-4 sm:px-6 flex justify-between items-center shrink-0">
            <div class="flex flex-col gap-1">
              <h2 class="font-semibold text-xl tracking-tight">{{ title }}</h2>
              @if (description) {
                <p class="text-sm text-muted-foreground">{{ description }}</p>
              }
            </div>
            <button
              z-button
              zType="secondary"
              zSize="icon"
              zShape="circle"
              class="cursor-pointer"
              (click)="close()"
            >
              <lucide-icon [img]="X"></lucide-icon>
            </button>
          </div>

          <!-- Sheet Content -->
          <div class="px-4 sm:px-6 pt-6 pb-4 flex-1 overflow-y-auto w-full relative">
            <ng-content></ng-content>
          </div>
          
          <!-- Optional Sheet Footer -->
          <div class="px-4 sm:px-6">
            <ng-content select="[roo-sheet-footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `
})
export class RooSheetComponent {
  readonly X = X;

  @Input() title = '';
  @Input() description?: string;
  @Input() isOpen = false;
  
  @Output() isOpenChange = new EventEmitter<boolean>();

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }
}
