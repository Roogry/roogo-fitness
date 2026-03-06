import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
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

      @if (results().length > 0 || (searchQuery().trim() && !isSearching())) {
        <div
          class="absolute bg-white rounded-md border border-border z-50 w-full mt-2 overflow-hidden shadow-lg"
        >
          @for (exercise of results(); track exercise.id) {
            <div
              class="px-4 py-3 hover:bg-muted cursor-pointer flex justify-between items-center transition-colors border-b border-border last:border-0"
              (click)="selectExercise(exercise)"
            >
              <div class="flex flex-col">
                <span class="font-medium text-sm">{{ exercise.name }}</span>
                <span class="text-xs text-muted-foreground mt-0.5">{{
                  exercise.muscle_group
                }}</span>
              </div>
            </div>
          }

          @if (!hasExactMatch() && searchQuery().trim() && !isSearching()) {
            <div
              class="px-4 py-3 hover:bg-primary/5 cursor-pointer flex justify-between items-center transition-colors border-b border-border last:border-0"
              (click)="createNewExercise(searchQuery().trim())"
            >
              <div class="flex items-center gap-2 text-primary">
                <lucide-icon [img]="Plus" class="h-4 w-4"></lucide-icon>
                <span class="font-medium text-sm">Add "{{ searchQuery().trim() }}"</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './exercise-autocomplete.css',
})
export class ExerciseAutocomplete {
  readonly Search = Search;
  readonly Plus = Plus;
  private workoutService = inject(WorkoutService);

  @Output() exerciseSelected = new EventEmitter<Exercise>();

  searchQuery = signal<string>('');
  results = signal<Exercise[]>([]);
  isSearching = signal<boolean>(false);
  private searchTimeout: any;

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
      this.results.set([]);
      this.isSearching.set(false);
      return;
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
