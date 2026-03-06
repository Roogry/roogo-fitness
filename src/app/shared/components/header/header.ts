import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { ZardButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ZardButtonComponent],
  template: `
    <header
      class="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-border"
    >
      <div class="container mx-auto px-4 h-14 flex items-center justify-center relative">
        <!-- Left action area -->
        <div class="absolute left-4 z-10 flex items-center gap-2">
          @if (showBackBtn()) {
            @if (backLink()) {
              <a [routerLink]="backLink()" z-button zType="ghost" zSize="icon">
                <lucide-icon [img]="ArrowLeft"></lucide-icon>
                <span class="sr-only">Back</span>
              </a>
            } @else {
              <button (click)="backClick.emit()" z-button zType="ghost" zSize="icon">
                <lucide-icon [img]="ArrowLeft"></lucide-icon>
                <span class="sr-only">Back</span>
              </button>
            }
          }
          <ng-content select="[left]"></ng-content>
        </div>

        <!-- Centered title area -->
        <div
          class="flex items-center justify-center gap-2 font-bold text-lg tracking-tight px-16 w-full max-w-sm truncate text-center"
        >
          <ng-content select="[title-icon]"></ng-content>
          @if (title()) {
            <h1 class="truncate">{{ title() }}</h1>
          }
        </div>

        <!-- Right action area -->
        <div class="absolute right-4 z-10 flex items-center">
          <ng-content select="[right]"></ng-content>
        </div>
      </div>
    </header>
  `,
  host: {
    class: 'block w-full',
  },
})
export class HeaderComponent {
  readonly ArrowLeft = ArrowLeft;
  title = input<string>('');
  showBackBtn = input<boolean>(false);
  backLink = input<string | any[] | null>(null);
  backClick = output<void>();
}
