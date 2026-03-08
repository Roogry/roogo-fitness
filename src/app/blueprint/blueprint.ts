import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header/header';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { LucideAngularModule, Plus, Dumbbell, Calendar, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-blueprint',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ZardCardComponent, ZardButtonComponent, LucideAngularModule],
  templateUrl: './blueprint.html',
})
export class BlueprintComponent {
  readonly Plus = Plus;
  readonly Dumbbell = Dumbbell;
  readonly Calendar = Calendar;
  readonly ChevronRight = ChevronRight;

  // Placeholder mock data for blueprint lists
  myPlans = [
    { id: 1, title: 'Push Pull Legs (PPL)', days: 3, sessions: 3 },
    { id: 2, title: 'Bro Split', days: 5, sessions: 5 }
  ];
}
