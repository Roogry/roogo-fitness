import { Component, inject, input, output } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { ZardButtonComponent } from '../zard/button/button.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ZardButtonComponent, NgIcon],
  providers: [provideIcons({ lucideArrowLeft })],
  templateUrl: './header.html',
  host: {
    class: 'block w-full z-99',
  },
})
export class HeaderComponent {
  title = input<string>('');
  showBackBtn = input<boolean>(false);
  backLink = input<any[] | null>(null);
  backClick = output<void>();

  private router = inject(Router);
  private location = inject(Location);

  goBack() {
    console.log(this.backLink());

    if (this.backLink()) {
      this.router.navigate(this.backLink()!);
    } else {
      this.location.back();
    }

    this.backClick.emit();
  }
}
