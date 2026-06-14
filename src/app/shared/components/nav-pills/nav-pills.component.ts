import { Component, HostListener, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-pills',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    'class': 'flex p-1 bg-muted/60 rounded-full w-full max-w-xs mx-auto mb-2 border border-border/50 transition-all duration-300 origin-top',
    '[class.scale-90]': 'isScrolled()',
    '[class.opacity-90]': 'isScrolled()',
    '[class.scale-100]': '!isScrolled()',
  },
})
export class NavPillsComponent {
  readonly disableScrollShrink = input<boolean>(false);
  readonly isScrolled = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.disableScrollShrink()) {
      this.isScrolled.set(false);
      return;
    }
    const scrollOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled.set(scrollOffset > 20);
  }
}
