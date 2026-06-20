import { Component, EventEmitter, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { ExerciseService } from '@/core/services/exercise.service';
import { Exercise } from '@/shared/models';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucidePlus, lucideDumbbell } from '@ng-icons/lucide';

/**
 * An autocomplete input component for searching and selecting exercises.
 * Allows creating a new exercise if it doesn't exist.
 *
 * @example
 * <app-exercise-autocomplete (exerciseSelected)="onSelect($event)"></app-exercise-autocomplete>
 */
@Component({
  selector: 'app-exercise-autocomplete',
  standalone: true,
  imports: [CommonModule, ZardBadgeComponent, ZardInputDirective, NgIcon],
  providers: [provideIcons({ lucideSearch, lucidePlus, lucideDumbbell })],
  templateUrl: './exercise-autocomplete.html',
  styleUrl: './exercise-autocomplete.css',
})
export class ExerciseAutocomplete implements OnInit {
  private exerciseService = inject(ExerciseService);

  @Output() exerciseSelected = new EventEmitter<Exercise>();

  searchQuery = signal<string>('');
  results = signal<Exercise[]>([]);
  isSearching = signal<boolean>(false);
  private searchTimeout: any;

  ngOnInit() {
    this.onSearchChange('');
  }

  /**
   * Checks if the current search query has an exact match in the results.
   *
   * @returns {boolean} True if an exact match exists, otherwise false.
   *
   * @example
   * const isExact = this.hasExactMatch();
   */
  hasExactMatch() {
    const query = this.searchQuery().trim().toLowerCase();
    return this.results().some((e) => e.name.toLowerCase() === query);
  }

  /**
   * Handles changes to the search input, debouncing the query to fetch results.
   *
   * @param {string} query - The search string entered by the user.
   *
   * @example
   * this.onSearchChange("bench");
   */
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
        const matches = await this.exerciseService.getExercises(query);
        this.results.set(matches);
      } finally {
        this.isSearching.set(false);
      }
    }, 300);
  }

  /**
   * Emits the selected exercise event.
   *
   * @param {Exercise} exercise - The selected exercise.
   *
   * @example
   * this.selectExercise(myExercise);
   */
  selectExercise(exercise: Exercise) {
    this.exerciseSelected.emit(exercise);
  }

  /**
   * Creates a new custom exercise and automatically selects it.
   *
   * @param {string} name - The name of the new exercise.
   *
   * @example
   * await this.createNewExercise("My Custom Squat");
   */
  async createNewExercise(name: string) {
    const newEx = await this.exerciseService.addCustomExercise(name);
    this.selectExercise(newEx);
  }
}
