import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { ZardButtonComponent } from '../zard/button/button.component';
import { ClassValue, mergeClasses } from '@/shared/utils';
import { headerVariants } from './header.variants';

/**
 * A shared header component with title and back navigation.
 * 
 * @property {string} title - The title displayed in the header.
 * @property {boolean} isTransparant - Whether the header background is transparent.
 * @property {boolean} showBackBtn - Whether to show the back navigation button.
 * @property {any[] | null} backLink - Optional specific router link array for back navigation.
 * @property {ClassValue} class - Additional CSS classes for styling.
 * @property {void} onBackClick - Event emitted when the back button is clicked.
 * 
 * @example
 * <app-header title="Dashboard" [showBackBtn]="true" (onBackClick)="handleBack()"></app-header>
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ZardButtonComponent, NgIcon],
  providers: [provideIcons({ lucideArrowLeft })],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly title = input<string>('');
  readonly isTransparant = input<boolean>(false);
  readonly showBackBtn = input<boolean>(false);
  readonly backLink = input<any[] | null>(null);
  readonly class = input<ClassValue>('');

  readonly onBackClick = output<void>();

  protected readonly classes = computed(() =>
    mergeClasses(headerVariants({ isTransparant: this.isTransparant() }), this.class()),
  );

  /**
   * Navigates the user back to the previous view or specified link.
   * 
   * @returns {void}
   * 
   * @example
   * headerComponent.goBack();
   */
  goBack() {
    if (this.backLink()) {
      this.router.navigate(this.backLink()!);
    } else {
      this.location.back();
    }

    this.onBackClick.emit();
  }
}
