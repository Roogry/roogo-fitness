import { Muscle, Exercise, LoggedWorkoutSession } from '../types/workout.types';

export const mockMuscles: Muscle[] = [
  { id: 1, name: 'Upper Chest' },
  { id: 2, name: 'Midle Chest' },
  { id: 3, name: 'Lower Chest' },
  { id: 4, name: 'Front Delt' },
  { id: 5, name: 'Side Delt' },
  { id: 6, name: 'Back Delt' },
  { id: 7, name: 'Triceps' },
  { id: 8, name: 'Biceps' },
  { id: 9, name: 'Lats' },
  { id: 10, name: 'Traps' },
  { id: 11, name: 'Upper Back' },
  { id: 12, name: 'Quadriceps' },
  { id: 13, name: 'Hamstrings' },
  { id: 14, name: 'Gluteus' },
  { id: 15, name: 'Calves' },
  { id: 16, name: 'Core' },
];

export const mockExercises: Exercise[] = [
  {
    id: 1,
    name: 'Barbell Bench Press',
    short_description:
      'A compound push exercise that builds chest, shoulders, and triceps size and strength.',
    primary_muscle: mockMuscles[0],
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
    short_description: 'The king of all leg exercises, building quad and glute strength.',
    primary_muscle: mockMuscles[11],
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
  { id: 3, name: 'Deadlift', primary_muscle: mockMuscles[8], media: [] },
  { id: 4, name: 'Overhead Press', primary_muscle: mockMuscles[3], media: [] },
  { id: 5, name: 'Barbell Row', primary_muscle: mockMuscles[10], media: [] },
  { id: 6, name: 'Pull Up', primary_muscle: mockMuscles[8], media: [] },
  { id: 7, name: 'Dumbbell Curl', primary_muscle: mockMuscles[7], media: [] },
  { id: 8, name: 'Triceps Extension', primary_muscle: mockMuscles[6], media: [] },
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
