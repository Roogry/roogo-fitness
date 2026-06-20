export interface RecentExerciseSessionSet {
  id: number;
  set_number: number;
  weight_lifted?: number;
  reps_completed?: number;
}

export interface RecentExerciseSession {
  id: number;
  sessionTitle: string;
  startTime: string;
  sets: RecentExerciseSessionSet[];
}

export interface JourneyStats {
  highestWeight: number;
  highestWeightReps: number;
  totalSets: number;
  lastLogged?: string;
  recentSessions: RecentExerciseSession[];
}
