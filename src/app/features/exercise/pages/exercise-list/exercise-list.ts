import { Component, inject, signal, linkedSignal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { ExerciseService } from '@/core/services/exercise.service';
import { MuscleService } from '@/core/services/muscle.service';
import { Exercise, Muscle } from '@/shared/models';
import { ZardCardComponent } from '@/shared/components/zard/card';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { ZardSelectComponent } from '@/shared/components/zard/select/select.component';
import { ZardSelectItemComponent } from '@/shared/components/zard/select/select-item.component';
import { ZardButtonComponent } from '@/shared/components/zard/button';
import { ZardInputDirective } from '@/shared/components/zard/input/input.directive';
import { HeaderComponent } from '@/shared/components/header/header.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideFilter, lucideX } from '@ng-icons/lucide';
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
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardButtonComponent,
    ZardInputDirective,
    HeaderComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideFilter,
      lucideX,
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
