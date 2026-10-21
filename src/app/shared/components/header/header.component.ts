import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  ViewEncapsulation,
  ElementRef,
  AfterViewInit,
  signal,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { ZardButtonComponent } from '../zard/button/button.component';
import { ClassValue, mergeClasses } from '@/shared/utils';
import { headerVariants } from './header.variants';

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
export class HeaderComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly el = inject(ElementRef);

  readonly title = input<string>('');
  readonly transparent = input<boolean>(false);
  readonly showBackBtn = input<boolean>(false);
  readonly backLink = input<any[] | null>(null);
  readonly backReplaceUrl = input<boolean>(false);
  readonly class = input<ClassValue>('');

  readonly onBackClick = output<void>();

  readonly hasBottom = signal(false);

  protected readonly classes = computed(() =>
    mergeClasses(headerVariants({ transparent: this.transparent() }), this.class()),
  );

  ngAfterViewInit() {
    const bottomNode = this.el.nativeElement.querySelector('[bottom]');
    if (bottomNode) {
      Promise.resolve().then(() => this.hasBottom.set(true));
    }
  }

  goBack() {
    if (this.backLink()) {
      this.router.navigate(this.backLink()!, { replaceUrl: this.backReplaceUrl() });
    } else {
      this.location.back();
    }

    this.onBackClick.emit();
  }
}
