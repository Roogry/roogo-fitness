import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/components/header/header';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardSheetComponent } from '@/shared/components/sheet/sheet.component';
import {
  LucideAngularModule,
  Plus,
  Dumbbell,
  Calendar,
  ChevronRight,
  X,
  Save,
  Minus,
} from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { ZardInputDirective } from '@/shared/components/input';

@Component({
  selector: 'app-blueprint',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ZardCardComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardSheetComponent,
    LucideAngularModule,
    FormsModule,
  ],
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
  expandedPlanId: number | null = 1; // Default to first plan

  newPlan = {
    title: '',
    description: '',
    sessionsPerWeek: 3,
  };

  // Placeholder mock data for blueprint lists
  myPlans: any[] = [
    { 
      id: 1, 
      title: 'Push Pull Legs (PPL)', 
      days: 3, 
      sessions: [
        { id: 101, title: 'Push Day', exercises: 6 },
        { id: 102, title: 'Pull Day', exercises: 5 },
        { id: 103, title: 'Leg Day', exercises: 6 }
      ] 
    },
    { 
      id: 2, 
      title: 'Bro Split', 
      days: 5, 
      sessions: [
        { id: 201, title: 'Chest', exercises: 5 },
        { id: 202, title: 'Back', exercises: 6 },
        { id: 203, title: 'Shoulders', exercises: 5 },
        { id: 204, title: 'Legs', exercises: 6 },
        { id: 205, title: 'Arms', exercises: 7 }
      ] 
    }
  ];

  togglePlan(planId: number) {
    if (this.expandedPlanId === planId) {
      this.expandedPlanId = null;
    } else {
      this.expandedPlanId = planId;
    }
  }

  savePlan() {
    if (!this.newPlan.title.trim()) return;

    // Auto-expand the newly created plan
    const newId = Date.now();

    this.myPlans.push({
      id: newId,
      title: this.newPlan.title,
      days: this.newPlan.sessionsPerWeek,
      sessions: [],
    });

    this.expandedPlanId = newId;

    this.isCreatingPlan = false;
    this.newPlan = { title: '', description: '', sessionsPerWeek: 3 };
  }
}
