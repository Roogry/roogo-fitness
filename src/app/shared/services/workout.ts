import { Injectable, computed, signal } from '@angular/core';

export interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
}

export interface WorkoutSet {
  id: string; // unique id for local editing
  exercise_id: number;
  set_number: number;
  weight_lifted: number;
  reps_completed: number;
}

export interface TrackedExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
}

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  // Mock API Data
  private mockExercises: Exercise[] = [
    { id: 1, name: 'Barbell Bench Press', muscle_group: 'Chest' },
    { id: 2, name: 'Squat', muscle_group: 'Legs' },
    { id: 3, name: 'Deadlift', muscle_group: 'Back' },
    { id: 4, name: 'Overhead Press', muscle_group: 'Shoulders' },
    { id: 5, name: 'Barbell Row', muscle_group: 'Back' },
    { id: 6, name: 'Pull Up', muscle_group: 'Back' },
    { id: 7, name: 'Dumbbell Curl', muscle_group: 'Arms' },
    { id: 8, name: 'Triceps Extension', muscle_group: 'Arms' },
  ];

  // State
  activeExercises = signal<TrackedExercise[]>([]);

  // Computed state for UI convenience
  hasActiveWorkout = computed(() => this.activeExercises().length > 0);

  constructor() {
    this.loadOfflineQueue();
  }

  // --- Mock API Methods ---
  async searchExercises(query: string): Promise<Exercise[]> {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockExercises.filter((e) => e.name.toLowerCase().includes(lowerQuery));
  }

  // --- State Mutations ---
  addTrackedExercise(exercise: Exercise) {
    this.activeExercises.update((current) => {
      // Prevent duplicates in active list
      if (current.find((te) => te.exercise.id === exercise.id)) {
        return current;
      }
      return [...current, { exercise, sets: [] }];
    });
  }

  removeTrackedExercise(exerciseId: number) {
    this.activeExercises.update((current) => current.filter((te) => te.exercise.id !== exerciseId));
  }

  addSet(exerciseId: number, weight: number, reps: number) {
    this.activeExercises.update((current) => {
      const index = current.findIndex((te) => te.exercise.id === exerciseId);
      if (index === -1) return current;

      const updatedExercises = [...current];
      const tracked = { ...updatedExercises[index] };
      const newSetNumber = tracked.sets.length + 1;

      tracked.sets = [
        ...tracked.sets,
        {
          id: crypto.randomUUID(),
          exercise_id: exerciseId,
          set_number: newSetNumber,
          weight_lifted: weight,
          reps_completed: reps,
        },
      ];

      updatedExercises[index] = tracked;
      return updatedExercises;
    });
  }

  updateSet(exerciseId: number, setId: string, updates: Partial<WorkoutSet>) {
    this.activeExercises.update((current) => {
      const index = current.findIndex((te) => te.exercise.id === exerciseId);
      if (index === -1) return current;

      const updatedExercises = [...current];
      const tracked = { ...updatedExercises[index] };

      tracked.sets = tracked.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s));

      updatedExercises[index] = tracked;
      return updatedExercises;
    });
  }

  removeSet(exerciseId: number, setId: string) {
    this.activeExercises.update((current) => {
      const index = current.findIndex((te) => te.exercise.id === exerciseId);
      if (index === -1) return current;

      const updatedExercises = [...current];
      const tracked = { ...updatedExercises[index] };

      tracked.sets = tracked.sets
        .filter((s) => s.id !== setId)
        .map((s, idx) => ({
          ...s,
          set_number: idx + 1, // Re-number sets
        }));

      updatedExercises[index] = tracked;
      return updatedExercises;
    });
  }

  // --- Syncing & Offline Storage ---
  async finishWorkout() {
    const workoutData = this.activeExercises();
    if (workoutData.length === 0) return;

    // Format for backend (from api_docs.json execution domain)
    const payload = {
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(), // Mocking immediate finish
      notes: 'Logged via local storage app',
      logged_sets: workoutData.flatMap((te) =>
        te.sets.map((s) => ({
          exercise_id: s.exercise_id,
          set_number: s.set_number,
          is_warmup: false,
          reps_completed: s.reps_completed,
          weight_lifted: s.weight_lifted,
          completed_at: new Date().toISOString(),
        })),
      ),
    };

    console.group('Syncing Session');
    console.log('Payload:', payload);

    try {
      // Simulate API Call
      if (!navigator.onLine) {
        throw new Error('Offline mode detected');
      }
      // Fake delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log('Sync Successful!');
      this.activeExercises.set([]); // Clear session
    } catch (error) {
      console.warn('Sync failed, saving to offline queue', error);
      this.queueForLater(payload);
      this.activeExercises.set([]); // Clear session even if offline
    }
    console.groupEnd();
  }

  private queueForLater(payload: any) {
    const queue = JSON.parse(localStorage.getItem('workout_offline_queue') || '[]');
    queue.push(payload);
    localStorage.setItem('workout_offline_queue', JSON.stringify(queue));
    alert('You are offline. Workout saved locally and will sync when connection is restored.');
  }

  private loadOfflineQueue() {
    const queue = JSON.parse(localStorage.getItem('workout_offline_queue') || '[]');
    if (queue.length > 0 && navigator.onLine) {
      console.log(`Found ${queue.length} offline workouts. Attempting to sync...`);
      // In a real app we would loop and sync these. For now we just log them.
      console.log('Pending Syncs:', queue);
      // localStorage.removeItem('workout_offline_queue');
    }
  }
}
