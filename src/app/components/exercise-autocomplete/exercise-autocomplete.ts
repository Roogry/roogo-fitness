import { Component, EventEmitter, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService, Exercise } from '../../shared/services/workout';
import { ZardInputDirective } from '../../shared/components/input/input.directive';
import { LucideAngularModule, Search, Plus } from 'lucide-angular';

@Component({
  selector: 'app-exercise-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule, ZardInputDirective, LucideAngularModule],
  template: `
    <div class="relative w-full">
      <div class="relative">
        <lucide-icon
          [img]="Search"
          class="absolute left-1.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        ></lucide-icon>
        <input
          z-input
          type="text"
          placeholder="Search exercises (e.g., Bench Press)"
          [ngModel]="searchQuery()"
          (ngModelChange)="onSearchChange($event)"
          [class]="'w-full pl-9 h-12'"
        />
        @if (isSearching()) {
          <div class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <div
              class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
            ></div>
          </div>
        }
      </div>

      <!-- Results list always shows if there are results or a query -->
      @if (results().length > 0 || searchQuery().trim()) {
        <div class="w-full mt-4 flex flex-col gap-3 pb-8">
          @for (exercise of results(); track exercise.id) {
            <div
              class="bg-card rounded-xl border border-border p-4 hover:border-primary/50 cursor-pointer flex justify-between items-center transition-all shadow-sm"
              (click)="selectExercise(exercise)"
            >
              <div class="flex flex-col">
                <span class="font-bold text-base">{{ exercise.name }}</span>
                <span class="text-sm text-muted-foreground mt-1">{{ exercise.muscle_group }}</span>
              </div>
              <lucide-icon
                [img]="Plus"
                class="h-5 w-5 text-muted-foreground opacity-50"
              ></lucide-icon>
            </div>
          }

          @if (!hasExactMatch() && searchQuery().trim() && !isSearching()) {
            <div
              class="bg-primary/5 rounded-xl border border-primary/20 p-4 hover:border-primary/50 cursor-pointer flex justify-between items-center transition-all shadow-sm"
              (click)="createNewExercise(searchQuery().trim())"
            >
              <div class="flex flex-col">
                <span class="font-bold text-base text-primary"
                  >Add "{{ searchQuery().trim() }}"</span
                >
                <span class="text-sm text-primary/70 mt-1">Create a new custom exercise</span>
              </div>
              <lucide-icon [img]="Plus" class="h-5 w-5 text-primary"></lucide-icon>
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './exercise-autocomplete.css',
})
export class ExerciseAutocomplete implements OnInit {
  readonly Search = Search;
  readonly Plus = Plus;
  private workoutService = inject(WorkoutService);

  @Output() exerciseSelected = new EventEmitter<Exercise>();

  searchQuery = signal<string>('');
  results = signal<Exercise[]>([]);
  isSearching = signal<boolean>(false);
  private searchTimeout: any;

  ngOnInit() {
    this.onSearchChange('');
  }

  hasExactMatch() {
    const query = this.searchQuery().trim().toLowerCase();
    return this.results().some((e) => e.name.toLowerCase() === query);
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (!query.trim()) {
      // Don't return early, let it delay and load the default list
    }

    this.isSearching.set(true);
    // Debounce search
    this.searchTimeout = setTimeout(async () => {
      try {
        const matches = await this.workoutService.searchExercises(query);
        this.results.set(matches);
      } finally {
        this.isSearching.set(false);
      }
    }, 300);
  }

  selectExercise(exercise: Exercise) {
    this.searchQuery.set('');
    this.results.set([]);
    this.exerciseSelected.emit(exercise);
  }

  createNewExercise(name: string) {
    const newEx = this.workoutService.addCustomExercise(name);
    this.selectExercise(newEx);
  }
}
