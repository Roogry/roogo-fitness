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
    <header class="w-full backdrop-blur-md">
      <div class="container max-w-2xl mx-auto px-4 h-20 flex items-center justify-between relative">
        <div class="flex items-center gap-4">
          <!-- Left action area -->
          @if (showBackBtn()) {
            @if (backLink()) {
              <a
                [routerLink]="backLink()"
                z-button
                zType="secondary"
                zSize="icon-lg"
                zShape="circle"
              >
                <lucide-icon [img]="ArrowLeft"></lucide-icon>
                <span class="sr-only">Back</span>
              </a>
            } @else {
              <button
                (click)="backClick.emit()"
                z-button
                zType="secondary"
                zSize="icon-lg"
                zShape="circle"
              >
                <lucide-icon [img]="ArrowLeft"></lucide-icon>
                <span class="sr-only">Back</span>
              </button>
            }
          }
          <ng-content select="[left]"></ng-content>

          <!-- Centered title area -->
          <div
            class="flex items-center justify-center gap-3 font-bold text-2xl tracking-tight w-full max-w-sm truncate text-center"
          >
            <ng-content select="[title-icon]"></ng-content>
            @if (title()) {
              <h1 class="truncate">{{ title() }}</h1>
            }
          </div>
        </div>

        <!-- Right action area -->
        <div class="flex items-center">
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
