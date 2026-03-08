import { Component, EventEmitter, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService, Exercise } from '../../shared/services/workout.service';
import { ZardInputDirective } from '../../shared/components/input/input.directive';
import { LucideAngularModule, Search, Plus, Dumbbell } from 'lucide-angular';

@Component({
  selector: 'app-exercise-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule, ZardInputDirective, LucideAngularModule],
  templateUrl: './exercise-autocomplete.html',
  styleUrl: './exercise-autocomplete.css',
})
export class ExerciseAutocomplete implements OnInit {
  readonly Search = Search;
  readonly Plus = Plus;
  readonly Dumbbell = Dumbbell;
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
