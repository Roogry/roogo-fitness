import {
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardBadgeComponent } from '@/shared/components/zard/badge';
import { CreateExerciseOption } from '@/features/exercise/components/create-exercise-option/create-exercise-option';
import { ExerciseService } from '@/core/services/exercise.service';
import { Exercise } from '@/shared/models';
import { exerciseImageUrl } from '@/shared/utils/exercise-media.utils';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideDumbbell } from '@ng-icons/lucide';
import { SearchInput } from '@/shared/components/search-input/search-input';
import { sheetLeaveMs } from '@/shared/components/sheet/sheet.utils';
import { EXERCISE_SEARCH_DEBOUNCE_MS } from './exercise-autocomplete.constants';

@Component({
  selector: 'app-exercise-autocomplete',
  standalone: true,
  imports: [CommonModule, ZardBadgeComponent, NgIcon, CreateExerciseOption, SearchInput],
  providers: [provideIcons({ lucidePlus, lucideDumbbell })],
  templateUrl: './exercise-autocomplete.html',
  styleUrl: './exercise-autocomplete.css',
})
export class ExerciseAutocomplete implements OnDestroy {
  private readonly exerciseService = inject(ExerciseService);
  protected readonly exerciseImageUrl = exerciseImageUrl;

  /** False after the hosting sheet starts to close. The search resets once that animation ends. */
  readonly active = input(true);
  readonly exerciseSelected = output<Exercise>();

  readonly searchQuery = signal('');
  readonly results = signal<Exercise[]>([]);
  readonly isSearching = signal(false);

  private catalog: Exercise[] | null = null;
  private requestId = 0;
  private searchTimeout: ReturnType<typeof setTimeout> | undefined;
  /** Projected content is created while the sheet is still closed, so the first inactive state is not a close. */
  private hasBeenOpen = false;

  constructor() {
    effect((onCleanup) => {
      if (this.active()) {
        this.hasBeenOpen = true;
        untracked(() => {
          if (this.catalog === null && !this.searchQuery().trim()) void this.load('');
        });
        return;
      }
      if (!this.hasBeenOpen) return;
      const timer = setTimeout(() => this.resetSearch(), sheetLeaveMs());
      onCleanup(() => clearTimeout(timer));
    });
  }

  ngOnDestroy() {
    if (this.searchTimeout !== undefined) clearTimeout(this.searchTimeout);
    this.requestId += 1;
  }

  hasExactMatch() {
    const query = this.searchQuery().trim().toLowerCase();
    return this.results().some((exercise) => exercise.name.toLowerCase() === query);
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    if (this.searchTimeout !== undefined) clearTimeout(this.searchTimeout);

    if (!query.trim()) {
      if (this.catalog) {
        this.requestId += 1;
        this.isSearching.set(false);
        this.results.set(this.catalog);
        return;
      }
      void this.load('');
      return;
    }

    this.isSearching.set(true);
    this.searchTimeout = setTimeout(() => void this.load(query), EXERCISE_SEARCH_DEBOUNCE_MS);
  }

  selectExercise(exercise: Exercise) {
    this.exerciseSelected.emit(exercise);
  }

  async createNewExercise(name: string) {
    const newEx = await this.exerciseService.addCustomExercise(name);
    this.selectExercise(newEx);
  }

  /** Drop the query after the sheet has left the screen, and show the full list for the next open. */
  resetSearch(): void {
    if (this.searchTimeout !== undefined) clearTimeout(this.searchTimeout);
    this.requestId += 1;
    this.searchQuery.set('');
    this.isSearching.set(false);
    if (this.catalog) {
      this.results.set(this.catalog);
      return;
    }
    void this.load('');
  }

  private async load(query: string): Promise<void> {
    const requestId = ++this.requestId;
    const requested = query.trim();
    this.isSearching.set(true);
    try {
      const matches = await this.exerciseService.getExercises(requested);
      if (requestId !== this.requestId) return;
      if (!requested) this.catalog = matches;
      this.results.set(matches);
    } finally {
      if (requestId === this.requestId) this.isSearching.set(false);
    }
  }
}
