import { Component, EventEmitter, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { ZardInputDirective } from '@/shared/components/zard/input';
import { ExerciseService } from '@/core/services/exercise.service';
import { Exercise } from '@/shared/models';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucidePlus, lucideDumbbell } from '@ng-icons/lucide';

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
        const matches = await this.exerciseService.searchExercises(query);
        this.results.set(matches);
      } finally {
        this.isSearching.set(false);
      }
    }, 300);
  }

  selectExercise(exercise: Exercise) {
    this.exerciseSelected.emit(exercise);
  }

  async createNewExercise(name: string) {
    const newEx = await this.exerciseService.addCustomExercise(name);
    this.selectExercise(newEx);
  }
}
