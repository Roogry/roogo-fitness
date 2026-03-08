import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { ZardButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ZardButtonComponent],
  templateUrl: './header.html',
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
