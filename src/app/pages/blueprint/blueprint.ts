import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DbService } from '@/shared/services/db.service';
import { WorkoutService } from '@/shared/services/workout.service';
import { WorkoutPlan, WorkoutPlanSession } from '@/shared/types/workout.types';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardPopoverComponent, ZardPopoverDirective } from '@/shared/components/popover';
import { FormsModule } from '@angular/forms';
import { ZardInputDirective } from '@/shared/components/input';
import { HeaderComponent } from '@/shared/components/header/header';
import { RooSheetComponent } from '@/shared/components/sheet/sheet';

import {
  LucideAngularModule,
  Plus,
  Dumbbell,
  Ellipsis,
  EllipsisVertical,
  Calendar,
  ChevronRight,
  X,
  Save,
  Minus,
  Pencil,
  FolderPlus,
  Trash2,
} from 'lucide-angular';

@Component({
  selector: 'app-blueprint',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    ZardCardComponent,
    ZardButtonComponent,
    ZardInputDirective,
    ZardPopoverComponent, 
    ZardPopoverDirective,
    RooSheetComponent,
    LucideAngularModule,
  ],
  templateUrl: './blueprint.html',
})
export class BlueprintComponent implements OnInit {
  readonly Plus = Plus;
  readonly Dumbbell = Dumbbell;
  readonly Ellipsis = Ellipsis;
  readonly EllipsisVertical = EllipsisVertical;
  readonly Calendar = Calendar;
  readonly ChevronRight = ChevronRight;
  readonly Save = Save;
  readonly Minus = Minus;
  readonly X = X;
  readonly Pencil = Pencil;
  readonly FolderPlus = FolderPlus;
  readonly Trash2 = Trash2;

  dbService = inject(DbService);
  workoutService = inject(WorkoutService);
  router = inject(Router);

  isOpenPlanForm = signal(false);
  isOpenPlanActions = signal(false);
  expandedPlanId = signal<number | null>(null);

  newPlan = {
    title: '',
    description: '',
    sessionsPerWeek: 3,
  };

  myPlans = signal<WorkoutPlan[]>([]);

  async ngOnInit() {
    await this.loadPlans();
    const plans = this.myPlans();
    if (plans.length > 0 && !this.expandedPlanId()) {
      const firstRegular = plans.find(p => !p.isDefault);
      this.expandedPlanId.set(firstRegular ? firstRegular.id : plans[0].id);
    }
  }

  async loadPlans() {
    let plans = await this.dbService.getWorkoutPlans();
    let defaultPlan = plans.find(p => p.isDefault);
    
    if (!defaultPlan) {
      defaultPlan = {
        id: Date.now(),
        title: 'My Session',
        days: 0,
        isDefault: true,
        sessions: [],
      };
      await this.dbService.saveWorkoutPlan(defaultPlan);
      plans.push(defaultPlan);
    }
    
    this.myPlans.set(plans);
  }

  get displayedPlans() {
    const plans = this.myPlans();
    const regularPlans = plans.filter((p) => !p.isDefault);
    const defaultPlan = plans.find((p) => p.isDefault);

    if (defaultPlan && defaultPlan.sessions && defaultPlan.sessions.length > 0) {
      return [...regularPlans, defaultPlan];
    }
    return regularPlans;
  }

  togglePlan(planId: number) {
    if (this.expandedPlanId() === planId) {
      this.expandedPlanId.set(null);
    } else {
      this.expandedPlanId.set(planId);
    }
  }

  openCreatePlanSheet() {
    this.newPlan = { title: '', description: '', sessionsPerWeek: 3 };
    this.workoutService.selectedPlanId.set(null);
    this.isOpenPlanForm.set(true);
  }

  openPlanActionsSheet(event: Event, planId: number) {
    event.stopPropagation();
    this.workoutService.selectedPlanId.set(planId);
  }

  openAddSession(event: Event, planId: number) {
    event.stopPropagation();

    this.workoutService.clearSession();
    this.workoutService.selectedPlanId.set(planId);
    this.workoutService.sessionTitle.set('New Session');
    this.router.navigate(['/blueprint/session/create']);
  }

  detailSession(planId: number, sessionId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/session/detail'], { queryParams: { planId, sessionId } });
  }

  startSession(planId: number, sessionId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/session/start'], { queryParams: { planId, sessionId } });
  }

  getExerciseNames(session: WorkoutPlanSession): string {
    if (!session.exercises || session.exercises.length === 0) {
      return 'No exercises added yet.';
    }
    return session.exercises.map(pe => pe.exercise.name).join(', ');
  }

  editPlan(event: Event, plan: WorkoutPlan) {
    event.stopPropagation();
    this.isOpenPlanActions.set(false);

    this.newPlan = {
      title: plan.title,
      description: plan.description || '',
      sessionsPerWeek: plan.days,
    };
    this.workoutService.selectedPlanId.set(plan.id);
    this.isOpenPlanForm.set(true);
  }

  async deletePlan(event: Event, planId: number) {
    event.stopPropagation();
    this.isOpenPlanActions.set(false);

    const plans = this.myPlans();
    const planToDelete = plans.find((p) => p.id === planId);
    if (!planToDelete || planToDelete.isDefault) return;

    let defaultPlan = plans.find((p) => p.isDefault);

    // Move sessions from deleted plan to default plan
    if (defaultPlan && planToDelete.sessions.length > 0) {
      // Need clone to trigger updates correctly if needed, but save to db is what matters
      defaultPlan.sessions = [...defaultPlan.sessions, ...planToDelete.sessions];
      await this.dbService.saveWorkoutPlan(defaultPlan);
    }

    // Remove the plan centrally
    await this.dbService.deleteWorkoutPlan(planId);

    if (this.expandedPlanId() === planId) {
      this.expandedPlanId.set(defaultPlan ? defaultPlan.id : null);
    }

    await this.loadPlans();
  }

  async savePlan() {
    if (!this.newPlan.title.trim()) return;

    const plans = this.myPlans();

    if (this.workoutService.selectedPlanId() !== null) {
      // Update existing
      const plan = plans.find((p) => p.id === this.workoutService.selectedPlanId());
      if (plan) {
        plan.title = this.newPlan.title;
        plan.description = this.newPlan.description;
        plan.days = this.newPlan.sessionsPerWeek;
        await this.dbService.saveWorkoutPlan(plan);
      }
    } else {
      // Create new
      const newId = Date.now();
      const newPlan: WorkoutPlan = {
        id: newId,
        title: this.newPlan.title,
        description: this.newPlan.description,
        days: this.newPlan.sessionsPerWeek,
        sessions: [],
      };
      await this.dbService.saveWorkoutPlan(newPlan);
      this.expandedPlanId.set(newId);
    }

    this.isOpenPlanForm.set(false);
    await this.loadPlans();
  }
}
