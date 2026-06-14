import { Component, HostListener, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-pills',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  host: {
    class:
      'flex p-1 mb-2 bg-muted/60 rounded-full w-full max-w-xs mx-auto border border-border/50 transition-all duration-300 origin-top',
    '[class.scale-80]': 'isScrolled()',
    '[class.max-w-[200px]!]': 'isScrolled()',
    '[class.scale-100]': '!isScrolled()',
  },
})
export class NavPillsComponent {
  readonly disableScrollShrink = input<boolean>(false);
  readonly isScrolled = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    console.log('disable:', this.disableScrollShrink());

    if (this.disableScrollShrink()) return;

    const scrollOffset =
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    console.log(scrollOffset);

    this.isScrolled.set(scrollOffset > 20);
  }
}
