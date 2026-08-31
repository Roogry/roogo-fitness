import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ZardFormImports } from '@/shared/components/zard/form';
import { lucideDumbbell, lucideMinus, lucidePlus, lucideSave, lucideFlame } from '@ng-icons/lucide';
import { DbService } from '@/core/services/db.service';
import { PlanService } from '@/core/services/plan.service';
import { WorkoutPlan } from '@/shared/models';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { HeaderComponent } from '@/shared/components/header';
import { RooSheetComponent } from '@/shared/components/sheet';
import { PlanCardComponent } from '../../components/plan-card/plan-card';
import { WorkoutService } from '@/core/services/workout.service';
import { ZardDialogService } from '@/shared/components/zard/dialog';

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ZardButtonComponent,
    ZardInputDirective,
    RooSheetComponent,
    PlanCardComponent,
    NgIcon,
    FormField,
    ZardFormImports,
  ],
  providers: [
    provideIcons({
      lucideDumbbell,
      lucideMinus,
      lucidePlus,
      lucideSave,
      lucideFlame,
    }),
  ],
  templateUrl: './plan-list.html',
  styles: [
    `
      input[type='range']::-webkit-slider-thumb {
        appearance: none;
        width: 26px;
        height: 26px;
        border-radius: 9999px;
        background: var(--forest);
        border: 3px solid white;
        outline: 1px solid var(--hairline);
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      input[type='range']::-webkit-slider-thumb:active {
        transform: scale(1.15);
      }
      input[type='range']::-moz-range-thumb {
        width: 26px;
        height: 26px;
        border-radius: 9999px;
        background: var(--forest);
        border: 3px solid white;
        outline: 1px solid var(--hairline);
        cursor: pointer;
      }
    `,
  ],
})
export class PlanList implements OnInit {
  router = inject(Router);
  dbService = inject(DbService);
  workoutService = inject(WorkoutService);
  planService = inject(PlanService);
  dialogService = inject(ZardDialogService);

  isOpenPlanForm = signal(false);
  expandedPlanId = signal<number | null>(null);

  planModel = signal({
    title: '',
    description: '',
    sessionsPerWeek: 3,
  });

  planForm = form(this.planModel, (f) => {
    required(f.title, { message: 'Plan name is required' });
  });

  sliderPercent = () => {
    const v = this.planModel().sessionsPerWeek;
    return ((v - 1) / 6) * 100;
  };

  scheduleDescription = () => {
    const d = this.planModel().sessionsPerWeek;
    const map: Record<number, string> = {
      1: 'Easy start — recovery maximal, cocok untuk jaga konsistensi.',
      2: 'Balanced — 2×/minggu, progres santai tanpa burn-out.',
      3: 'Sweet spot — 3×/minggu, paling populer & mudah recover.',
      4: 'High focus — 4×/minggu, akselerasi hasil lebih cepat.',
      5: 'Intense — 5 hari, volume tinggi untuk push limit.',
      6: 'Beast mode — hampir tiap hari, komitmen serius.',
      7: 'Everyday warrior — 7/7 full commitment, recovery jadi kunci!',
    };
    return map[d] ?? '';
  };

  flameClass = () => {
    const d = this.planModel().sessionsPerWeek;
    if (d <= 2) return 'scale-[0.9] opacity-60 text-muted-foreground';
    if (d === 3) return 'scale-100 opacity-80 text-warning';
    if (d === 4) return 'scale-110 opacity-90 text-warning';
    if (d === 5) return 'scale-[1.2] opacity-100 text-warning animate-pulse';
    if (d === 6) return 'scale-[1.3] opacity-100 text-error animate-pulse';
    return 'scale-[1.45] opacity-100 text-error animate-pulse drop-shadow-[0_0_8px_rgba(229,83,61,0.4)]';
  };

  onSliderInput(event: Event) {
    const val = Number((event.target as HTMLInputElement).value);
    if (val >= 1 && val <= 7) {
      this.planModel.update((m) => ({ ...m, sessionsPerWeek: val }));
    }
  }

  myPlans = signal<WorkoutPlan[]>([]);

  async ngOnInit() {
    await this.loadPlans();
    const plans = this.myPlans();
    if (plans.length > 0 && !this.expandedPlanId()) {
      const firstRegular = plans.find((p) => !p.isDefault);
      this.expandedPlanId.set(firstRegular ? firstRegular.id : plans[0].id);
    }
  }

  startEmptyWorkout() {
    this.workoutService.startSessionFlow(null, null);
  }

  async loadPlans() {
    let plans = await this.dbService.getWorkoutPlans();
    let defaultPlan = plans.find((p) => p.isDefault);

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
    this.planModel.set({ title: '', description: '', sessionsPerWeek: 3 });
    this.planForm().reset();
    this.planService.selectedPlanId.set(null);
    this.isOpenPlanForm.set(true);
  }

  editPlan(event: Event, plan: WorkoutPlan) {
    event.stopPropagation();

    this.planModel.set({
      title: plan.title,
      description: plan.description || '',
      sessionsPerWeek: plan.days,
    });
    this.planForm().reset();
    this.planService.selectedPlanId.set(plan.id);
    this.isOpenPlanForm.set(true);
  }

  decrementSessions() {
    this.planModel.update((m) => ({
      ...m,
      sessionsPerWeek: m.sessionsPerWeek > 1 ? m.sessionsPerWeek - 1 : 1,
    }));
  }

  incrementSessions() {
    this.planModel.update((m) => ({
      ...m,
      sessionsPerWeek: m.sessionsPerWeek < 7 ? m.sessionsPerWeek + 1 : 7,
    }));
  }

  async deletePlan(event: Event, planId: number) {
    event.stopPropagation();

    const plans = this.myPlans();
    const planToDelete = plans.find((p) => p.id === planId);
    if (!planToDelete || planToDelete.isDefault) return;

    let defaultPlan = plans.find((p) => p.isDefault);

    // Move sessions from deleted plan to default plan
    if (defaultPlan && planToDelete.sessions.length > 0) {
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
    submit(this.planForm, async (f) => {
      const plans = this.myPlans();
      const titleVal = f.title().value().trim();
      const descVal = f.description().value().trim();
      const sessionsVal = Number(f.sessionsPerWeek().value());

      if (this.planService.selectedPlanId() !== null) {
        // Update existing
        const plan = plans.find((p) => p.id === this.planService.selectedPlanId());
        if (plan) {
          plan.title = titleVal;
          plan.description = descVal;
          plan.days = sessionsVal;
          await this.dbService.saveWorkoutPlan(plan);
        }
      } else {
        // Create new
        const newId = Date.now();
        const newPlan: WorkoutPlan = {
          id: newId,
          title: titleVal,
          description: descVal,
          days: sessionsVal,
          sessions: [],
        };
        await this.dbService.saveWorkoutPlan(newPlan);
        this.expandedPlanId.set(newId);
      }

      this.isOpenPlanForm.set(false);
      await this.loadPlans();
    });
  }
}
