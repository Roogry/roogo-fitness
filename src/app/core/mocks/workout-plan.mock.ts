import type { WorkoutPlan } from '@/shared/models';

export const mockWorkoutPlans: WorkoutPlan[] = [
  {
    id: 1,
    title: 'Push Pull Legs (PPL)',
    description: 'A 4 days/week PPL routine focusing on hypertrophy.',
    days: 4,
    isDefault: true,
    isActive: true,
    sessions: [
      {
        id: 5000,
        title: 'Pull #1',
        session_order: 0,
        exercises: [
          { id: 10000, exercise_order: 0, target_sets: 3, target_reps: 10, target_rest_time: 180, exercise_id: 100 },
          { id: 10001, exercise_order: 1, target_sets: 3, target_reps: 10, target_rest_time: 180, exercise_id: 101 },
          { id: 10002, exercise_order: 2, target_sets: 2, target_reps: 15, target_rest_time: 120, exercise_id: 102 },
          { id: 10003, exercise_order: 3, target_sets: 3, target_reps: 12, target_rest_time: 120, exercise_id: 103 },
          { id: 10004, exercise_order: 4, target_sets: 3, target_reps: 15, target_rest_time: 120, exercise_id: 104 },
          { id: 10005, exercise_order: 5, target_sets: 2, target_reps: 12, target_rest_time: 120, exercise_id: 105 },
        ],
      },
      {
        id: 5001,
        title: 'Push #1',
        session_order: 1,
        exercises: [
          { id: 10006, exercise_order: 0, target_sets: 3, target_reps: 12, target_rest_time: 120, exercise_id: 106 },
          { id: 10007, exercise_order: 1, target_sets: 3, target_reps: 10, target_rest_time: 300, exercise_id: 107 },
          { id: 10008, exercise_order: 2, target_sets: 2, target_reps: 10, target_rest_time: 180, exercise_id: 108 },
          { id: 10009, exercise_order: 3, target_sets: 3, target_reps: 12, target_rest_time: 180, exercise_id: 109 },
          { id: 10010, exercise_order: 4, target_sets: 2, target_reps: 15, target_rest_time: 120, exercise_id: 110 },
          { id: 10011, exercise_order: 5, target_sets: 2, target_reps: 20, target_rest_time: 120, exercise_id: 111 },
        ],
      },
      {
        id: 5002,
        title: 'Legs #1',
        session_order: 2,
        exercises: [
          { id: 10012, exercise_order: 0, target_sets: 3, target_reps: 10, target_rest_time: 120, exercise_id: 112 },
          { id: 10013, exercise_order: 1, target_sets: 3, target_reps: 8, target_rest_time: 300, exercise_id: 113 },
          { id: 10014, exercise_order: 2, target_sets: 3, target_reps: 12, target_rest_time: 180, exercise_id: 114 },
          { id: 10015, exercise_order: 3, target_sets: 3, target_reps: 12, target_rest_time: 120, exercise_id: 115 },
          { id: 10016, exercise_order: 4, target_sets: 3, target_reps: 20, target_rest_time: 120, exercise_id: 116 },
          { id: 10017, exercise_order: 5, target_sets: 3, target_reps: 15, target_rest_time: 120, exercise_id: 117 },
        ],
      },
      {
        id: 5003,
        title: 'Arms & Weak Points #1',
        session_order: 3,
        exercises: [
          { id: 10018, exercise_order: 0, target_sets: 3, target_reps: 12, target_rest_time: 180, exercise_id: 118 },
          { id: 10019, exercise_order: 1, target_sets: 3, target_reps: 12, target_rest_time: 180, exercise_id: 119 },
          { id: 10020, exercise_order: 2, target_sets: 3, target_reps: 12, target_rest_time: 120, exercise_id: 120 },
          { id: 10021, exercise_order: 3, target_sets: 3, target_reps: 12, target_rest_time: 120, exercise_id: 121 },
          { id: 10022, exercise_order: 4, target_sets: 2, target_reps: 15, target_rest_time: 120, exercise_id: 122 },
          { id: 10023, exercise_order: 5, target_sets: 2, target_reps: 15, target_rest_time: 120, exercise_id: 123 },
          { id: 10024, exercise_order: 6, target_sets: 3, target_reps: 20, target_rest_time: 120, exercise_id: 124 },
        ],
      },
      {
        id: 5004,
        title: 'Pull #2',
        session_order: 4,
        exercises: [
          { id: 10025, exercise_order: 0, target_sets: 3, target_reps: 10, target_rest_time: 240, exercise_id: 125 },
          { id: 10026, exercise_order: 1, target_sets: 3, target_reps: 10, target_rest_time: 180, exercise_id: 126 },
          { id: 10027, exercise_order: 2, target_sets: 2, target_reps: 12, target_rest_time: 120, exercise_id: 127 },
          { id: 10028, exercise_order: 3, target_sets: 3, target_reps: 15, target_rest_time: 120, exercise_id: 128 },
          { id: 10029, exercise_order: 4, target_sets: 3, target_reps: 12, target_rest_time: 120, exercise_id: 129 },
          { id: 10030, exercise_order: 5, target_sets: 3, target_reps: 12, target_rest_time: 120, exercise_id: 130 },
        ],
      },
      {
        id: 5005,
        title: 'Push #2',
        session_order: 5,
        exercises: [
          { id: 10031, exercise_order: 0, target_sets: 3, target_reps: 15, target_rest_time: 120, exercise_id: 131 },
          { id: 10032, exercise_order: 1, target_sets: 3, target_reps: 12, target_rest_time: 180, exercise_id: 132 },
          { id: 10033, exercise_order: 2, target_sets: 3, target_reps: 12, target_rest_time: 180, exercise_id: 133 },
          { id: 10034, exercise_order: 3, target_sets: 3, target_reps: 12, target_rest_time: 120, exercise_id: 134 },
          { id: 10035, exercise_order: 4, target_sets: 3, target_reps: 12, target_rest_time: 120, exercise_id: 135 },
        ],
      },
      {
        id: 5006,
        title: 'Legs #2',
        session_order: 6,
        exercises: [
          { id: 10036, exercise_order: 0, target_sets: 3, target_reps: 10, target_rest_time: 300, exercise_id: 136 },
          { id: 10037, exercise_order: 1, target_sets: 3, target_reps: 10, target_rest_time: 300, exercise_id: 137 },
          { id: 10038, exercise_order: 2, target_sets: 2, target_reps: 12, target_rest_time: 180, exercise_id: 138 },
          { id: 10039, exercise_order: 2, target_sets: 2, target_reps: 12, target_rest_time: 120, exercise_id: 139 },
          { id: 10040, exercise_order: 4, target_sets: 3, target_reps: 12, target_rest_time: 120, exercise_id: 140 },
        ],
      },
    ],
  },
];
