import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { RooSheetComponent } from '@/shared/components/sheet/sheet.component';
import { FormsModule } from '@angular/forms';
import { ZardInputDirective } from '@/shared/components/input';
import { HeaderComponent } from '@/shared/components/header/header';
import {
  LucideAngularModule,
  Plus,
  Dumbbell,
  Calendar,
  ChevronRight,
  X,
  Save,
  Minus,
  Edit,
  Trash2,
} from 'lucide-angular';

@Component({
  selector: 'app-blueprint',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ZardCardComponent,
    ZardButtonComponent,
    ZardInputDirective,
    RooSheetComponent,
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
  readonly Edit = Edit;
  readonly Trash2 = Trash2;

  isCreatingPlan = false;
  editingPlanId: number | null = null;
  expandedPlanId: number | null = 1; // Default to first plan

  newPlan = {
    title: '',
    description: '',
    sessionsPerWeek: 3,
  };

  // Placeholder mock data for blueprint lists
  myPlans: any[] = [
    {
      id: 0,
      title: 'My Session',
      days: 0,
      isDefault: true,
      sessions: [],
    },
    {
      id: 1,
      title: 'Push Pull Legs (PPL)',
      days: 3,
      sessions: [
        { id: 101, title: 'Push Day', exercises: 6 },
        { id: 102, title: 'Pull Day', exercises: 5 },
        { id: 103, title: 'Leg Day', exercises: 6 },
      ],
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
        { id: 205, title: 'Arms', exercises: 7 },
      ],
    },
  ];

  get displayedPlans() {
    const regularPlans = this.myPlans.filter((p) => !p.isDefault);
    const defaultPlan = this.myPlans.find((p) => p.isDefault);

    if (defaultPlan && defaultPlan.sessions && defaultPlan.sessions.length > 0) {
      return [...regularPlans, defaultPlan];
    }
    return regularPlans;
  }

  togglePlan(planId: number) {
    if (this.expandedPlanId === planId) {
      this.expandedPlanId = null;
    } else {
      this.expandedPlanId = planId;
    }
  }

  openCreateSheet() {
    this.editingPlanId = null;
    this.newPlan = { title: '', description: '', sessionsPerWeek: 3 };
    this.isCreatingPlan = true;
  }

  editPlan(plan: any, event: Event) {
    event.stopPropagation();
    this.editingPlanId = plan.id;
    this.newPlan = {
      title: plan.title,
      description: plan.description || '',
      sessionsPerWeek: plan.days,
    };
    this.isCreatingPlan = true;
  }

  deletePlan(planId: number, event: Event) {
    event.stopPropagation();

    const planIndex = this.myPlans.findIndex((p) => p.id === planId);
    if (planIndex === -1) return;

    const planToDelete = this.myPlans[planIndex];
    if (planToDelete.isDefault) return;

    const defaultPlan = this.myPlans.find((p) => p.isDefault);

    // Move sessions from deleted plan to default plan
    if (defaultPlan && planToDelete.sessions.length > 0) {
      defaultPlan.sessions = [...defaultPlan.sessions, ...planToDelete.sessions];
    }

    // Remove the plan
    this.myPlans.splice(planIndex, 1);

    if (this.expandedPlanId === planId) {
      this.expandedPlanId = defaultPlan ? defaultPlan.id : null;
    }
  }

  savePlan() {
    if (!this.newPlan.title.trim()) return;

    if (this.editingPlanId !== null) {
      // Update existing
      const plan = this.myPlans.find((p) => p.id === this.editingPlanId);
      if (plan) {
        plan.title = this.newPlan.title;
        plan.description = this.newPlan.description;
        plan.days = this.newPlan.sessionsPerWeek;
      }
    } else {
      // Create new
      const newId = Date.now();
      this.myPlans.push({
        id: newId,
        title: this.newPlan.title,
        description: this.newPlan.description,
        days: this.newPlan.sessionsPerWeek,
        sessions: [],
      });
      this.expandedPlanId = newId;
    }

    this.isCreatingPlan = false;
  }
}
