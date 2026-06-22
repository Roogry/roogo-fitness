import { Component, inject, signal, linkedSignal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { ExerciseService } from '@/core/services/exercise.service';
import { MuscleService } from '@/core/services/muscle.service';
import { Exercise, Muscle } from '@/shared/models';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardInputDirective } from '@/shared/components/zard/input/input.directive';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { RooSheetComponent } from '@/shared/components/sheet/sheet';
import { CircleMuscleCardComponent } from '@/shared/components/circle-muscle-card/circle-muscle-card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideFilter, lucideX, lucideChevronDown, lucideCheck } from '@ng-icons/lucide';
import { formatRange } from '@/shared/utils';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    ZardCardComponent,
    ZardBadgeComponent,
    ZardButtonComponent,
    ZardInputDirective,
    HeaderComponent,
    RooSheetComponent,
    CircleMuscleCardComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideFilter,
      lucideX,
      lucideChevronDown,
      lucideCheck,
    }),
  ],
  templateUrl: './exercise-list.html',
})
export class ExerciseList implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private muscleService = inject(MuscleService);

  queryParams = toSignal(this.route.queryParams);

  // Helper to parse parameter as array of strings
  private parseParamAsArray = (val: any): string[] => {
    if (!val) return [];
    return Array.isArray(val) ? val.map(String) : [String(val)];
  };

  // UI state for muscles list
  muscles = signal<Muscle[]>([]);

  // State signals
  allExercises = signal<Exercise[]>([]);

  selectedPrimaryMuscles = linkedSignal<string[]>(() =>
    this.parseParamAsArray(this.queryParams()?.['primary'])
  );

  selectedSecondaryMuscles = linkedSignal<string[]>(() =>
    this.parseParamAsArray(this.queryParams()?.['secondary'])
  );

  searchQuery = linkedSignal<string>(() =>
    this.queryParams()?.['query'] || ''
  );

  // Sheet filter states
  isPrimarySheetOpen = signal(false);
  isSecondarySheetOpen = signal(false);
  stagedPrimaryMuscles = signal<string[]>([]);
  stagedSecondaryMuscles = signal<string[]>([]);

  openPrimarySheet() {
    this.stagedPrimaryMuscles.set(this.selectedPrimaryMuscles());
    this.isPrimarySheetOpen.set(true);
  }

  openSecondarySheet() {
    this.stagedSecondaryMuscles.set(this.selectedSecondaryMuscles());
    this.isSecondarySheetOpen.set(true);
  }

  toggleStagedPrimary(id: string) {
    this.stagedPrimaryMuscles.update((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  toggleStagedSecondary(id: string) {
    this.stagedSecondaryMuscles.update((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  resetStagedPrimary() {
    this.stagedPrimaryMuscles.set([]);
  }

  resetStagedSecondary() {
    this.stagedSecondaryMuscles.set([]);
  }

  applyPrimaryFilters() {
    this.selectedPrimaryMuscles.set(this.stagedPrimaryMuscles());
    this.isPrimarySheetOpen.set(false);
  }

  applySecondaryFilters() {
    this.selectedSecondaryMuscles.set(this.stagedSecondaryMuscles());
    this.isSecondarySheetOpen.set(false);
  }

  constructor() {
    effect(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          primary: this.selectedPrimaryMuscles().length ? this.selectedPrimaryMuscles() : null,
          secondary: this.selectedSecondaryMuscles().length ? this.selectedSecondaryMuscles() : null,
          query: this.searchQuery() || null,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  async ngOnInit() {
    try {
      const list = await this.exerciseService.getExercises('');
      this.allExercises.set(list);

      const muscleList = await this.muscleService.getMuscles();
      this.muscles.set(muscleList);
    } catch (e) {
      console.error('Failed to load exercises list data', e);
    }
  }

  clearFilters() {
    this.selectedPrimaryMuscles.set([]);
    this.selectedSecondaryMuscles.set([]);
    this.searchQuery.set('');
  }

  formatRange = formatRange;

  filteredExercises = computed(() => {
    const exercises = this.allExercises();
    const query = this.searchQuery().toLowerCase().trim();
    const primaryIds = this.selectedPrimaryMuscles().map(Number);
    const secondaryIds = this.selectedSecondaryMuscles().map(Number);

    return exercises.filter((exercise) => {
      // 1. Search Logic
      const matchesSearch =
        !query ||
        exercise.name.toLowerCase().includes(query) ||
        (exercise.short_description &&
          exercise.short_description.toLowerCase().includes(query));

      // 2. Primary Muscle Logic
      const matchesPrimary =
        primaryIds.length === 0 ||
        (exercise.primary_muscle && primaryIds.includes(exercise.primary_muscle.id));

      // 3. Secondary Muscle Logic
      const matchesSecondary =
        secondaryIds.length === 0 ||
        (exercise.secondary_muscles &&
          exercise.secondary_muscles.some((sm) => secondaryIds.includes(sm.id)));

      return matchesSearch && matchesPrimary && matchesSecondary;
    });
  });
}
