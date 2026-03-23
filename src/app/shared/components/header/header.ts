import { Component, inject, input, output } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  backLink = input<any[] | null>(null);
  backClick = output<void>();

  private router = inject(Router)
  private location = inject(Location)

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
