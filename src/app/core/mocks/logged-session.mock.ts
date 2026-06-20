import { LoggedSession } from '@/shared/models';

export const mockLoggedSessions: LoggedSession[] = [
  {
    id: 1001,
    user_id: Date.now(),
    session_title: 'Push Day Heavy',
    start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    total_duration: 45,
    total_weight_lifted: 3740,
    notes: 'Felt really strong on the bench press today. Knee is feeling better on squats.',
    workouts: [],
  },
];
