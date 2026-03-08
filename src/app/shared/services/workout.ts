import { Injectable, computed, signal } from '@angular/core';

export interface ExerciseMedia {
  id: number;
  media_type: 'image' | 'video' | 'youtube' | string;
  media_url: string;
  display_order: number;
}

export interface Muscle {
  id: number;
  name: string;
  muscle_group: string;
  anatomy_image_url?: string;
}

export interface Exercise {
  id: number;
  name: string;
  short_description?: string;
  muscle_group: string; // Denormalized for UI convenience
  primary_muscle_id?: number;
  recommended_warmup_sets?: number;
  recommended_working_sets?: number;
  recommended_rpe?: number;
  recommended_rest_time_sec?: number;
  media: ExerciseMedia[];
  secondary_muscles?: string;
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

export interface LoggedSet {
  id: number;
  logged_workout_id: number;
  exercise_id: number;
  set_number: number;
  is_warmup: boolean;
  reps_completed: number;
  weight_lifted: number;
  rpe_logged?: number;
  rest_time_taken_sec?: number;
  completed_at?: string;
}

export interface LoggedWorkout {
  id: number;
  logged_workout_session_id?: number | null;
  session_exercises_id?: number | null;
  exercise_id: number;
  exercise?: Exercise; // Joined for UI convenience
  workout_title: string;
  sets: LoggedSet[];
}

export interface LoggedWorkoutSession {
  id: number;
  user_id: string;
  workout_session_id?: number | null;
  session_title: string;
  start_time: string;
  end_time?: string;
  total_duration: number;
  total_weight_lifted: number;
  notes?: string;
  workouts: LoggedWorkout[]; 
}

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  // Mock API Data
  private mockMuscles: Muscle[] = [
    { id: 1, name: 'Upper Chest', muscle_group: 'Chest' },
    { id: 2, name: 'Midle Chest', muscle_group: 'Chest' },
    { id: 3, name: 'Lower Chest', muscle_group: 'Chest' },
    { id: 4, name: 'Front Delt', muscle_group: 'Shoulders' },
    { id: 5, name: 'Side Delt', muscle_group: 'Shoulders' },
    { id: 6, name: 'Back Delt', muscle_group: 'Shoulders' },
    { id: 7, name: 'Triceps', muscle_group: 'Arms' },
    { id: 8, name: 'Biceps', muscle_group: 'Arms' },
    { id: 9, name: 'Lats', muscle_group: 'Back' },
    { id: 10, name: 'Traps', muscle_group: 'Back' },
    { id: 11, name: 'Upper Back', muscle_group: 'Back' },
    { id: 12, name: 'Quadriceps', muscle_group: 'Legs' },
    { id: 13, name: 'Hamstrings', muscle_group: 'Legs' },
    { id: 14, name: 'Gluteus', muscle_group: 'Legs' },
    { id: 15, name: 'Calves', muscle_group: 'Legs' },
    { id: 16, name: 'Core', muscle_group: 'Core' },
  ];

  private mockExercises: Exercise[] = [
    {
      id: 1,
      name: 'Barbell Bench Press',
      muscle_group: 'Chest',
      short_description:
        'A compound push exercise that builds chest, shoulders, and triceps size and strength.',
      primary_muscle_id: 1,
      recommended_warmup_sets: 2,
      recommended_working_sets: 3,
      recommended_rpe: 8,
      recommended_rest_time_sec: 120,
      media: [
        {
          id: 101,
          media_type: 'image',
          media_url:
            'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',
          display_order: 0,
        },
        {
          id: 102,
          media_type: 'youtube',
          media_url: 'https://www.youtube.com/embed/rT7DgCr-3pg',
          display_order: 1,
        },
      ],
    },
    {
      id: 2,
      name: 'Squat',
      muscle_group: 'Legs',
      short_description: 'The king of all leg exercises, building quad and glute strength.',
      media: [
        {
          id: 103,
          media_type: 'image',
          media_url:
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
          display_order: 0,
        },
      ],
    },
    { id: 3, name: 'Deadlift', muscle_group: 'Back', media: [] },
    { id: 4, name: 'Overhead Press', muscle_group: 'Shoulders', media: [] },
    { id: 5, name: 'Barbell Row', muscle_group: 'Back', media: [] },
    { id: 6, name: 'Pull Up', muscle_group: 'Back', media: [] },
    { id: 7, name: 'Dumbbell Curl', muscle_group: 'Arms', media: [] },
    { id: 8, name: 'Triceps Extension', muscle_group: 'Arms', media: [] },
  ];

