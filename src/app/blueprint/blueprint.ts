import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header/header';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardSheetComponent } from '@/shared/components/sheet/sheet.component';
import { LucideAngularModule, Plus, Dumbbell, Calendar, ChevronRight, X, Save, Minus } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blueprint',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ZardCardComponent, ZardButtonComponent, ZardSheetComponent, LucideAngularModule, FormsModule],
  templateUrl: './blueprint.html',
})
export class BlueprintComponent {
  readonly Plus = Plus;
  readonly Dumbbell = Dumbbell;
  readonly Calendar = Calendar;
  readonly ChevronRight = ChevronRight;
  readonly Save = Save;
  readonly Minus = Minus;
  readonly X = X;

  isCreatingPlan = false;
  
  newPlan = {
    title: '',
    description: '',
    sessionsPerWeek: 3
  };

  // Placeholder mock data for blueprint lists
  myPlans = [
    { id: 1, title: 'Push Pull Legs (PPL)', days: 3, sessions: 3 },
    { id: 2, title: 'Bro Split', days: 5, sessions: 5 }
  ];

  savePlan() {
    if (!this.newPlan.title.trim()) return;
    
    // Auto-expand the newly created plan
    const newId = Date.now();
    
    this.myPlans.push({
      id: newId,
      title: this.newPlan.title,
      days: this.newPlan.sessionsPerWeek,
      sessions: 0
    });
    
    this.isCreatingPlan = false;
    this.newPlan = { title: '', description: '', sessionsPerWeek: 3 };
  }
}
