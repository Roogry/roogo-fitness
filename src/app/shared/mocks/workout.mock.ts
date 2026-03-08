import { Muscle, Exercise, LoggedWorkoutSession } from '../types/workout.types';

export const mockMuscles: Muscle[] = [
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

export const mockExercises: Exercise[] = [
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

export const mockLoggedWorkoutSessions: LoggedWorkoutSession[] = [
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
        exercise: mockExercises[0],
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
        exercise: mockExercises[1],
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
        exercise: mockExercises[5],
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
        exercise: mockExercises[3],
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
        exercise: mockExercises[1], // Squat
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