  private mockLoggedWorkoutSessions: LoggedWorkoutSession[] = [
    {
      id: 1001,
      user_id: 'user-1',
      session_title: 'Push Day Heavy',
      start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
      total_duration: 45,
      total_weight_lifted: 3740,
      notes: 'Felt really strong on the bench press today. Knee is feeling better on squats.',
      workouts: [
        {
          id: 501,
          logged_workout_session_id: 1001,
          exercise_id: 1,
          exercise: this.mockExercises[0],
          workout_title: 'Barbell Bench Press',
          sets: [
            { id: 1, logged_workout_id: 501, exercise_id: 1, set_number: 1, is_warmup: false, reps_completed: 8, weight_lifted: 60 },
            { id: 2, logged_workout_id: 501, exercise_id: 1, set_number: 2, is_warmup: false, reps_completed: 8, weight_lifted: 65 },
            { id: 3, logged_workout_id: 501, exercise_id: 1, set_number: 3, is_warmup: false, reps_completed: 6, weight_lifted: 70 },
          ]
        },
        {
          id: 502,
          logged_workout_session_id: 1001,
          exercise_id: 2,
          exercise: this.mockExercises[1],
          workout_title: 'Squat',
          sets: [
            { id: 4, logged_workout_id: 502, exercise_id: 2, set_number: 1, is_warmup: false, reps_completed: 10, weight_lifted: 80 },
            { id: 5, logged_workout_id: 502, exercise_id: 2, set_number: 2, is_warmup: false, reps_completed: 8, weight_lifted: 90 },
            { id: 6, logged_workout_id: 502, exercise_id: 2, set_number: 3, is_warmup: false, reps_completed: 8, weight_lifted: 100 },
          ]
        }
      ]
    },
    {
      id: 1002,
      user_id: 'user-1',
      session_title: 'Quick Upper Body',
      start_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      end_time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000).toISOString(),
      total_duration: 35,
      total_weight_lifted: 760,
      notes: 'Quick upper body day. Need to eat more before.',
      workouts: [
        {
          id: 503,
          logged_workout_session_id: 1002,
          exercise_id: 6,
          exercise: this.mockExercises[5],
          workout_title: 'Pull Up',
          sets: [
            { id: 7, logged_workout_id: 503, exercise_id: 6, set_number: 1, is_warmup: false, reps_completed: 10, weight_lifted: 0 },
            { id: 8, logged_workout_id: 503, exercise_id: 6, set_number: 2, is_warmup: false, reps_completed: 8, weight_lifted: 0 },
          ]
        },
        {
          id: 504,
          logged_workout_session_id: 1002,
          exercise_id: 4,
          exercise: this.mockExercises[3],
          workout_title: 'Overhead Press',
          sets: [
            { id: 9, logged_workout_id: 504, exercise_id: 4, set_number: 1, is_warmup: false, reps_completed: 10, weight_lifted: 40 },
            { id: 10, logged_workout_id: 504, exercise_id: 4, set_number: 2, is_warmup: false, reps_completed: 8, weight_lifted: 45 },
          ]
        }
      ]
    },
    {
      id: 1003,
      user_id: 'user-1',
      session_title: 'Leg Day Volume',
      start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      end_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 79 * 60 * 1000).toISOString(),
      total_duration: 79,
      total_weight_lifted: 5200,
      notes: 'Grueling leg session. Need to stretch more.',
      workouts: [
        {
          id: 505,
          logged_workout_session_id: 1003,
          exercise_id: 2,
          exercise: this.mockExercises[1], // Squat
          workout_title: 'Squat',
          sets: [
             { id: 11, logged_workout_id: 505, exercise_id: 2, set_number: 1, is_warmup: false, reps_completed: 12, weight_lifted: 80 },
             { id: 12, logged_workout_id: 505, exercise_id: 2, set_number: 2, is_warmup: false, reps_completed: 10, weight_lifted: 90 },
             { id: 13, logged_workout_id: 505, exercise_id: 2, set_number: 3, is_warmup: false, reps_completed: 8, weight_lifted: 100 },
             { id: 14, logged_workout_id: 505, exercise_id: 2, set_number: 4, is_warmup: false, reps_completed: 8, weight_lifted: 110 },
          ]
        }
      ]
    }
  ];

  // State
  activeExercises = signal<TrackedExercise[]>([]);
  sessionStartTime = signal<number | null>(null);
  sessionDuration = signal<number>(0);
  private durationInterval: any;

  // Computed state for UI convenience
  hasActiveWorkout = computed(() => this.activeExercises().length > 0);
  
  totalVolume = computed(() => {
    return this.activeExercises().reduce((acc, tracked) => {
      const exerciseVolume = tracked.sets.reduce((setAcc, set) => setAcc + (set.weight_lifted * set.reps_completed), 0);
      return acc + exerciseVolume;
    }, 0);
  });

  totalSets = computed(() => {
    return this.activeExercises().reduce((acc, tracked) => acc + tracked.sets.length, 0);
  });

  constructor() {
    this.loadOfflineQueue();
  }

  startSessionTimer() {
    if (this.sessionStartTime()) return;
    
    this.sessionStartTime.set(Date.now());
    this.durationInterval = setInterval(() => {
      if (this.sessionStartTime()) {
         // duration in seconds
        this.sessionDuration.set(Math.floor((Date.now() - this.sessionStartTime()!) / 1000));
      }
    }, 1000);
  }

  stopSessionTimer() {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = undefined;
    }
  }

  formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}min ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}min ${secs}s`;
    }
    return `${secs}s`;
  }

  // --- Mock API Methods ---
  async searchExercises(query: string): Promise<Exercise[]> {
    // Simulate network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!query.trim()) return this.mockExercises;

    const lowerQuery = query.toLowerCase();
    return this.mockExercises.filter((e) => e.name.toLowerCase().includes(lowerQuery));
  }

  async getMuscles(): Promise<Muscle[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.mockMuscles;
  }

  async getLoggedWorkoutSessions(): Promise<LoggedWorkoutSession[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Simulate real fetching by ordering decending by start_time
    return [...this.mockLoggedWorkoutSessions].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  }

  // --- State Mutations ---
  async getExerciseById(id: number): Promise<Exercise | undefined> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.mockExercises.find((e) => e.id === id);
  }

  addCustomExercise(name: string): Exercise {
    const newExercise: Exercise = {
      id: Date.now(),
      name,
      muscle_group: 'Custom',
      media: [],
    };
    this.mockExercises.push(newExercise);
    return newExercise;
  }

  updateExercise(id: number, updates: Partial<Exercise>) {
    // Update in mock db
    const mockIdx = this.mockExercises.findIndex((e) => e.id === id);
    if (mockIdx !== -1) {
      this.mockExercises[mockIdx] = { ...this.mockExercises[mockIdx], ...updates };
    }

    // Update in active tracked exercises
    this.activeExercises.update((current) => {
      return current.map((te) => {
        if (te.exercise.id === id) {
          return { ...te, exercise: { ...te.exercise, ...updates } };
        }
        return te;
      });
    });
  }

  addTrackedExercise(exercise: Exercise) {
    this.startSessionTimer(); // Ensure timer runs if not already
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
      this.clearSession();
    } catch (error) {
      console.warn('Sync failed, saving to offline queue', error);
      this.queueForLater(payload);
      this.clearSession();
    }
    console.groupEnd();
  }

  private clearSession() {
    this.stopSessionTimer();
    this.sessionStartTime.set(null);
    this.sessionDuration.set(0);
    this.activeExercises.set([]);
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
