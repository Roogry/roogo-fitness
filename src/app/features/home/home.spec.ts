import { TestBed } from '@angular/core/testing';
import { Home } from './home';
import { ActivatedRoute, Router } from '@angular/router';
import { DbService } from '@/core/services/db.service';
import { WorkoutService } from '@/core/services/workout.service';
import { MuscleService } from '@/core/services/muscle.service';
import { JourneyService } from '@/features/journey/services/journey.service';
import { WorkoutPlan, LoggedSession } from '@/shared/models';
import { vi } from 'vitest';

describe('Home Component - Next Session Detection', () => {
  let component: Home;

  const mockRouter = {
    navigate: vi.fn(),
  };

  const mockDbService = {
    getWorkoutPlans: vi.fn().mockResolvedValue([]),
    getExercises: vi.fn().mockResolvedValue([]),
    getMuscles: vi.fn().mockResolvedValue([]),
  };

  const mockWorkoutService = {
    getLoggedWorkoutSessions: vi.fn().mockResolvedValue([]),
    startSessionFlow: vi.fn(),
  };

  const mockMuscleService = {
    getMuscles: vi.fn().mockResolvedValue([]),
  };

  const mockJourneyService = {
    getDaysTrainedThisWeek: vi.fn().mockResolvedValue(0),
  };

  const mockActivatedRoute = {
    snapshot: { queryParams: {} },
    queryParams: { subscribe: vi.fn() },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: DbService, useValue: mockDbService },
        { provide: WorkoutService, useValue: mockWorkoutService },
        { provide: MuscleService, useValue: mockMuscleService },
        { provide: JourneyService, useValue: mockJourneyService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
  });

  it('should calculate the first session as next session when no sessions are logged this week', () => {
    const mockPlan: WorkoutPlan = {
      id: 1,
      title: 'PPL',
      days: 3,
      sessions: [
        { id: 101, title: 'Push', session_order: 0, exercises: [] },
        { id: 102, title: 'Pull', session_order: 1, exercises: [] },
        { id: 103, title: 'Legs', session_order: 2, exercises: [] },
      ],
    };

    component.updateNextSession(mockPlan, []);
    expect(component.nextSession()).toEqual(mockPlan.sessions[0]);
  });

  it('should calculate the next unlogged session in predefined order', () => {
    const mockPlan: WorkoutPlan = {
      id: 1,
      title: 'PPL',
      days: 3,
      sessions: [
        { id: 101, title: 'Push', session_order: 0, exercises: [] },
        { id: 102, title: 'Pull', session_order: 1, exercises: [] },
        { id: 103, title: 'Legs', session_order: 2, exercises: [] },
      ],
    };

    // Session 101 has been logged this week
    const now = new Date();
    const mockSessions: LoggedSession[] = [
      {
        id: 1,
        workout_plan_session_id: 101,
        session_title: 'Push',
        start_time: now.toISOString(),
        total_duration: 30,
        total_weight_lifted: 1000,
        workouts: [],
      },
    ];

    component.updateNextSession(mockPlan, mockSessions);
    expect(component.nextSession()).toEqual(mockPlan.sessions[1]); // should be 'Pull'
  });

  it('should return null when all sessions in plan are logged this week', () => {
    const mockPlan: WorkoutPlan = {
      id: 1,
      title: 'PPL',
      days: 3,
      sessions: [
        { id: 101, title: 'Push', session_order: 0, exercises: [] },
        { id: 102, title: 'Pull', session_order: 1, exercises: [] },
      ],
    };

    const now = new Date();
    const mockSessions: LoggedSession[] = [
      {
        id: 1,
        workout_plan_session_id: 101,
        session_title: 'Push',
        start_time: now.toISOString(),
        total_duration: 30,
        total_weight_lifted: 1000,
        workouts: [],
      },
      {
        id: 2,
        workout_plan_session_id: 102,
        session_title: 'Pull',
        start_time: now.toISOString(),
        total_duration: 30,
        total_weight_lifted: 1000,
        workouts: [],
      },
    ];

    component.updateNextSession(mockPlan, mockSessions);
    expect(component.nextSession()).toBeNull();
  });

  it('should hide completed sessions and limit mappedSessions to at most 3 sessions', () => {
    const mockPlan: WorkoutPlan = {
      id: 1,
      title: 'PPL',
      days: 5,
      sessions: [
        { id: 101, title: 'Push 1', session_order: 0, exercises: [] },
        { id: 102, title: 'Pull 1', session_order: 1, exercises: [] },
        { id: 103, title: 'Legs 1', session_order: 2, exercises: [] },
        { id: 104, title: 'Push 2', session_order: 3, exercises: [] },
        { id: 105, title: 'Pull 2', session_order: 4, exercises: [] },
      ],
    };

    // Sessions 101 and 103 have been logged this week
    const now = new Date();
    const mockSessions: LoggedSession[] = [
      {
        id: 1,
        workout_plan_session_id: 101,
        session_title: 'Push 1',
        start_time: now.toISOString(),
        total_duration: 30,
        total_weight_lifted: 1000,
        workouts: [],
      },
      {
        id: 2,
        workout_plan_session_id: 103,
        session_title: 'Legs 1',
        start_time: now.toISOString(),
        total_duration: 30,
        total_weight_lifted: 1000,
        workouts: [],
      },
    ];

    component.updateNextSession(mockPlan, mockSessions);
    // Should filter out 101 and 103. Remaining: 102, 104, 105.
    // The mappedSessions should be exactly [102, 104, 105].
    const mapped = component.mappedSessions();
    expect(mapped.length).toBe(3);
    expect(mapped[0].id).toBe(102);
    expect(mapped[1].id).toBe(104);
    expect(mapped[2].id).toBe(105);
    expect(component.nextSession()?.id).toBe(102);
  });
});
